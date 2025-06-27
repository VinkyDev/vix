import { Child, Command } from '@tauri-apps/plugin-shell';

import { MCPServerConfig } from '@/types';

export interface MCPServerEvents {
  onProcessStart?: (pid: number) => void;
  onProcessExit?: (code: number) => void;
  onProcessError?: (error: string) => void;
  onStdout?: (data: string) => void;
  onStderr?: (data: string) => void;
}

/**
 * MCP 服务进程管理器
 * 职责：纯粹的进程启动、停止、监控
 */
export class MCPServer {
  private _child?: Child;
  private _cmd?: Command<string>;
  private _isRunning = false;

  constructor(
    private config: MCPServerConfig,
    private events: MCPServerEvents = {}
  ) {}

  get isRunning(): boolean {
    return this._isRunning;
  }

  get pid(): number | undefined {
    return this._child?.pid;
  }

  get child(): Child | undefined {
    return this._child;
  }

  async start(): Promise<void> {
    if (this._isRunning) {
      throw new Error('Server is already running');
    }

    try {
      // 创建命令
      this._cmd = Command.create(this.config.command, this.config.args, {
        cwd: this.config.cwd,
        env: this.config.env,
      });

      // 设置事件监听
      this.setupEventListeners();

      // 启动进程
      this._child = await this._cmd.spawn();
      this._isRunning = true;

      this.events.onProcessStart?.(this._child.pid);
    } catch (error) {
      this._isRunning = false;
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.events.onProcessError?.(errorMessage);
      throw new Error(`Failed to start MCP server: ${errorMessage}`);
    }
  }

  async stop(): Promise<void> {
    if (!this._isRunning || !this._child) {
      return;
    }

    try {
      await this._child.kill();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.events.onProcessError?.(errorMessage);
      throw new Error(`Failed to stop MCP server: ${errorMessage}`);
    } finally {
      this.cleanup();
    }
  }

  private setupEventListeners(): void {
    if (!this._cmd) return;

    this._cmd.stdout.on('data', (data: string) => {
      this.events.onStdout?.(data);
    });

    this._cmd.stderr.on('data', (data: string) => {
      this.events.onStderr?.(data);
    });

    this._cmd.on('close', (data: any) => {
      this.cleanup();
      this.events.onProcessExit?.(data.code);
    });

    this._cmd.on('error', (error: any) => {
      this.cleanup();
      this.events.onProcessError?.(String(error));
    });
  }

  private cleanup(): void {
    this._isRunning = false;
    this._child = undefined;
    this._cmd = undefined;
  }
}
