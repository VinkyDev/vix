import { JSONSchema7 } from "./schema";

// MCP 服务配置
export interface MCPServerConfig {
  /** 服务名称 */
  name: string;
  /** 服务显示名称 */
  displayName?: string;
  /** 服务图标 */
  icon?: string;
  /** 命令 */
  command: string;
  /** 参数 */
  args: string[];
  /** 环境变量 */
  env?: Record<string, string>;
  /** 工作目录 */
  cwd?: string;
}

// MCP 服务状态
export enum MCPServerStatus {
  Stopped = "stopped",
  Starting = "starting",
  Running = "running",
  Stopping = "stopping",
  Error = "error",
}

// MCP JSON-RPC 消息类型
export interface JSONRPCMessage {
  jsonrpc: "2.0";
  id?: string | number;
  method?: string;
  params?: JSONSchema7;
  result?: JSONSchema7;
  error?: {
    code: number;
    message: string;
    data?: JSONSchema7;
  };
}

// MCP 工具定义
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, JSONSchema7>;
    required?: string[];
  };
}

// MCP 资源定义
export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

// MCP 提示定义
export interface MCPPrompt {
  name: string;
  description?: string;
  arguments?: Array<{
    name: string;
    description?: string;
    required?: boolean;
  }>;
}

// MCP 服务器信息
export interface MCPServerInfo {
  name: string;
  version: string;
  protocolVersion: string;
  capabilities?: {
    tools?: Record<string, JSONSchema7>;
    resources?: Record<string, JSONSchema7>;
    prompts?: Record<string, JSONSchema7>;
  };
}

// MCP 工具调用结果
export interface MCPToolResult {
  content: Array<{
    type: "text" | "image" | "resource";
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

// MCP 与 OpenAI 工具的适配器接口
export interface MCPToolAdapter {
  serviceName: string;
  tool: MCPTool;
  openAITool: {
    type: "function";
    function: {
      name: string;
      description: string;
      parameters: {
        type: "object";
        properties: Record<string, JSONSchema7>;
        required?: string[];
      };
    };
  };
}

// MCP 市场相关类型定义

/** MCP 市场中的参数配置项 */
export interface MCPMarketParam {
  /** 参数键名 */
  key: string;
  /** 参数显示名称 */
  label: string;
  /** 参数描述 */
  description?: string;
  /** 参数类型 */
  type: "string" | "number" | "boolean";
  /** 参数位置：env=环境变量，args=命令行参数 */
  position: "env" | "args";
  /** 是否必需 */
  required: boolean;
  /** 默认值 */
  defaultValue?: string | number | boolean;
  /** 占位符 */
  placeholder?: string;
  /** 验证规则 */
  validation?: {
    pattern?: string;
    message?: string;
  };
  /** 是否支持多个值（仅适用于args类型） */
  multiple?: boolean;
  /** 多个值的分隔符（默认为逗号） */
  separator?: string;
}

/** MCP 市场中的服务模板 */
export interface MCPMarketTemplate {
  /** 模板ID */
  id: string;
  /** 服务名称 */
  name: string;
  /** 服务显示名称 */
  displayName: string;
  /** 服务描述 */
  description: string;
  /** 服务图标 */
  icon?: string;
  /** 服务分类 */
  category: string;
  /** 服务标签 */
  tags: string[];
  /** 仓库地址 */
  repository?: string;
  /** 文档地址 */
  documentation?: string;
  /** 基础配置模板 */
  template: {
    command: string;
    args: string[];
    env?: Record<string, string>;
    cwd?: string;
  };
  /** 需要用户配置的参数 */
  params: MCPMarketParam[];
  /** 是否为热门服务 */
  popular?: boolean;
  /** 是否为官方服务 */
  official?: boolean;
  /** 配置指引 */
  guide?: {
    /** 指引标题 */
    title: string;
    /** 指引描述 */
    description: string;
    /** 指引步骤 */
    steps: string[];
    /** 相关链接 */
    links?: Array<{
      text: string;
      url: string;
    }>;
  };
}

/** MCP 市场分类 */
export interface MCPMarketCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
}
