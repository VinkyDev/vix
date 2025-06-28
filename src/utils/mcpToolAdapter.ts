import { MCPTool, MCPToolAdapter, OpenAITool } from '@/types';

/**
 * 将MCP工具转换为OpenAI格式的工具
 * @param serviceName MCP服务名称
 * @param mcpTool MCP工具定义
 * @returns OpenAI格式的工具
 */
export function convertMCPToolToOpenAI(serviceName: string, mcpTool: MCPTool): MCPToolAdapter {
  const openAITool: OpenAITool = {
    type: 'function',
    function: {
      name: `${serviceName}_${mcpTool.name}`,
      description: mcpTool.description,
      parameters: {
        type: 'object',
        properties: mcpTool.inputSchema.properties,
        required: mcpTool.inputSchema.required,
      },
    },
  };

  return {
    serviceName,
    tool: mcpTool,
    openAITool,
  };
}

/**
 * 从工具名称中解析服务名称和工具名称
 * @param toolName OpenAI格式的工具名称 (serviceName_toolName)
 * @returns 解析后的服务名称和工具名称
 */
export function parseToolName(toolName: string): { serviceName: string; toolName: string } {
  const parts = toolName.split('_');
  if (parts.length < 2) {
    throw new Error(`Invalid tool name format: ${toolName}`);
  }
  
  const serviceName = parts[0];
  const actualToolName = parts.slice(1).join('_');
  
  return { serviceName, toolName: actualToolName };
}

/**
 * 将MCP工具调用结果转换为字符串格式
 * @param result MCP工具调用结果
 * @returns 格式化的字符串结果
 */
export function formatMCPToolResult(result: any): string {
  if (!result || !result.content) {
    return JSON.stringify(result);
  }

  const textContent = result.content
    .filter((item: any) => item.type === 'text')
    .map((item: any) => item.text)
    .join('\n');

  if (textContent) {
    return textContent;
  }

  // 如果没有文本内容，返回原始JSON
  return JSON.stringify(result);
} 