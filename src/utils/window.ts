import { invoke } from "@tauri-apps/api/core";

export async function showWindow() {
  await invoke("show_window");
}

export async function hideWindow() {
  await invoke("hide_window");
}

export async function toggleWindow() {
  return await invoke<boolean>("toggle_window");
}