export interface ProviderConfig {
  baseURL: string;
  getApiKeyUrl: string;
  providerId: string;
}

export interface ModelConfig {
  description: string;
  modelId: string;
  name: string;
  providerId: string;
  thinking: boolean;
  thinkingId: string;
}

export type ConfigData<T> = {
  key: string;
  type: "json" | "string";
  value: T;
  description: string;
  tags: string[];
};

export enum ConfigKey {
  ModelList = "model.list",
  ProviderList = "model.provider",
}

export type Config = {
  [ConfigKey.ModelList]: [ConfigData<ModelConfig[]>];
  [ConfigKey.ProviderList]: [ConfigData<ProviderConfig[]>];
};

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export const getConfig = async () => {
  const response = await fetch(import.meta.env.VITE_GET_CONFIG_API);
  return response.json() as Promise<ApiResponse<Config>>;
};
