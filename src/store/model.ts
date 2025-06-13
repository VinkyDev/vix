import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Model {
  apiKey: string;
  baseURL: string;
  id: string;
  thinking: boolean;
}

interface ModelStore {
  model: Model;
  setModel: (model: Model) => void;
  setUseThinking: (useThinking: boolean) => void;
  useThinking: boolean;
}

const MODEL_LIST: Model[] = [
  {
    apiKey: "sk-9c54cc89007d45c0a53c05ea9c9373fe",
    baseURL:
      "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    id: "qwen-turbo-latest",
    thinking: true,
  },
  {
    apiKey: "sk-9c54cc89007d45c0a53c05ea9c9373fe",
    baseURL:
      "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    id: "qwen-plus-latest",
    thinking: true,
  },
];

export const useModelStore = create<ModelStore>()(
  persist(
    (set) => ({
      model: MODEL_LIST[0],
      setModel: (model) => set({ model }),
      setUseThinking: (useThinking) => set({ useThinking }),
      useThinking: false,
    }),
    {
      name: "model-storage",
      partialize: (state) => ({
        model: state.model,
        useThinking: state.useThinking,
      }),
    }
  )
);
