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

export interface MCPServiceInstance {
  config: MCPServerConfig;
  status: MCPServerStatus;
  logs: string[];
  service: MCPService;
  tools: MCPTool[];
  resources: MCPResource[];
  prompts: MCPPrompt[];
  pid: number | undefined;
  isConnected: boolean;
}

// 状态更新类型
type ServiceStateUpdates = Partial<
  Omit<MCPServiceInstance, "config" | "service" | "logs">
>;

type UpdateServiceStateFunction = (
  serviceName: string,
  updates: ServiceStateUpdates
) => void;

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
  updateServiceState: UpdateServiceStateFunction
): MCPServiceInstance {
  const logs: string[] = [];

  // 事件处理器生成函数 - 封装通用逻辑
  const createServiceEvents = (
    serviceName: string,
    service: MCPService
  ): MCPServiceEvents => ({
    onStatusChange: (status) => {
      updateServiceState(serviceName, {
        status,
        isConnected: service.isConnected,
        pid: service.pid,
      });
    },
    onLog: (message) => {
      logs.push(message);
      // 保留最近 100 条日志
      if (logs.length > 100) {
        logs.shift();
      }
    },
    onToolsUpdate: () => {
      updateServiceState(serviceName, {
        tools: [...service.tools],
      });
    },
    onResourcesUpdate: () => {
      updateServiceState(serviceName, {
        resources: [...service.resources],
      });
    },
    onPromptsUpdate: () => {
      updateServiceState(serviceName, {
        prompts: [...service.prompts],
      });
    },
  });

  // 创建服务和事件处理器
  const service = new MCPService(config, {} as MCPServiceEvents);
  const serviceEvents = createServiceEvents(config.name, service);
  // 设置事件处理器
  Object.assign(service["events"] || {}, serviceEvents);

  // 初始化状态
  return {
    config,
    status: service.status,
    logs,
    service,
    tools: [...service.tools],
    resources: [...service.resources],
    prompts: [...service.prompts],
    pid: service.pid,
    isConnected: service.isConnected,
  };
}

export const useMCPStore = create<MCPStore>()(
  persist(
    (set, get) => {
      // 状态更新函数
      const createUpdateServiceState = (): UpdateServiceStateFunction => {
        return (serviceName: string, updates: ServiceStateUpdates) => {
          set((state) => ({
            services: {
              ...state.services,
              [serviceName]: {
                ...state.services[serviceName],
                ...updates,
              },
            },
          }));
        };
      };

      // 服务实例创建和更新
      const createAndSetServiceInstance = (config: MCPServerConfig) => {
        return createServiceInstance(config, createUpdateServiceState());
      };

      // 服务获取
      const getServiceSafely = (name: string): MCPServiceInstance => {
        const service = get().services[name];
        if (!service) {
          throw new Error(`Service ${name} not found`);
        }
        return service;
      };

      // 停止服务
      const stopServiceIfRunning = async (
        serviceInstance: MCPServiceInstance
      ) => {
        if (serviceInstance.status === MCPServerStatus.Running) {
          await serviceInstance.service.stop();
        }
      };

      return {
        services: {},

        addService: (config) => {
          set((state) => ({
            services: {
              ...state.services,
              [config.name]: createAndSetServiceInstance(config),
            },
          }));
        },

        removeService: (name) => {
          const service = get().services[name];
          if (service) {
            stopServiceIfRunning(service);
          }

          set((state) => {
            const newServices = { ...state.services };
            delete newServices[name];
            return { services: newServices };
          });
        },

        updateService: (name, configUpdate) => {
          const serviceInstance = get().services[name];
          if (!serviceInstance) return;

          stopServiceIfRunning(serviceInstance);

          const newConfig = { ...serviceInstance.config, ...configUpdate };

          set((state) => ({
            services: {
              ...state.services,
              [name]: createAndSetServiceInstance(newConfig),
            },
          }));
        },

        startService: async (name) => {
          const serviceInstance = getServiceSafely(name);
          await serviceInstance.service.start();
        },

        stopService: async (name) => {
          const serviceInstance = getServiceSafely(name);
          await serviceInstance.service.stop();
        },

        restartService: async (name) => {
          const serviceInstance = getServiceSafely(name);
          await serviceInstance.service.restart();
        },

        callServiceTool: async (serviceName, toolName, arguments_) => {
          const serviceInstance = getServiceSafely(serviceName);
          return await serviceInstance.service.callTool(toolName, arguments_);
        },

        refreshServiceData: async (name) => {
          const serviceInstance = getServiceSafely(name);
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
          const { addService } = get();
          Object.entries(config).forEach(([name, serviceConfig]) => {
            addService({ name, ...serviceConfig });
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
          const updateServiceState = createUpdateServiceState();

          Object.entries(services).forEach(([name, serviceInstance]) => {
            set((state) => ({
              services: {
                ...state.services,
                [name]: createServiceInstance(
                  serviceInstance.config,
                  updateServiceState
                ),
              },
            }));
          });
        },
      };
    },
    {
      name: "mcp-storage",
      partialize: (state) => ({
        services: Object.fromEntries(
          Object.entries(state.services)
            .filter(([_name, serviceInstance]) => serviceInstance?.config?.name)
            .map(([serviceName, serviceInstance]) => [
              serviceName,
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
          setTimeout(() => {
            const store = useMCPStore.getState();
            Object.entries(state.services).forEach(([_name, data]) => {
              if (data.config) {
                store.addService(data.config);
              }
            });
          }, 0);
        }
      },
    }
  )
);
