import { useEffect } from "react";

import { ShortcutAction } from "@/constants/shortcut";
import { createShortcutHandler } from "@/utils/shortcut";
export function useShortcut(action: ShortcutAction, callback: () => unknown) {
  useEffect(() => {
    const handle = createShortcutHandler(action);
    handle.register(callback);

    return () => {
      handle.unregister();
    };
  }, []);
}
