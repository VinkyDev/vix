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

// 注意：MCPServerInstance 和 MCPServerClient 已被重构
// 现在使用 MCPService (在 @/services/mcpService 中) 和 MCPServiceInstance (在 @/store/mcpStore 中)

// MCP 配置文件格式
export interface MCPConfiguration {
  mcpServers: Record<string, Omit<MCPServerConfig, 'name'>>;
}

// MCP JSON-RPC 消息类型
export interface JSONRPCMessage {
  jsonrpc: '2.0';
  id?: string | number;
  method?: string;
  params?: any;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

// MCP 工具定义
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
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
    tools?: Record<string, any>;
    resources?: Record<string, any>;
    prompts?: Record<string, any>;
  };
}

// MCP 客户端接口
export interface MCPClient {
  /** 是否已连接 */
  connected: boolean;

  /** 服务器信息 */
  serverInfo?: MCPServerInfo;

  /** 初始化连接 */
  initialize(): Promise<void>;

  /** 断开连接 */
  disconnect(): Promise<void>;

  /** 获取可用工具列表 */
  getTools(): Promise<MCPTool[]>;

  /** 调用工具 */
  callTool(name: string, arguments_: Record<string, any>): Promise<any>;

  /** 获取可用资源列表 */
  getResources(): Promise<MCPResource[]>;

  /** 读取资源内容 */
  readResource(uri: string): Promise<any>;

  /** 获取可用提示列表 */
  getPrompts(): Promise<MCPPrompt[]>;

  /** 获取提示内容 */
  getPrompt(name: string, arguments_?: Record<string, any>): Promise<any>;
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
