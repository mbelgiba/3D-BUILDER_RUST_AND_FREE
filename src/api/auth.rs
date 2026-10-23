use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier, password_hash::SaltString};
use axum::{
    Json,
    body::Body,
    extract::Request,
    http::{HeaderMap, HeaderValue, StatusCode, header},
    middleware::Next,
    response::{IntoResponse, Response},
};
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, path::Path, sync::OnceLock};
use tokio::sync::Mutex;

#[derive(Clone, Serialize, Deserialize)]
struct Account {
    username: String,
    password_hash: String,
}
#[derive(Default, Serialize, Deserialize)]
struct AccountFile {
    accounts: Vec<Account>,
}
#[derive(Clone)]
struct Session {
    username: String,
    expires_at: u64,
}
#[derive(Default)]
struct AuthStore {
    accounts: HashMap<String, Account>,
    sessions: HashMap<String, Session>,
}
static STORE: OnceLock<Mutex<AuthStore>> = OnceLock::new();
fn store() -> &'static Mutex<AuthStore> {
    STORE.get_or_init(|| Mutex::new(load_accounts()))
}
fn load_accounts() -> AuthStore {
    let data = std::fs::read("data/accounts.json")
        .ok()
        .and_then(|bytes| serde_json::from_slice::<AccountFile>(&bytes).ok())
        .unwrap_or_default();
    AuthStore {
        accounts: data
            .accounts
            .into_iter()
            .map(|account| (account.username.to_lowercase(), account))
            .collect(),
        sessions: HashMap::new(),
    }
}
fn persist_accounts(accounts: &HashMap<String, Account>) -> Result<(), std::io::Error> {
    std::fs::create_dir_all("data")?;
    let data = AccountFile {
        accounts: accounts.values().cloned().collect(),
    };
    let bytes = serde_json::to_vec_pretty(&data).map_err(std::io::Error::other)?;
    let temp = Path::new("data/accounts.json.tmp");
    std::fs::write(temp, bytes)?;
    std::fs::rename(temp, "data/accounts.json")
}

