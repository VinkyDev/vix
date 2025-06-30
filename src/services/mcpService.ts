import {
  MCPPrompt,
  MCPResource,
  MCPServerConfig,
  MCPServerInfo,
  MCPServerStatus,
  MCPTool,
  MCPToolResult,
} from "@/types";

import { MCPProtocolClient, MCPProtocolEvents } from "./mcpProtocol";
import { MCPServer, MCPServerEvents } from "./mcpServer";

export interface MCPServiceEvents {
  onStatusChange?: (status: MCPServerStatus) => void;
  onLog?: (message: string) => void;
  onToolsUpdate?: (tools: MCPTool[]) => void;
  onResourcesUpdate?: (resources: MCPResource[]) => void;
  onPromptsUpdate?: (prompts: MCPPrompt[]) => void;
}

/**
 * MCP 服务管理器
 * 职责：整合进程管理和协议通信，管理完整的 MCP 服务生命周期
 */
export class MCPService {
  private server?: MCPServer;
  private protocolClient?: MCPProtocolClient;
  private _status: MCPServerStatus = MCPServerStatus.Stopped;

  // 缓存的数据
  private _tools: MCPTool[] = [];
  private _resources: MCPResource[] = [];
  private _prompts: MCPPrompt[] = [];
  private _serverInfo?: MCPServerInfo;

  constructor(
    private config: MCPServerConfig,
    private events: MCPServiceEvents = {}
  ) {}

  // 公共属性 getter
  get status(): MCPServerStatus {
    return this._status;
  }

  get isRunning(): boolean {
    return this._status === MCPServerStatus.Running;
  }

  get isConnected(): boolean {
    return this.protocolClient?.connected || false;
  }

  get tools(): MCPTool[] {
    return [...this._tools];
  }

  get resources(): MCPResource[] {
    return [...this._resources];
  }

  get prompts(): MCPPrompt[] {
    return [...this._prompts];
  }

  get serverInfo(): MCPServerInfo | undefined {
    return this._serverInfo;
  }

  get pid(): number | undefined {
    return this.server?.pid;
  }

