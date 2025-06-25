use serde_json;
use tauri::{
    async_runtime::spawn,
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    ActivationPolicy, AppHandle, Emitter, Listener, Manager, WebviewUrl, WebviewWindowBuilder,
};
use tauri_plugin_log::{Target, TargetKind};

#[tauri::command]
async fn show_window(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window.show().map_err(|e| e.to_string())?;
        window.set_focus().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn hide_window(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn toggle_window(app: AppHandle) -> Result<bool, String> {
    if let Some(window) = app.get_webview_window("main") {
        match window.is_visible() {
            Ok(true) => {
                window.hide().map_err(|e| e.to_string())?;
                Ok(false)
            }
            Ok(false) => {
                window.show().map_err(|e| e.to_string())?;
                window.set_focus().map_err(|e| e.to_string())?;
                Ok(true)
            }
            Err(e) => Err(e.to_string()),
        }
    } else {
        Err("window not found".into())
    }
}

#[tauri::command]
async fn get_page_content(app: AppHandle, url: String) -> Result<(), String> {
    let app_handle = app.clone();

    app.once_any("page-content", move |event| {
        if let Ok(payload) = serde_json::from_str::<serde_json::Value>(event.payload()) {
            if let Some(_content) = payload.get("content").and_then(|c| c.as_str()) {
                app_handle.emit("page-content-received", payload).unwrap();
            }
        }
    });

    WebviewWindowBuilder::new(
        &app,
        "hidden-webview",
        WebviewUrl::External(url.parse().map_err(|e| format!("URL解析失败: {}", e))?),
    )
    .visible(false)
    .fullscreen(true)
    .decorations(false)
    .resizable(false)
    .skip_taskbar(true)
    .user_agent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    .on_page_load({
        let url = url.clone();
        move |window, _event| {
            let window_clone = window.clone();
            let url = url.clone();
                spawn(async move {
                tokio::time::sleep(tokio::time::Duration::from_millis(2000)).await;
                let _ = window_clone.eval(&format!(
                    r#"
                    (async function() {{
                        let attempt = 0;
                        const maxAttempts = 10;

                        while (attempt < maxAttempts) {{
                            attempt++;

                            try {{

                                window.scrollTo(0, document.body.scrollHeight);
                                await new Promise(resolve => setTimeout(resolve, 100));
                                window.scrollTo(0, 0);

                                [...document.querySelectorAll('script, style, .ads, .ad, .advertisement, .google-ads, nav, header, footer, .nav, .header, .footer')].forEach(el => el.remove());

                                let content = '';

                                const contentSelectors = [
                                    'main', '[role="main"]', '.content', '.main-content',
                                    '.post-content', '.article-content', '.entry-content',
                                    'article', '.container'
                                ];

                                for (let selector of contentSelectors) {{
                                    const element = document.querySelector(selector);
                                    if (element && element.innerText.trim().length > 100) {{
                                        content = element.innerText.trim();
                                        break;
                                    }}
                                }}

                                if (!content || content.length < 100) {{
                                    content = document.body.innerText || document.body.textContent || "";
                                }}

                                if (!content || content.length < 100) {{
                                    const paragraphs = [...document.querySelectorAll('p, div, span')];
                                    content = paragraphs
                                        .map(p => p.innerText || p.textContent || "")
                                        .filter(text => text.trim().length > 10)
                                        .join('\n');
                                }}

                                if (content.trim().length > 50) {{
                                    const data = {{
                                        title: document.title || "无标题",
                                        content: content.trim(),
                                        url: window.location.href,
                                        attempt: attempt
                                    }};
                                    window.__TAURI__.event.emit('page-content', data);
                                    window.close();
                                    return;
                                }}
                            }} catch (error) {{
                                console.error("提取内容时发生错误:", error);
                            }}

                            await new Promise(resolve => setTimeout(resolve, 2000));
                        }}

                        const errorData = {{
                            title: "提取失败",
                            content: "无法提取页面内容，可能是动态加载或受保护的页面",
                            url: "{}",
                            error: true
                        }};
                        window.__TAURI__.event.emit('page-content', errorData);
                        window.close();
                    }})();
                    "#, url
                ));
            });
        }
    })
    .build()
    .map_err(|e| format!("创建webview失败: {}", e))?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::LogDir { file_name: None }),
                    Target::new(TargetKind::Webview),
                ])
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            show_window,
            hide_window,
            toggle_window,
            get_page_content,
        ])
        .setup(|app| {
            let quit_i = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
            let toggle_i = MenuItem::with_id(app, "toggle", "显示/隐藏", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&toggle_i, &quit_i])?;

            let _tray = TrayIconBuilder::new()
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "toggle" => {
                        let app_handle = app.clone();
                        spawn(async move {
                            let _ = toggle_window(app_handle).await;
                        });
                    }
                    _ => {
                        println!("menu item {:?} not handled", event.id);
                    }
                })
                .icon(app.default_window_icon().unwrap().clone())
                .icon_as_template(true)
                .menu(&menu)
                .show_menu_on_left_click(true)
                .build(app)?;

            #[cfg(target_os = "macos")]
            app.set_activation_policy(ActivationPolicy::Accessory);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
