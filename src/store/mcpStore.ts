import { create } from "zustand";
import { persist } from "zustand/middleware";

import { MCPService, MCPServiceEvents } from "@/services/mcpService";
import {
  MCPPrompt,
  MCPResource,
  MCPServerConfig,
  MCPServerStatus,
  MCPTool,
  MCPToolResult,
} from "@/types";

// 简化的服务实例接口，只包含 UI 需要的状态
export interface MCPServiceInstance {
  config: MCPServerConfig;
  get status(): MCPServerStatus;
  logs: string[];
  service: MCPService;
  // 缓存的数据，直接从 service 获取
  get tools(): MCPTool[];
  get resources(): MCPResource[];
  get prompts(): MCPPrompt[];
  get pid(): number | undefined;
  get isConnected(): boolean;
}

interface MCPStore {
  /** MCP 服务实例 */
  services: Record<string, MCPServiceInstance>;

  /** 添加 MCP 服务配置 */
  addService: (config: MCPServerConfig) => void;

  /** 删除 MCP 服务 */
  removeService: (name: string) => void;

  /** 更新服务配置 */
  updateService: (name: string, config: Partial<MCPServerConfig>) => void;

  /** 启动服务 */
  startService: (name: string) => Promise<void>;

  /** 停止服务 */
  stopService: (name: string) => Promise<void>;

  /** 重启服务 */
  restartService: (name: string) => Promise<void>;

  /** 调用服务工具 */
  callServiceTool: (
    serviceName: string,
    toolName: string,
    arguments_: Record<string, unknown>
  ) => Promise<MCPToolResult>;

  /** 刷新服务数据 */
  refreshServiceData: (name: string) => Promise<void>;

  /** 清空服务日志 */
  clearServiceLogs: (name: string) => void;

  /** 导入配置 */
  importConfiguration: (
    config: Record<string, Omit<MCPServerConfig, "name">>
  ) => void;

  /** 导出配置 */
  exportConfiguration: () => Record<string, Omit<MCPServerConfig, "name">>;

  /** 初始化状态回调 */
  initializeStateCallbacks: () => void;
}

// 创建服务实例的工厂函数
function createServiceInstance(
  config: MCPServerConfig,
  onUpdate?: () => void
): MCPServiceInstance {
  const logs: string[] = [];

  const serviceEvents: MCPServiceEvents = {
    onStatusChange: (_status) => {
      // 状态变化时触发 store 更新
      onUpdate?.();
    },
    onLog: (message) => {
      logs.push(message);
      // 保留最近 100 条日志
      if (logs.length > 100) {
        logs.shift();
      }
    },
    onToolsUpdate: () => {
      // 工具更新时触发 store 更新
      onUpdate?.();
    },
    onResourcesUpdate: () => {
      // 资源更新时触发 store 更新
      onUpdate?.();
    },
    onPromptsUpdate: () => {
      // 提示更新时触发 store 更新
      onUpdate?.();
    },
  };

  const service = new MCPService(config, serviceEvents);

  return {
    config,
    get status() {
      return service.status;
    },
    logs,
    service,
    get tools() {
      return service.tools;
    },
    get resources() {
      return service.resources;
    },
    get prompts() {
      return service.prompts;
    },
    get pid() {
      return service.pid;
    },
    get isConnected() {
      return service.isConnected;
    },
  };
}

