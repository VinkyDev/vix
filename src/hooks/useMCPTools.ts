import { useMemo } from "react";

import { useMCPStore, useUserSettingsStore } from "@/store";
import { MCPServerStatus, MCPToolAdapter, OpenAITool } from "@/types";
import { convertMCPToolToOpenAI } from "@/utils/mcpToolAdapter";

/**
 * 获取当前选中的MCP服务的所有工具并转换为OpenAI格式
 */
export function useMCPTools() {
  const { services } = useMCPStore();
  const { selectedMCPServices } = useUserSettingsStore();

  // 获取所有选中服务的工具并转换为OpenAI格式
  const { tools, adapters } = useMemo(() => {
    const toolAdapters: MCPToolAdapter[] = [];
    const openAITools: OpenAITool[] = [];

    selectedMCPServices.forEach((serviceName) => {
      const service = services[serviceName];
      if (
        service &&
        service.status === MCPServerStatus.Running &&
        service.isConnected
      ) {
        service.tools.forEach((mcpTool) => {
          const adapter = convertMCPToolToOpenAI(serviceName, mcpTool);
          toolAdapters.push(adapter);
          openAITools.push(adapter.openAITool);
        });
      }
    });

    return {
      tools: openAITools,
      adapters: toolAdapters,
    };
  }, [services, selectedMCPServices]);

  // 根据工具名称查找对应的适配器
  const findAdapter = (toolName: string): MCPToolAdapter | undefined => {
    return adapters.find(
      (adapter) => adapter.openAITool.function.name === toolName
    );
  };

  return {
    /** OpenAI格式的工具列表 */
    tools,
    /** 所有工具适配器 */
    adapters,
    /** 根据工具名称查找适配器 */
    findAdapter,
    /** 是否有可用的工具 */
    hasTools: tools.length > 0,
  };
}
