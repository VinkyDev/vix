import { arch, platform } from "@tauri-apps/plugin-os";

/**
 * 平台兼容性工具
 */
export class PlatformUtils {
  /**
   * 检查当前是否为 Windows 平台
   */
  static isWindows(): boolean {
    return platform() === "windows";
  }

  /**
   * 获取当前平台的路径分隔符
   */
  static getPathSeparator(): string {
    return this.isWindows() ? ";" : ":";
  }

  /**
   * 获取当前平台的 PATH 环境变量名
   */
  static getPathEnvKey(): string {
    return this.isWindows() ? "Path" : "PATH";
  }

  /**
   * 简单的路径基名提取
   */
  private static getBasename(filePath: string): string {
    const parts = filePath.split(/[/\\]/);
    return parts[parts.length - 1] || "";
  }

  /**
   * 简单的路径规范化
   */
  private static normalizePath(filePath: string): string {
    if (!filePath) return "";

    const separator = this.isWindows() ? "\\" : "/";
    return filePath.replace(/[/\\]+/g, separator).replace(/[/\\]$/, "");
  }

  /**
   * 处理命令执行，Windows 上的 npm 相关命令使用 cmd.exe
   */
  static processCommand(
    command: string,
    args: string[]
  ): { command: string; args: string[] } {
    if (!this.isWindows()) {
      return { command, args };
    }

    const basename = this.getBasename(command);
    const npmCommands = ["npm", "npx", "node"];

    if (npmCommands.includes(basename)) {
      return {
        command: "cmd.exe",
        args: ["/c", command, ...args],
      };
    }

    return { command, args };
  }

  /**
   * 规范化路径数组并连接为环境变量值
   */
  static normalizePathEnv(paths: string[]): string {
    const separator = this.getPathSeparator();
    const normalizedPaths = paths
      .filter(Boolean)
      .map((p) => this.normalizePath(p));

    return normalizedPaths.join(separator);
  }

  /**
   * 合并并规范化 PATH 环境变量
   */
  static mergePathEnv(
    customPaths: string[] = [],
    systemPath?: string
  ): Record<string, string> {
    const pathKey = this.getPathEnvKey();
    const allPaths: string[] = [...customPaths];

    if (systemPath) {
      allPaths.push(systemPath);
    }

    const pathValue = this.normalizePathEnv(allPaths);

    return {
      [pathKey]: pathValue,
    };
  }

  /**
   * 处理环境变量，确保跨平台兼容性
   */
  static processEnvironmentVariables(
    env?: Record<string, string>
  ): Record<string, string> {
    if (!env) return {};

    const processedEnv = { ...env };
    const pathKeys = ["PATH", "Path", "path"];
    const pathValues: string[] = [];

    pathKeys.forEach((key) => {
      if (processedEnv[key]) {
        pathValues.push(processedEnv[key]);
        delete processedEnv[key];
      }
    });

    if (pathValues.length > 0) {
      const allPaths = pathValues
        .join(this.getPathSeparator())
        .split(this.getPathSeparator());
      const mergedPathEnv = this.mergePathEnv(allPaths);
      Object.assign(processedEnv, mergedPathEnv);
    }

    return processedEnv;
  }

  /**
   * 获取平台信息字符串
   */
  static getPlatformInfo(): string {
    return `${platform()} (${arch()})`;
  }

  /**
   * 获取当前平台名称
   */
  static getPlatform(): string {
    return platform();
  }

  /**
   * 获取当前架构
   */
  static getArchitecture(): string {
    return arch();
  }
}
