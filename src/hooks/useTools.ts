import { TauriEvent } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export async function searchWebpage(url: string) {
  console.log("searchWebpage", url);

  const win = new WebviewWindow("my-label", {
    url,
    width: 1,
    height: 1,
  });

  // 等待窗口创建
  await new Promise((resolve) => {
    win.once(TauriEvent.WEBVIEW_CREATED, (e) => {
      console.log("WEBVIEW_CREATED", e);
      resolve(true);
    });
  });

  // 等待页面内容加载
  await new Promise((resolve) => setTimeout(resolve, 3000));

  return win;
}
