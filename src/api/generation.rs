use axum::{
    Json,
    body::Body,
    extract::Path,
    http::{HeaderMap, HeaderValue, StatusCode, header},
    response::{IntoResponse, Response},
};
use serde::{Deserialize, Serialize};
use std::{
    collections::HashMap,
    path::{Path as FilePath, PathBuf},
    process::Stdio,
    sync::OnceLock,
};
use tokio::{process::Command, sync::Mutex};

#[derive(Deserialize)]
pub struct CreateRequest {
    upload_id: String,
}

#[derive(Clone, Serialize)]
struct TaskView {
    id: String,
    status: String,
    progress: u8,
    model_url: Option<String>,
    message: Option<String>,
}

static TASKS: OnceLock<Mutex<HashMap<String, TaskView>>> = OnceLock::new();

fn tasks() -> &'static Mutex<HashMap<String, TaskView>> {
    TASKS.get_or_init(|| Mutex::new(HashMap::new()))
}

fn model_dir() -> PathBuf {
    std::env::var_os("TRIPOSR_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("vendor/TripoSR"))
}

fn python_executable() -> std::ffi::OsString {
    if let Some(path) = std::env::var_os("TRIPOSR_PYTHON") {
        let path = PathBuf::from(path);
        return if path.is_absolute() {
            path.into_os_string()
        } else {
            std::env::current_dir()
                .unwrap_or_else(|_| PathBuf::from("."))
                .join(path)
                .into_os_string()
        };
    }
    let venv_python = std::env::current_dir()
        .unwrap_or_else(|_| PathBuf::from("."))
        .join(".venv-triposr/bin/python");
    if venv_python.is_file() {
        venv_python.into_os_string()
    } else {
        "python3".into()
    }
}

pub fn model_is_installed() -> bool {
    let directory = model_dir();
    directory.join("run.py").is_file() && directory.join(".rt-studio-ready").is_file()
}

pub async fn create_generation(Json(request): Json<CreateRequest>) -> Response {
    let Ok(upload_id) = uuid::Uuid::parse_str(&request.upload_id) else {
        return (StatusCode::BAD_REQUEST, "Некорректный ID изображения").into_response();
    };
    let root = FilePath::new("uploads");
    let input = ["jpeg", "png"]
        .iter()
        .map(|extension| root.join(format!("{upload_id}.{extension}")))
        .find(|path| path.is_file());
    let Some(input) = input else {
        return (StatusCode::NOT_FOUND, "Загруженное изображение не найдено").into_response();
    };
    let input = match input.canonicalize() {
        Ok(path) => path,
        Err(_) => {
            return (StatusCode::NOT_FOUND, "Загруженное изображение не найдено").into_response();
        }
    };
    let model_root = match model_dir().canonicalize() {
        Ok(path) => path,
        Err(_) => {
            return (
                StatusCode::SERVICE_UNAVAILABLE,
                "Не удалось открыть каталог локальной модели TripoSR",
            )
                .into_response();
        }
    };
    let script = model_root.join("run.py");
    if !model_is_installed() {
        return (
            StatusCode::SERVICE_UNAVAILABLE,
            "Локальная AI-модель не установлена. Откройте docs/index.md и выполните установку TripoSR.",
        )
            .into_response();
    }

    let id = uuid::Uuid::new_v4().to_string();
    let output_dir = match std::env::current_dir() {
        Ok(root) => root.join("generated").join(&id),
        Err(_) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Не удалось определить каталог проекта",
            )
                .into_response();
        }
    };
    if let Err(error) = std::fs::create_dir_all(&output_dir) {
        eprintln!("Не удалось создать каталог модели: {error}");
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Не удалось подготовить генерацию",
        )
            .into_response();
    }

    let task = TaskView {
        id: id.clone(),
        status: "PENDING".to_string(),
        progress: 0,
        model_url: None,
        message: None,
    };
    {
        let mut active = tasks().lock().await;
        if active
            .values()
            .any(|task| task.status == "PENDING" || task.status == "RUNNING")
        {
            let _ = std::fs::remove_dir_all(&output_dir);
            return (
                StatusCode::TOO_MANY_REQUESTS,
                "Локальная модель уже выполняет другую генерацию. Дождитесь её завершения.",
            )
                .into_response();
        }
        active.insert(id.clone(), task);
    }

    let python = python_executable();
    let device = std::env::var("TRIPOSR_DEVICE").unwrap_or_else(|_| "cuda:0".to_string());
    let compatibility_modules = std::env::current_dir()
        .unwrap_or_else(|_| PathBuf::from("."))
        .join("ai/triposr_compat");
    let task_id = id.clone();
    tokio::spawn(async move {
        update_task(&task_id, "RUNNING", 5, None, None).await;
        let result = Command::new(python)
            .arg(script)
            .arg(input)
            .arg("--output-dir")
            .arg(&output_dir)
            .arg("--device")
            .arg(device)
            .arg("--model-save-format")
            .arg("glb")
            .arg("--mc-resolution")
            .arg("128")
            .current_dir(model_root)
            .env("PYTHONPATH", compatibility_modules)
            .stdin(Stdio::null())
            .output()
            .await;

        match result {
            Ok(output) if output.status.success() => {
                let model = output_dir.join("0/mesh.glb");
                if model.is_file() {
                    update_task(
                        &task_id,
                        "SUCCEEDED",
                        100,
                        Some(format!("/api/generation/{task_id}/model")),
                        None,
                    )
                    .await;
                } else {
                    update_task(
                        &task_id,
                        "FAILED",
                        0,
                        None,
                        Some("TripoSR завершил работу, но файл GLB не найден".to_string()),
                    )
                    .await;
                }
            }
            Ok(output) => {
                let stderr = String::from_utf8_lossy(&output.stderr);
                let detail = stderr
                    .lines()
                    .rev()
                    .take(8)
                    .collect::<Vec<_>>()
                    .into_iter()
                    .rev()
                    .collect::<Vec<_>>()
                    .join(" ");
                let message = if detail.contains("NameResolutionError")
                    || detail.contains("Failed to resolve")
                    || detail.contains("Max retries exceeded")
                {
                    "Не удалось скачать веса TripoSR с Hugging Face: проверьте подключение к интернету и DNS, затем повторите генерацию. После первого успешного скачивания веса останутся в локальном кэше.".to_string()
                } else if detail.is_empty() {
                    "Локальная генерация завершилась с ошибкой. Проверьте установку TripoSR."
                        .to_string()
                } else {
                    format!("Ошибка TripoSR: {detail}")
                };
                eprintln!("Генерация {task_id} завершилась ошибкой: {message}");
                update_task(&task_id, "FAILED", 0, None, Some(message)).await;
            }
            Err(error) => {
                let message = format!(
                    "Не удалось запустить TripoSR: {error}. Проверьте TRIPOSR_PYTHON и установку модели."
                );
                eprintln!("Генерация {task_id} завершилась ошибкой: {message}");
                update_task(&task_id, "FAILED", 0, None, Some(message)).await;
            }
        }
    });

    (
        StatusCode::ACCEPTED,
        Json(serde_json::json!({ "id": id, "status": "PENDING" })),
    )
        .into_response()
}

