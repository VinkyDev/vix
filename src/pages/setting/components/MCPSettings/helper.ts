/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { MCPServerConfig } from "@/types";

// 命令选项
export const commandOptions = [
  { label: "npx", value: "npx", description: "Node.js 包执行器" },
];

// 将表单数据转换为JSON格式（符合MCP规范）
export const formToJson = (
  formData: any,
  isEdit: boolean,
  serverName?: string
): string => {
  const currentServerName = formData.name || (isEdit ? serverName : "");
  const config: Omit<MCPServerConfig, "name"> = {
    command: formData.command || "",
    args: formData.args ? formData.args.split(/\s+/).filter(Boolean) : [],
    env: {},
    cwd: formData.cwd || undefined,
  };

  // 处理环境变量
  if (formData.envVars && formData.envVars.length > 0) {
    formData.envVars.forEach((item: { key: string; value: string }) => {
      if (item.key && item.value) {
        config.env![item.key] = item.value;
      }
    });
  }

  if (Object.keys(config.env!).length === 0) {
    delete config.env;
  }

  // 返回符合MCP规范的格式：以服务名为键的对象
  const mcpFormat = {
    [currentServerName]: config,
  };

  return JSON.stringify(mcpFormat, null, 2);
};

// 将JSON格式转换为表单数据（支持MCP规范格式）
export const jsonToForm = (jsonString: string) => {
  try {
    const parsed = JSON.parse(jsonString);

    // 检查是否是MCP规范格式（对象的键是服务名）
    let config: MCPServerConfig;
    let configName = "";

    if (typeof parsed === "object" && parsed !== null) {
      const keys = Object.keys(parsed);
      if (keys.length === 1 && typeof parsed[keys[0]] === "object") {
        // MCP规范格式：{ "服务名": { command, args, env, cwd } }
        configName = keys[0];
        config = {
          name: configName,
          ...parsed[configName],
        };
      } else if (parsed.name && parsed.command) {
        // 传统格式：{ name, command, args, env, cwd }
        config = parsed;
        configName = config.name;
      } else {
        throw new Error("Invalid configuration format");
      }
    } else {
      throw new Error("Invalid JSON format");
    }

    const envVars = config.env
      ? Object.entries(config.env).map(([key, value]) => ({ key, value }))
      : [];

    return {
      name: configName,
      command: config.command || "",
      args: config.args ? config.args.join(" ") : "",
      cwd: config.cwd || "",
      envVars,
    };
  } catch {
    throw new Error("Invalid JSON format");
  }
};

// 从JSON数据解析服务配置（用于提交时处理）
export const parseJsonConfig = (jsonValue: string): MCPServerConfig => {
  const parsed = JSON.parse(jsonValue);

  // 检查是否是MCP规范格式
  if (typeof parsed === "object" && parsed !== null) {
    const keys = Object.keys(parsed);
    if (keys.length === 1 && typeof parsed[keys[0]] === "object") {
      // MCP规范格式：{ "服务名": { command, args, env, cwd } }
      const serviceName = keys[0];
      const serviceConfig = parsed[serviceName];

      return {
        name: serviceName,
        command: serviceConfig.command || "",
        args: serviceConfig.args || [],
        env: serviceConfig.env,
        cwd: serviceConfig.cwd,
      };
    } else if (parsed.name && parsed.command) {
      // 传统格式：{ name, command, args, env, cwd }
      return parsed;
    } else {
      throw new Error(
        'JSON格式不正确。请使用MCP规范格式：{ "服务名": { "command": "...", "args": [...] } }'
      );
    }
  } else {
    throw new Error("JSON格式无效");
  }
};

// 验证配置的必填字段
export const validateConfig = (config: MCPServerConfig): boolean => {
  return !!(config.name && config.command);
};

// 从表单数据创建服务配置
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createConfigFromForm = (values: any): MCPServerConfig => {
  // 处理环境变量
  const env: Record<string, string> = {};
  if (values.envVars && values.envVars.length > 0) {
    values.envVars.forEach((item: { key: string; value: string }) => {
      if (item.key && item.value) {
        env[item.key] = item.value;
      }
    });
  }

  return {
    name: values.name,
    command: values.command,
    args: values.args ? values.args.split(/\s+/).filter(Boolean) : [],
    env: Object.keys(env).length > 0 ? env : undefined,
    cwd: values.cwd || undefined,
  };
};