#[derive(Deserialize)]
pub struct Credentials {
    username: String,
    password: String,
}
#[derive(Serialize)]
struct User {
    username: String,
}
fn cookie_token(headers: &HeaderMap) -> Option<String> {
    headers
        .get(header::COOKIE)?
        .to_str()
        .ok()?
        .split(';')
        .filter_map(|part| part.trim().split_once('='))
        .find_map(|(name, value)| (name == "rt_session").then(|| value.to_owned()))
}
fn session_cookie(token: &str, max_age: i64) -> HeaderValue {
    let secure = if std::env::var("RT_STUDIO_INSECURE_COOKIES").as_deref() == Ok("1") {
        ""
    } else {
        "; Secure"
    };
    HeaderValue::from_str(&format!(
        "rt_session={token}; HttpOnly; SameSite=Lax; Path=/; Max-Age={max_age}{secure}"
    ))
    .expect("static cookie attributes")
}
fn valid_credentials(credentials: &Credentials) -> bool {
    let username = credentials.username.trim();
    (2..=32).contains(&username.chars().count())
        && username
            .chars()
            .all(|c| c.is_alphanumeric() || c == '_' || c == '-')
        && (8..=256).contains(&credentials.password.len())
}
fn new_session(store: &mut AuthStore, username: String) -> String {
    let token = uuid::Uuid::new_v4().to_string();
    store.sessions.insert(
        token.clone(),
        Session {
            username,
            expires_at: unix_now() + 60 * 60 * 24 * 30,
        },
    );
    token
}
fn unix_now() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_or(0, |duration| duration.as_secs())
}
pub async fn register(Json(credentials): Json<Credentials>) -> Response {
    if !valid_credentials(&credentials) {
        return (
            StatusCode::BAD_REQUEST,
            "Имя: 2–32 буквы, цифры, _ или -. Пароль: 8–256 символов.",
        )
            .into_response();
    }
    let username = credentials.username.trim().to_owned();
    let salt = match SaltString::encode_b64(uuid::Uuid::new_v4().as_bytes()) {
        Ok(salt) => salt,
        Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };
    let password = credentials.password;
    let hash = match tokio::task::spawn_blocking(move || {
        Argon2::default()
            .hash_password(password.as_bytes(), &salt)
            .map(|value| value.to_string())
    })
    .await
    {
        Ok(Ok(hash)) => hash,
        _ => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                "Не удалось создать профиль",
            )
                .into_response();
        }
    };
    let mut state = store().lock().await;
    let key = username.to_lowercase();
    if state.accounts.contains_key(&key) {
        return (
            StatusCode::CONFLICT,
            "Профиль с таким именем уже существует",
        )
            .into_response();
    }
    state.accounts.insert(
        key.clone(),
        Account {
            username: username.clone(),
            password_hash: hash,
        },
    );
    if persist_accounts(&state.accounts).is_err() {
        state.accounts.remove(&key);
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Не удалось сохранить профиль на сервере",
        )
            .into_response();
    }
    let token = new_session(&mut state, username.clone());
    let mut response = Json(User { username }).into_response();
    response.headers_mut().insert(
        header::SET_COOKIE,
        session_cookie(&token, 60 * 60 * 24 * 30),
    );
    response
}
pub async fn login(Json(credentials): Json<Credentials>) -> Response {
    let account = store()
        .lock()
        .await
        .accounts
        .get(&credentials.username.trim().to_lowercase())
        .cloned();
    let Some(account) = account else {
        return (
            StatusCode::UNAUTHORIZED,
            "Неверное имя пользователя или пароль",
        )
            .into_response();
    };
    let stored_hash = account.password_hash;
    let password = credentials.password;
    let valid = tokio::task::spawn_blocking(move || {
        PasswordHash::new(&stored_hash).is_ok_and(|hash| {
            Argon2::default()
                .verify_password(password.as_bytes(), &hash)
                .is_ok()
        })
    })
    .await
    .unwrap_or(false);
    if !valid {
        return (
            StatusCode::UNAUTHORIZED,
            "Неверное имя пользователя или пароль",
        )
            .into_response();
    }
    let mut state = store().lock().await;
    let token = new_session(&mut state, account.username.clone());
    let mut response = Json(User {
        username: account.username,
    })
    .into_response();
    response.headers_mut().insert(
        header::SET_COOKIE,
        session_cookie(&token, 60 * 60 * 24 * 30),
    );
    response
}
pub async fn current(headers: HeaderMap) -> Response {
    let Some(token) = cookie_token(&headers) else {
        return StatusCode::UNAUTHORIZED.into_response();
    };
    let username = store()
        .lock()
        .await
        .sessions
        .get(&token)
        .filter(|session| session.expires_at > unix_now())
        .map(|session| session.username.clone());
    match username {
        Some(username) => Json(User { username }).into_response(),
        None => StatusCode::UNAUTHORIZED.into_response(),
    }
}
pub async fn logout(headers: HeaderMap) -> Response {
    if let Some(token) = cookie_token(&headers) {
        store().lock().await.sessions.remove(&token);
    }
    let mut response = StatusCode::NO_CONTENT.into_response();
    response
        .headers_mut()
        .insert(header::SET_COOKIE, session_cookie("", 0));
    response
}
pub async fn require_session(request: Request<Body>, next: Next) -> Response {
    let authorized = if let Some(token) = cookie_token(request.headers()) {
        store()
            .lock()
            .await
            .sessions
            .get(&token)
            .is_some_and(|session| session.expires_at > unix_now())
    } else {
        false
    };
    if !authorized {
        return (StatusCode::UNAUTHORIZED, "Требуется войти в аккаунт").into_response();
    }
    next.run(request).await
}
