import { register, unregister } from "@tauri-apps/plugin-global-shortcut";

export interface ShortcutHandle {
  register: (callback: () => unknown) => Promise<void>;
  unregister: () => Promise<void>;
}

export function createShortcutHandler(shortcut: string): ShortcutHandle {
  return {
    async register(callback) {
      await register(shortcut, (event) => {
        if (event.state === "Pressed") {
          callback();
        }
      });
    },
    async unregister() {
      await unregister(shortcut);
    },
  };
}

// 快捷键默认配置
export function getDefaultShortcuts() {
  return {
    toggleWindow: "Shift+Space",
  };
}
