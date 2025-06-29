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
  /** 启用的模型ID列表 */
  enabledModelIds: string[];
  /** 获取模型列表 */
  fetchModelList: () => Promise<void>;
  /** 当前选中的模型 */
  getCurrentModel: () => Model;
  /** 设置当前选中的模型 */
  setCurrentModelId: (modelId: string) => void;
  /** 获取启用的模型列表 */
  getEnabledModels: () => Model[];
  /** 启用/禁用模型 */
  toggleModel: (modelId: string, enabled: boolean) => void;
  /** 检查模型是否启用 */
  isModelEnabled: (modelId: string) => boolean;
}

export const useModelStore = create<ModelStore>()(
  persist(
    (set, get) => ({
      loading: true,
      modelList: [],
      currentModelId: "",
      enabledModelIds: [],

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

        // 如果没有当前选中的模型，选择第一个启用的模型
        const state = get();
        if (!state.currentModelId && state.enabledModelIds.length > 0) {
          const firstEnabledModel = allModelList.find((model) =>
            state.enabledModelIds.includes(model.modelId)
          );
          if (firstEnabledModel) {
            set({ currentModelId: firstEnabledModel.modelId });
          }
        }
      },

      getCurrentModel: () => {
        const state = get();
        const model = state.modelList.find(
          (model) => model.modelId === state.currentModelId
        );
        return model ?? state.modelList[0];
      },

      setCurrentModelId: (modelId) => set({ currentModelId: modelId }),

      getEnabledModels: () => {
        const state = get();
        return state.modelList.filter((model) =>
          state.enabledModelIds.includes(model.modelId)
        );
      },

      toggleModel: (modelId, enabled) => {
        const state = get();
        let newEnabledModelIds = [...state.enabledModelIds];

        if (enabled) {
          if (!newEnabledModelIds.includes(modelId)) {
            newEnabledModelIds.push(modelId);
          }
        } else {
          newEnabledModelIds = newEnabledModelIds.filter(
            (id) => id !== modelId
          );
        }

        set({ enabledModelIds: newEnabledModelIds });

        // 如果当前选中的模型被禁用了，选择第一个启用的模型
        if (
          !enabled &&
          state.currentModelId === modelId &&
          newEnabledModelIds.length > 0
        ) {
          const firstEnabledModel = state.modelList.find((model) =>
            newEnabledModelIds.includes(model.modelId)
          );
          if (firstEnabledModel) {
            set({ currentModelId: firstEnabledModel.modelId });
          }
        }
      },

      isModelEnabled: (modelId) => {
        const state = get();
        return state.enabledModelIds.includes(modelId);
      },
    }),
    {
      name: "model-storage",
      partialize: (state) => ({
        currentModelId: state.currentModelId,
        enabledModelIds: state.enabledModelIds,
      }),
    }
  )
);