async fn update_task(
    id: &str,
    status: &str,
    progress: u8,
    model_url: Option<String>,
    message: Option<String>,
) {
    if let Some(task) = tasks().lock().await.get_mut(id) {
        task.status = status.to_string();
        task.progress = progress;
        task.model_url = model_url;
        task.message = message;
    }
}

pub async fn get_generation(Path(id): Path<String>) -> Response {
    if uuid::Uuid::parse_str(&id).is_err() {
        return (StatusCode::BAD_REQUEST, "Некорректный ID генерации").into_response();
    }
    match tasks().lock().await.get(&id).cloned() {
        Some(task) => Json(task).into_response(),
        None => (StatusCode::NOT_FOUND, "Задача генерации не найдена").into_response(),
    }
}

pub async fn download_model(Path(id): Path<String>) -> Response {
    if uuid::Uuid::parse_str(&id).is_err() {
        return (StatusCode::BAD_REQUEST, "Некорректный ID генерации").into_response();
    }
    let task = tasks().lock().await.get(&id).cloned();
    let Some(task) = task else {
        return (StatusCode::NOT_FOUND, "Задача генерации не найдена").into_response();
    };
    if task.status != "SUCCEEDED" {
        return (StatusCode::CONFLICT, "Модель ещё не готова").into_response();
    }
    let model_path = PathBuf::from("generated").join(&id).join("0/mesh.glb");
    let data = match tokio::fs::read(model_path).await {
        Ok(data) if data.len() <= 100 * 1024 * 1024 => data,
        Ok(_) => {
            return (StatusCode::PAYLOAD_TOO_LARGE, "GLB превышает лимит 100 МБ").into_response();
        }
        Err(_) => return (StatusCode::NOT_FOUND, "Файл GLB не найден").into_response(),
    };
    let mut headers = HeaderMap::new();
    headers.insert(
        header::CONTENT_TYPE,
        HeaderValue::from_static("model/gltf-binary"),
    );
    headers.insert(
        header::CONTENT_DISPOSITION,
        HeaderValue::from_static("attachment; filename=rt-studio-model.glb"),
    );
    (StatusCode::OK, headers, Body::from(data)).into_response()
}
