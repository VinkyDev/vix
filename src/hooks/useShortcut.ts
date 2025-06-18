import { useEffect } from "react";

import { ShortcutKey, useUserSettingsStore } from "@/store";
import { createShortcutHandler } from "@/utils/shortcut";

export function useShortcut(key: ShortcutKey, callback: () => unknown) {
  const shortcuts = useUserSettingsStore((state) => state.shortcuts);

  useEffect(() => {
    const handle = createShortcutHandler(shortcuts[key]);
    handle.register(callback);

    return () => {
      handle.unregister();
    };
  }, [key, callback, shortcuts]);
}
