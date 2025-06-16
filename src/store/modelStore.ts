import { keyBy } from "lodash-es";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  ConfigKey,
  getConfig,
  type ModelConfig,
  type ProviderConfig,
} from "@/api/config";

export type Model = ModelConfig & ProviderConfig;

interface ModelStore {
  /** 是否加载中 */
  loading: boolean;
  /** 模型列表 */
  modelList: Model[];
  /** 当前选中的模型ID */
  currentModelId: string;
  /** 获取模型列表 */
  fetchModelList: () => Promise<void>;
  /** 当前选中的模型 */
  getCurrentModel: () => Model;
  /** 设置当前选中的模型 */
  setCurrentModelId: (modelId: string) => void;
}

export const useModelStore = create<ModelStore>()(
  persist(
    (set, get) => ({
      loading: true,
      modelList: [],
      currentModelId: "",

      fetchModelList: async () => {
        set({ loading: true });
        const { data, success } = await getConfig();

        if (!success) {
          set({ loading: false });
          return;
        }

        const {
          [ConfigKey.ModelList]: modelList,
          [ConfigKey.ProviderList]: providerList,
        } = data;

        const modelListData = modelList[0].value;
        const providerListData = providerList[0].value;

        const keyedProviderList = keyBy(providerListData, "providerId");

        const allModelList = modelListData.map((model) => {
          const provider = keyedProviderList[model.providerId];
          return {
            ...model,
            ...provider,
          };
        });

        set({ loading: false, modelList: allModelList });
      },

      getCurrentModel: () => {
        const state = get();
        const model = state.modelList.find(
          (model) => model.modelId === state.currentModelId
        );
        return model ?? state.modelList[0];
      },

      setCurrentModelId: (modelId) => set({ currentModelId: modelId }),
    }),
    {
      name: "model-storage",
      partialize: (state) => ({
        currentModelId: state.currentModelId,
      }),
    }
  )
);
