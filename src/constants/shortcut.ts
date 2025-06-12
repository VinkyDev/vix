import { platform as getPlatform } from "@tauri-apps/plugin-os";

export enum ShortcutAction {
  TOGGLE_WINDOW = "Toggle Window",
}

export type Platform = ReturnType<typeof getPlatform>;

export type ShortcutConfig = {
  default: string;
} & Partial<Record<Platform, string>>;

export const shortcutMap: Record<ShortcutAction, ShortcutConfig> = {
  [ShortcutAction.TOGGLE_WINDOW]: {
    default: "Alt+Space",
    macos: "Option+Space",
  },
};
