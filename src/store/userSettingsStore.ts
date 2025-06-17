import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserSettingsStore {
  /** 是否使用推理 */
  useThinking: boolean;
  /** 设置是否使用推理 */
  setUseThinking: (useThinking: boolean) => void;

  /** 上下文窗口长度 */
  contextWindowSize: number;
  /** 设置上下文窗口长度 */
  setContextWindowSize: (size: number) => void;
}

export const useUserSettingsStore = create<UserSettingsStore>()(
  persist(
    (set) => ({
      useThinking: false,
      setUseThinking: (useThinking) => set({ useThinking }),

      contextWindowSize: 4,
      setContextWindowSize: (size) => set({ contextWindowSize: size }),
    }),
    {
      name: "user-settings-storage",
      partialize: (state) => ({
        useThinking: state.useThinking,
        contextWindowSize: state.contextWindowSize,
      }),
    }
  )
);
