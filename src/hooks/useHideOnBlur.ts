import { listen, TauriEvent, UnlistenFn } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect } from "react";

/**
 * 当窗口失去焦点时，自动隐藏当前 Tauri 窗口。
 * @param enabled 是否启用该功能，默认 true。
 */
export function useHideOnBlur(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    let unlisten: UnlistenFn | null = null;

    const win = getCurrentWindow();
    listen(TauriEvent.WINDOW_BLUR, async () => {
      await win.hide();
    }).then((fn) => {
      unlisten = fn;
    });

    return () => {
      // 清理监听
      if (unlisten) {
        unlisten();
      }
    };
  }, [enabled]);
}
