use tauri_plugin_shell::ShellExt;
use tauri_plugin_shell::process::CommandEvent;

#[tauri::command]
async fn run_finance_command(app: tauri::AppHandle, cmd_json: String) -> Result<String, String> {
    let sidecar_command = app.shell()
        .sidecar("project_json")
        .map_err(|e| e.to_string())?;

    let (mut rx, mut child) = sidecar_command
        .spawn()
        .map_err(|e| e.to_string())?;

    child.write(format!("{}\n", cmd_json).as_bytes())
        .map_err(|e| e.to_string())?;

    let mut response = String::new();
    while let Some(event) = rx.recv().await {
        match event {
            CommandEvent::Stdout(line_bytes) => {
                let line = String::from_utf8_lossy(&line_bytes).to_string();
                if !line.trim().is_empty() {
                    response = line;
                    break;
                }
            }
            CommandEvent::Stderr(line_bytes) => {
                let err = String::from_utf8_lossy(&line_bytes).to_string();
                eprintln!("C++ Sidecar Stderr: {}", err);
            }
            CommandEvent::Terminated(_) => {
                break;
            }
            _ => {}
        }
    }

    let _ = child.kill();

    if response.is_empty() {
        return Err("No response from C++ sidecar".to_string());
    }

    Ok(response)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![run_finance_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

