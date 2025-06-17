import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import { platform as getPlatform } from "@tauri-apps/plugin-os";

import { ShortcutAction, shortcutMap } from "@/constants/shortcut";
export interface ShortcutHandle {
  register: (callback: () => unknown) => Promise<void>;
  unregister: () => Promise<void>;
}

export function createShortcutHandler(
  action: ShortcutAction
): ShortcutHandle {
  const platform = getPlatform();

  const config = shortcutMap[action];
  const shortcut = config[platform] ?? config.default;

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
