import { invoke } from "@tauri-apps/api/core";
import {
  getCurrentWindow,
  LogicalPosition,
  LogicalSize,
} from "@tauri-apps/api/window";
export async function showWindow() {
  await invoke("show_window");
}

export async function hideWindow() {
  await invoke("hide_window");
}

export async function toggleWindow() {
  return await invoke<boolean>("toggle_window");
}

export async function resizeAndMove() {
  const win = getCurrentWindow();
  await win.setSize(new LogicalSize(800, 100));
  await win.setPosition(new LogicalPosition(10, 10));
}