export const useMCPStore = create<MCPStore>()(
  persist(
    (set, get) => ({
      services: {},

      addService: (config) => {
        set((state) => {
          // 创建一个会触发状态更新的服务实例
          const onUpdate = () => {
            // 触发 store 重新渲染
            set((currentState) => ({ ...currentState }));
          };

          return {
            services: {
              ...state.services,
              [config.name]: createServiceInstance(config, onUpdate),
            },
          };
        });
      },

      removeService: (name) => {
        const { services } = get();
        const service = services[name];

        // 如果服务正在运行，先停止它
        if (service && service.status === MCPServerStatus.Running) {
          get().stopService(name).catch(console.error);
        }

        set((state) => {
          const newServices = { ...state.services };
          delete newServices[name];
          return { services: newServices };
        });
      },

      updateService: (name, configUpdate) => {
        const { services } = get();
        const serviceInstance = services[name];

        if (!serviceInstance) return;

        // 如果服务正在运行，先停止它
        if (serviceInstance.status === MCPServerStatus.Running) {
          serviceInstance.service.stop().catch(console.error);
        }

        // 更新配置并创建新的服务实例
        const newConfig = {
          ...serviceInstance.config,
          ...configUpdate,
        };

        set((state) => {
          const onUpdate = () => {
            set((currentState) => ({ ...currentState }));
          };

          return {
            services: {
              ...state.services,
              [name]: createServiceInstance(newConfig, onUpdate),
            },
          };
        });
      },

      startService: async (name) => {
        const { services } = get();
        const serviceInstance = services[name];

        if (!serviceInstance) {
          throw new Error(`Service ${name} not found`);
        }

        await serviceInstance.service.start();
      },

      stopService: async (name) => {
        const { services } = get();
        const serviceInstance = services[name];

        if (!serviceInstance) {
          throw new Error(`Service ${name} not found`);
        }

        await serviceInstance.service.stop();
      },

      restartService: async (name) => {
        const { services } = get();
        const serviceInstance = services[name];

        if (!serviceInstance) {
          throw new Error(`Service ${name} not found`);
        }

        await serviceInstance.service.restart();
      },

      callServiceTool: async (serviceName, toolName, arguments_) => {
        const { services } = get();
        const serviceInstance = services[serviceName];

        if (!serviceInstance) {
          throw new Error(`Service ${serviceName} not found`);
        }

        return await serviceInstance.service.callTool(toolName, arguments_);
      },

      refreshServiceData: async (name) => {
        const { services } = get();
        const serviceInstance = services[name];

        if (!serviceInstance) {
          throw new Error(`Service ${name} not found`);
        }

        await serviceInstance.service.refreshData();
      },

      clearServiceLogs: (name) => {
        set((state) => {
          const serviceInstance = state.services[name];
          if (!serviceInstance) return state;

          return {
            services: {
              ...state.services,
              [name]: {
                ...serviceInstance,
                logs: [],
              },
            },
          };
        });
      },

      importConfiguration: (config) => {
        Object.entries(config).forEach(([name, serviceConfig]) => {
          get().addService({
            name,
            ...serviceConfig,
          });
        });
      },

      exportConfiguration: () => {
        const { services } = get();
        const config: Record<string, Omit<MCPServerConfig, "name">> = {};

        Object.values(services).forEach((serviceInstance) => {
          const { name, ...serviceConfig } = serviceInstance.config;
          config[name] = serviceConfig;
        });

        return config;
      },

      initializeStateCallbacks: () => {
        const { services } = get();

        Object.entries(services).forEach(([name, serviceInstance]) => {
          const onUpdate = () => {
            set((currentState) => ({ ...currentState }));
          };

          set((state) => ({
            services: {
              ...state.services,
              [name]: createServiceInstance(serviceInstance.config, onUpdate),
            },
          }));
        });
      },
    }),
    {
      name: "mcp-storage",
      partialize: (state) => ({
        services: Object.fromEntries(
          Object.entries(state.services)
            .filter(
              ([_, serviceInstance]) =>
                serviceInstance &&
                serviceInstance.config &&
                serviceInstance.config.name
            )
            .map(([name, serviceInstance]) => [
              name,
              {
                config: serviceInstance.config,
                status: MCPServerStatus.Stopped,
                logs: [],
              },
            ])
        ),
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.services) {
          Object.entries(state.services).forEach(([name, data]) => {
            if (data.config) {
              state.services[name] = createServiceInstance(data.config);
            }
          });
        }
      },
    }
  )
);
