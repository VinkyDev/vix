import { create } from "zustand";
import { persist } from "zustand/middleware";

import { getDefaultShortcuts } from "@/utils/shortcut";

export enum ShortcutKey {
  ToggleWindow = "toggleWindow",
}

interface UserSettingsStore {
  /** 是否使用推理 */
  useThinking: boolean;
  /** 设置是否使用推理 */
  setUseThinking: (useThinking: boolean) => void;

  /** 是否使用联网搜索 */
  useSearch: boolean;
  /** 设置是否使用联网搜索 */
  setUseSearch: (useSearch: boolean) => void;

  /** 上下文窗口长度 */
  contextWindowSize: number;
  /** 设置上下文窗口长度 */
  setContextWindowSize: (size: number) => void;

  /** 快捷键配置 */
  shortcuts: {
    [ShortcutKey.ToggleWindow]: string;
  };
  /** 设置快捷键 */
  setShortcut: (
    key: keyof UserSettingsStore["shortcuts"],
    value: string
  ) => void;
  /** 重置快捷键为默认值 */
  resetShortcuts: () => void;
}

export const useUserSettingsStore = create<UserSettingsStore>()(
  persist(
    (set) => ({
      useThinking: false,
      useSearch: false,
      setUseThinking: (useThinking) => set({ useThinking }),
      setUseSearch: (useSearch) => set({ useSearch }),

      contextWindowSize: 4,
      setContextWindowSize: (size) => set({ contextWindowSize: size }),

      shortcuts: getDefaultShortcuts(),
      setShortcut: (key, value) =>
        set((state) => ({
          shortcuts: {
            ...state.shortcuts,
            [key]: value,
          },
        })),
      resetShortcuts: () => set({ shortcuts: getDefaultShortcuts() }),
    }),
    {
      name: "user-settings-storage",
      partialize: (state) => ({
        useThinking: state.useThinking,
        useSearch: state.useSearch,
        contextWindowSize: state.contextWindowSize,
        shortcuts: state.shortcuts,
      }),
    }
  )
);
