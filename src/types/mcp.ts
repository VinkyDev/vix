import { JSONSchema7 } from './schema';

// MCP 服务配置
export interface MCPServerConfig {
  /** 服务名称 */
  name: string;
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
  Stopped = 'stopped',
  Starting = 'starting',
  Running = 'running',
  Stopping = 'stopping',
  Error = 'error',
}

// MCP JSON-RPC 消息类型
export interface JSONRPCMessage {
  jsonrpc: '2.0';
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
    type: 'object';
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
    type: 'text' | 'image' | 'resource';
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
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: {
        type: 'object';
        properties: Record<string, JSONSchema7>;
        required?: string[];
      };
    };
  };
} 