  // 核心操作方法
  async start(): Promise<void> {
    if (this._status !== MCPServerStatus.Stopped) {
      throw new Error(`Cannot start service in ${this._status} status`);
    }

    try {
      this.updateStatus(MCPServerStatus.Starting);
      this.log(`Starting MCP service: ${this.config.name}`);

      // 启动服务进程
      await this.startServer();

      // 等待一小段时间让服务稳定
      await this.delay(500);

      // 初始化协议客户端
      await this.initializeProtocolClient();

      // 加载数据
      await this.loadAllData();

      this.updateStatus(MCPServerStatus.Running);
      this.log(`MCP service started successfully: ${this.config.name}`);
    } catch (error) {
      await this.cleanup();
      this.updateStatus(MCPServerStatus.Error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.log(`Failed to start MCP service: ${errorMessage}`);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this._status === MCPServerStatus.Stopped) {
      return;
    }

    try {
      this.updateStatus(MCPServerStatus.Stopping);
      this.log(`Stopping MCP service: ${this.config.name}`);

      await this.cleanup();

      this.updateStatus(MCPServerStatus.Stopped);
      this.log(`MCP service stopped: ${this.config.name}`);
    } catch (error) {
      this.updateStatus(MCPServerStatus.Error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.log(`Error stopping MCP service: ${errorMessage}`);
      throw error;
    }
  }

  async restart(): Promise<void> {
    await this.stop();
    await this.delay(1000);
    await this.start();
  }

  // 协议操作方法
  async callTool(
    name: string,
    arguments_: Record<string, any>
  ): Promise<MCPToolResult> {
    this.ensureRunning();
    this.log(`Calling tool: ${name} with args: ${JSON.stringify(arguments_)}`);

    try {
      const result = await this.protocolClient!.callTool(name, arguments_);
      this.log(`Tool ${name} completed successfully`);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.log(`Tool ${name} failed: ${errorMessage}`);
      throw error;
    }
  }

  async refreshData(): Promise<void> {
    this.ensureRunning();
    await this.loadAllData();
  }

  async readResource(uri: string): Promise<any> {
    this.ensureRunning();
    return await this.protocolClient!.readResource(uri);
  }

  async getPrompt(
    name: string,
    arguments_?: Record<string, any>
  ): Promise<any> {
    this.ensureRunning();
    return await this.protocolClient!.getPrompt(name, arguments_);
  }

  // 私有方法
  private async startServer(): Promise<void> {
    const serverEvents: MCPServerEvents = {
      onProcessStart: (pid) => {
        this.log(`Server process started with PID: ${pid}`);
      },
      onProcessExit: (code) => {
        this.log(`Server process exited with code: ${code}`);
        this.handleServerDisconnection();
      },
      onProcessError: (error) => {
        this.log(`Server process error: ${error}`);
        this.handleServerDisconnection();
      },
      onStdout: (data) => {
        // 传递给协议客户端处理
        this.protocolClient?.handleMessage(data);
      },
      onStderr: (data) => {
        this.log(`[STDERR] ${data}`);
      },
    };

    this.server = new MCPServer(this.config, serverEvents);
    await this.server.start();
  }

  private async initializeProtocolClient(): Promise<void> {
    if (!this.server?.isRunning || !this.server.child) {
      throw new Error("Server is not running or child process not available");
    }

    const protocolEvents: MCPProtocolEvents = {
      onConnected: (serverInfo) => {
        this._serverInfo = serverInfo;
        this.log(
          `Protocol client connected to: ${serverInfo.name} v${serverInfo.version}`
        );
      },
      onDisconnected: () => {
        this.log("Protocol client disconnected");
        this.handleServerDisconnection();
      },
      onError: (error) => {
        this.log(`Protocol error: ${error}`);
      },
    };

    this.protocolClient = new MCPProtocolClient(
      this.server.child,
      protocolEvents
    );
    await this.protocolClient.initialize();
  }

  private async loadAllData(): Promise<void> {
    if (!this.protocolClient?.connected) {
      return;
    }

    try {
      const [tools, resources, prompts] = await Promise.all([
        this.protocolClient.getTools().catch(() => []),
        this.protocolClient.getResources().catch(() => []),
        this.protocolClient.getPrompts().catch(() => []),
      ]);

      this._tools = tools;
      this._resources = resources;
      this._prompts = prompts;

      this.events.onToolsUpdate?.(tools);
      this.events.onResourcesUpdate?.(resources);
      this.events.onPromptsUpdate?.(prompts);

      this.log(
        `Loaded ${tools.length} tools, ${resources.length} resources, ${prompts.length} prompts`
      );
    } catch (error) {
      this.log(`Failed to load data: ${error}`);
    }
  }

  private async cleanup(): Promise<void> {
    // 断开协议客户端
    if (this.protocolClient) {
      await this.protocolClient.disconnect();
      this.protocolClient = undefined;
    }

    // 停止服务进程
    if (this.server) {
      await this.server.stop();
      this.server = undefined;
    }

    // 清理缓存数据
    this._tools = [];
    this._resources = [];
    this._prompts = [];
    this._serverInfo = undefined;
  }

  private handleServerDisconnection(): void {
    this.updateStatus(MCPServerStatus.Stopped);
    this.cleanup().catch((error) => {
      this.log(`Error during cleanup: ${error}`);
    });
  }

  private updateStatus(status: MCPServerStatus): void {
    if (this._status === status) return;

    this._status = status;
    this.events.onStatusChange?.(status);
  }

  private log(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    this.events.onLog?.(logMessage);
  }

  private ensureRunning(): void {
    if (!this.isRunning || !this.isConnected) {
      throw new Error("MCP service is not running or not connected");
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
