import { platform } from "@tauri-apps/plugin-os";

export const isMac = platform() === "macos";
export const isWindows = platform() === "windows";
export const isLinux = platform() === "linux";
export const isIOS = platform() === "ios";
export const isAndroid = platform() === "android";

export const isDesktop = !isIOS && !isAndroid;
export const isMobile = isIOS || isAndroid;