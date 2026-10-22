pub mod generation;
pub mod upload;

use axum::{
    Json, Router,
    extract::DefaultBodyLimit,
    routing::{get, post},
};
use serde::Serialize;
use std::net::SocketAddr;
use tower_http::services::ServeDir;

#[derive(Serialize)]
struct Health {
    status: &'static str,
    ai_generation: bool,
}

async fn health() -> Json<Health> {
    Json(Health {
        status: "ok",
        ai_generation: generation::model_is_installed(),
    })
}

pub async fn serve() -> Result<(), Box<dyn std::error::Error>> {
    let app = Router::new()
        .route("/api/health", get(health))
        .route(
            "/api/upload",
            post(upload::upload_image).layer(DefaultBodyLimit::max(11 * 1024 * 1024)),
        )
        .route("/api/generation", post(generation::create_generation))
        .route("/api/generation/{id}", get(generation::get_generation))
        .route(
            "/api/generation/{id}/model",
            get(generation::download_model),
        )
        .route("/api/render", post(render_ppm))
        .nest_service("/docs", ServeDir::new("docs"))
        .fallback_service(ServeDir::new("frontend/dist").append_index_html_on_directories(true));
    let address = SocketAddr::from(([127, 0, 0, 1], 3000));
    let listener = tokio::net::TcpListener::bind(address).await?;
    println!("RT Studio is available at http://{address}");
    axum::serve(listener, app).await?;
    Ok(())
}

#[derive(serde::Deserialize)]
struct RenderRequest {
    scene: usize,
    width: usize,
    height: usize,
}

async fn render_ppm(
    Json(request): Json<RenderRequest>,
) -> Result<impl axum::response::IntoResponse, (axum::http::StatusCode, &'static str)> {
    use crate::renderer::{ppm, scene::four_demo_scenes};
    use axum::{
        body::Body,
        http::{HeaderValue, StatusCode, header},
        response::Response,
    };

    let Some((name, scene)) = four_demo_scenes().into_iter().nth(request.scene) else {
        return Err((StatusCode::BAD_REQUEST, "Unknown scene index"));
    };
    let valid_resolution = matches!(
        (request.width, request.height),
        (400, 300) | (800, 600) | (1200, 900)
    );
    if !valid_resolution {
        return Err((
            StatusCode::BAD_REQUEST,
            "Choose a supported render resolution",
        ));
    }
    let (width, height) = (request.width, request.height);
    let name = name.to_owned();
    let bytes = tokio::task::spawn_blocking(move || {
        let pixels = scene.render(width, height);
        ppm::encode(width, height, &pixels)
    })
    .await
    .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Render task failed"))?
    .map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Could not encode PPM image",
        )
    })?;

    let mut response = Response::new(Body::from(bytes));
    response.headers_mut().insert(
        header::CONTENT_TYPE,
        HeaderValue::from_static("image/x-portable-pixmap"),
    );
    let disposition = format!("attachment; filename={name}.ppm");
    let value = HeaderValue::from_str(&disposition)
        .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "Invalid download name"))?;
    response
        .headers_mut()
        .insert(header::CONTENT_DISPOSITION, value);
    Ok(response)
}
