import { Child } from "@tauri-apps/plugin-shell";

import {
  JSONRPCMessage,
  MCPPrompt,
  MCPResource,
  MCPServerInfo,
  MCPTool,
  MCPToolResult,
} from "@/types";

export interface MCPProtocolEvents {
  onMessage?: (message: JSONRPCMessage) => void;
  onConnected?: (serverInfo: MCPServerInfo) => void;
  onDisconnected?: () => void;
  onError?: (error: string) => void;
}

/**
 * MCP 协议客户端
 * 职责：纯粹的 JSON-RPC 协议通信
 */
export class MCPProtocolClient {
  private requestId = 0;
  private pendingRequests = new Map<
    number,
    {
      resolve: (value: any) => void;
      reject: (error: any) => void;
      timeout: NodeJS.Timeout;
    }
  >();

  private _connected = false;
  private _serverInfo?: MCPServerInfo;

  constructor(
    private child: Child,
    private events: MCPProtocolEvents = {},
    private requestTimeout = 30000
  ) {}

  get connected(): boolean {
    return this._connected;
  }

  get serverInfo(): MCPServerInfo | undefined {
    return this._serverInfo;
  }

  async initialize(): Promise<MCPServerInfo> {
    if (this._connected) {
      throw new Error("Client is already connected");
    }

    try {
      // 发送初始化请求
      const serverInfo = await this.sendRequest("initialize", {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
        clientInfo: {
          name: "Vix",
          version: "0.1.0",
        },
      });

      // 发送初始化完成通知
      await this.sendNotification("initialized", {});

      this._connected = true;
      this._serverInfo = serverInfo;
      this.events.onConnected?.(serverInfo);

      return serverInfo;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.events.onError?.(errorMessage);
      throw new Error(`MCP protocol initialization failed: ${errorMessage}`);
    }
  }

  async disconnect(): Promise<void> {
    if (!this._connected) {
      return;
    }

    // 清理所有待处理的请求
    this.pendingRequests.forEach(({ reject, timeout }) => {
      clearTimeout(timeout);
      reject(new Error("Connection closed"));
    });
    this.pendingRequests.clear();

    this._connected = false;
    this._serverInfo = undefined;
    this.events.onDisconnected?.();
  }

  async getTools(): Promise<MCPTool[]> {
    this.ensureConnected();
    const result = await this.sendRequest("tools/list", {});
    return result.tools || [];
  }

  async callTool(
    name: string,
    arguments_: Record<string, any>
  ): Promise<MCPToolResult> {
    this.ensureConnected();
    return await this.sendRequest("tools/call", {
      name,
      arguments: arguments_,
    });
  }

  async getResources(): Promise<MCPResource[]> {
    this.ensureConnected();
    const result = await this.sendRequest("resources/list", {});
    return result.resources || [];
  }

  async readResource(uri: string): Promise<any> {
    this.ensureConnected();
    return await this.sendRequest("resources/read", { uri });
  }

  async getPrompts(): Promise<MCPPrompt[]> {
    this.ensureConnected();
    const result = await this.sendRequest("prompts/list", {});
    return result.prompts || [];
  }

  async getPrompt(
    name: string,
    arguments_?: Record<string, any>
  ): Promise<any> {
    this.ensureConnected();
    return await this.sendRequest("prompts/get", {
      name,
      arguments: arguments_ || {},
    });
  }

  handleMessage(data: string): void {
    // 按行分割消息，因为可能一次收到多条消息
    const lines = data.trim().split("\n");

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const message: JSONRPCMessage = JSON.parse(line);
        this.processMessage(message);
      } catch (error) {
        this.events.onError?.(`Failed to parse JSON-RPC message: ${error}`);
      }
    }
  }

  private async sendRequest(method: string, params: any): Promise<any> {
    const id = ++this.requestId;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timeout: ${method}`));
      }, this.requestTimeout);

      this.pendingRequests.set(id, { resolve, reject, timeout });

      const message: JSONRPCMessage = {
        jsonrpc: "2.0",
        id,
        method,
        params,
      };

      this.sendMessage(message).catch((error) => {
        clearTimeout(timeout);
        this.pendingRequests.delete(id);
        reject(error);
      });
    });
  }

  private async sendNotification(method: string, params: any): Promise<void> {
    const message: JSONRPCMessage = {
      jsonrpc: "2.0",
      method,
      params,
    };

    await this.sendMessage(message);
  }

  private async sendMessage(message: JSONRPCMessage): Promise<void> {
    const messageStr = `${JSON.stringify(message)}\n`;
    await this.child.write(messageStr);
  }

  private processMessage(message: JSONRPCMessage): void {
    this.events.onMessage?.(message);

    // 处理响应消息
    if (message.id !== undefined) {
      const pending = this.pendingRequests.get(message.id as number);
      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingRequests.delete(message.id as number);

        if (message.error) {
          pending.reject(
            new Error(`${message.error.message} (${message.error.code})`)
          );
        } else {
          pending.resolve(message.result);
        }
      }
    }

    // 处理服务器发起的通知和请求
    if (message.method && message.id === undefined) {
      // 处理通知
      this.handleServerNotification(message);
    } else if (message.method && message.id !== undefined) {
      // 处理服务器请求
      this.handleServerRequest(message);
    }
  }

  private handleServerNotification(message: JSONRPCMessage): void {
    // 处理服务器推送的通知
    switch (message.method) {
      case "notifications/resources/list_changed":
      case "notifications/resources/updated":
      case "notifications/tools/list_changed":
      case "notifications/prompts/list_changed":
        // 触发相应的事件，让上层处理
        break;
    }
  }

  private handleServerRequest(message: JSONRPCMessage): void {
    // 对于不支持的请求，返回错误
    const response: JSONRPCMessage = {
      jsonrpc: "2.0",
      id: message.id,
      error: {
        code: -32601,
        message: "Method not found",
      },
    };
    this.sendMessage(response).catch(() => {
      // 忽略发送错误
    });
  }

  private ensureConnected(): void {
    if (!this._connected) {
      throw new Error("MCP client is not connected");
    }
  }
}
