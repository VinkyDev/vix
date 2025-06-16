import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserSettingsStore {
  /** 是否使用推理 */
  useThinking: boolean;
  /** 设置是否使用推理 */
  setUseThinking: (useThinking: boolean) => void;
}

export const useUserSettingsStore = create<UserSettingsStore>()(
  persist(
    (set) => ({
      useThinking: false,

      setUseThinking: (useThinking) => set({ useThinking }),
    }),
    {
      name: "user-settings-storage",
      partialize: (state) => ({
        useThinking: state.useThinking,
      }),
    }
  )
);
