import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Model {
  /** 模型API Key */
  apiKey: string;
  /** 模型Base URL */
  baseURL: string;
  /** 模型描述 */
  description: string;
  /** 获取Apikey地址 */
  getApiKeyUrl?: string;
  /** 模型ID */
  id: string;
  /** 模型名称 */
  name: string;
  /** 是否有推理能力 */
  thinking: boolean;
  /** 推理模型ID */
  thinkingId?: string;
}

interface ModelStore {
  /** 当前模型 */
  model: Model;
  /** 设置当前模型 */
  setModel: (model: Model) => void;
  /** 设置是否使用推理 */
  setUseThinking: (useThinking: boolean) => void;
  /** 是否使用推理 */
  useThinking: boolean;
}

// 提供商配置
interface ProviderConfig {
  apiKey: string;
  baseURL: string;
  getApiKeyUrl: string;
}

// 模型基础配置
interface ModelConfig {
  description: string;
  id: string;
  name: string;
  provider: keyof typeof PROVIDERS;
  thinking: boolean;
  thinkingId?: string;
}

// API密钥配置
const API_KEYS = {
  deepseek: "sk-e3af17605f264d82a5d8500a1763fffd",
  qwen: "sk-9c54cc89007d45c0a53c05ea9c9373fe",
} as const;

// 提供商配置
const PROVIDERS: Record<string, ProviderConfig> = {
  deepseek: {
    apiKey: `Bearer ${API_KEYS.deepseek}`,
    baseURL: "https://api.deepseek.com/v1/chat/completions",
    getApiKeyUrl: "https://platform.deepseek.com/usage",
  },
  qwen: {
    apiKey: API_KEYS.qwen,
    baseURL:
      "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    getApiKeyUrl: "https://help.aliyun.com/zh/model-studio/get-api-key",
  },
} as const;

// 模型配置列表
const MODEL_CONFIGS: ModelConfig[] = [
  {
    description: "能力均衡",
    id: "qwen-plus-latest",
    name: "Qwen-Plus",
    provider: "qwen",
    thinking: true,
  },
  {
    description: "效果最好",
    id: "qwen-max-latest",
    name: "Qwen-Max",
    provider: "qwen",
    thinking: true,
  },
  {
    description: "速度最快",
    id: "qwen-turbo-latest",
    name: "Qwen-Turbo",
    provider: "qwen",
    thinking: true,
  },
  {
    description: "上下文窗口最长",
    id: "qwen-long-latest",
    name: "Qwen-Long",
    provider: "qwen",
    thinking: false,
  },
  {
    description: "DeepSeek最新模型",
    id: "deepseek-chat",
    name: "DeepSeek V3/R1",
    provider: "deepseek",
    thinking: true,
    thinkingId: "deepseek-reasoner",
  },
];

export const MODEL_LIST: Model[] = MODEL_CONFIGS.map((config) => {
  const provider = PROVIDERS[config.provider];

  return {
    ...provider,
    ...config,
  };
});

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
