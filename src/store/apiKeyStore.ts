import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ApiKeyStore {
  /** 用户自定义API Keys */
  userApiKeys: Record<string, string>;
  /** 获取API Key */
  getApiKey: (providerId: string) => string | undefined;
  /** 设置API Key */
  setApiKey: (providerId: string, apiKey: string) => void;
}

export const useApiKeyStore = create<ApiKeyStore>()(
  persist(
    (set, get) => ({
      userApiKeys: {},

      getApiKey: (providerId) => {
        const state = get();
        return state.userApiKeys?.[providerId];
      },

      setApiKey: (providerId, apiKey) =>
        set((state) => ({
          userApiKeys: {
            ...state.userApiKeys,
            [providerId]: apiKey,
          },
        })),
    }),
    {
      name: "api-key-storage",
      partialize: (state) => ({
        userApiKeys: state.userApiKeys,
      }),
    }
  )
);
