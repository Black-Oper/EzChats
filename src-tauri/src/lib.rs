use std::net::SocketAddr;
use tokio::net::TcpListener;
use reqwest::Client;
use once_cell::sync::OnceCell;

use axum::{Router, routing::post, http::StatusCode, response::IntoResponse, Json, extract::State};
use serde::Deserialize;

mod jwt;
use jwt::generate_jwt::generate_jwt;
use jwt::read_jwt::read_jwt;
use jwt::structs::ChatMessage;

use tauri::{AppHandle, Emitter};

// Variável global para armazenar o peer_url
static PEER_URL: OnceCell<String> = OnceCell::new();
static USERNAME: OnceCell<String> = OnceCell::new();

#[derive(Clone)]
struct AppState {
    app_handle: AppHandle,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![start_server, send_message])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn start_server(app: AppHandle, username: String, url: String, port: u16, port_client: u16) -> Result<(), String> {
    let peer_url = format!("http://{}:{}", url, port_client);
    
    PEER_URL.set(peer_url).map_err(|_| "Failed to set peer URL")?;
    USERNAME.set(username).map_err(|_| "Failed to set username")?;

    let state = AppState { app_handle: app };

    std::thread::spawn(move || {
        if let Err(e) = tokio::runtime::Runtime::new()
            .unwrap()
            .block_on(run_axum_server(url, port, state))
        {
            eprintln!("Erro ao iniciar o servidor Axum: {}", e);
        }
    });
    
    Ok(())
}

#[tauri::command]
async fn send_message(
    username: String,
    text: String,
    timestamp: String,
) -> Result<String, String> {
    let peer_url = PEER_URL.get().ok_or("Peer URL not initialized")?;

    let message = ChatMessage {
        username,
        text,
        timestamp,
    };

    let token = generate_jwt(&message).map_err(|e| format!("Erro ao gerar JWT: {}", e))?;

    Client::new()
        .post(peer_url)
        .json(&token)
        .send()
        .await
        .map_err(|e| format!("Erro ao enviar mensagem: {}", e))?;

    println!("Mensagem enviada: {}", token);
    Ok(token)
}

#[derive(Deserialize)]
struct MessageRequest {
    token: String,
}

async fn handle_message(
    State(state): State<AppState>,
    Json(payload): Json<MessageRequest>,
) -> impl IntoResponse {
    match read_jwt(&payload.token) {
        Ok(payload_str) => {
            match serde_json::from_str::<ChatMessage>(&payload_str) {
                Ok(msg) => {
                    if let Err(e) = state.app_handle.emit("new_message", (msg.username, msg.timestamp, msg.text)) {
                        eprintln!("Erro ao emitir evento: {}", e);
                        return (StatusCode::INTERNAL_SERVER_ERROR, "Erro ao processar mensagem").into_response();
                    }
                    StatusCode::OK.into_response()
                }
                Err(err) => {
                    eprintln!("JSON inválido no payload do JWT: {}", err);
                    (StatusCode::BAD_REQUEST, format!("Payload JWT inválido: {}", err)).into_response()
                }
            }
        }
        Err(err) => {
            eprintln!("Erro ao ler JWT: {}", err);
            (StatusCode::BAD_REQUEST, format!("Erro na validação do JWT: {}", err)).into_response()
        }
    }
}

async fn run_axum_server(
    url: String,
    port: u16,
    state: AppState,
) -> Result<(), Box<dyn std::error::Error>> {
    let app = Router::new()
        .route("/message", post(handle_message))
        .with_state(state);

    let addr: SocketAddr = format!("{}:{}", url, port).parse()?;
    println!("Servidor rodando em {}", addr);

    let listener = TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;
    Ok(())
}