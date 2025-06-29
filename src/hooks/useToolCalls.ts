import { useCallback, useRef, useState } from "react";

import { useMCPStore } from "@/store";
import { OpenAIToolCall, ToolCallResult, ToolCallState } from "@/types";
import { formatMCPToolResult, parseToolName } from "@/utils/mcpToolAdapter";

interface UseToolCallsOptions {
  onToolCallsComplete?: (results: ToolCallResult[]) => void;
  onError?: (error: Error) => void;
}

interface UseToolCallsReturn {
  toolCallState: ToolCallState;
  executeToolCalls: (toolCalls: OpenAIToolCall[]) => Promise<ToolCallResult[]>;
  clearState: () => void;
}

/**
 * 工具调用处理 Hook
 * 负责处理 OpenAI 格式的工具调用，转换为 MCP 调用并返回结果
 */
export function useToolCalls(
  options: UseToolCallsOptions = {}
): UseToolCallsReturn {
  const { onToolCallsComplete, onError } = options;
  const { callServiceTool } = useMCPStore();

  const [toolCallState, setToolCallState] = useState<ToolCallState>({
    isProcessing: false,
    pendingCalls: [],
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const executeToolCalls = useCallback(
    async (toolCalls: OpenAIToolCall[]): Promise<ToolCallResult[]> => {
      if (toolCalls.length === 0) {
        return [];
      }

      // 创建新的 AbortController
      abortControllerRef.current = new AbortController();

      setToolCallState({
        isProcessing: true,
        pendingCalls: [...toolCalls],
        error: undefined,
      });

      try {
        // 并行执行所有工具调用
        const toolResults = await Promise.all(
          toolCalls.map(async (toolCall): Promise<ToolCallResult> => {
            try {
              // 检查是否已取消
              if (abortControllerRef.current?.signal.aborted) {
                throw new Error("Tool call was cancelled");
              }

              const { serviceName, toolName } = parseToolName(
                toolCall.function.name
              );
              const args = JSON.parse(toolCall.function.arguments);

              const result = await callServiceTool(serviceName, toolName, args);
              const formattedResult = formatMCPToolResult(result);

              return {
                role: "tool" as const,
                content: formattedResult,
                tool_call_id: toolCall.id,
              };
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : String(error);

              return {
                role: "tool" as const,
                content: `工具调用失败: ${errorMessage}`,
                tool_call_id: toolCall.id,
              };
            }
          })
        );

        setToolCallState({
          isProcessing: false,
          pendingCalls: [],
        });

        onToolCallsComplete?.(toolResults);
        return toolResults;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        setToolCallState({
          isProcessing: false,
          pendingCalls: [],
          error: err.message,
        });

        onError?.(err);
        throw err;
      }
    },
    [callServiceTool, onToolCallsComplete, onError]
  );

  const clearState = useCallback(() => {
    // 取消正在进行的调用
    abortControllerRef.current?.abort();

    setToolCallState({
      isProcessing: false,
      pendingCalls: [],
      error: undefined,
    });
  }, []);

  return {
    toolCallState,
    executeToolCalls,
    clearState,
  };
}
