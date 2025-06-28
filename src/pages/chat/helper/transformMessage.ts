import { MessageStatus } from "@ant-design/x/es/use-x-chat";
import { SSEOutput } from "@ant-design/x/es/x-stream";

import { 
  OpenAIToolCall,
  StreamChoice,
  StreamMessage
} from '@/types';

/**
 * 工具调用累积器类
 * 负责管理流式工具调用的累积状态
 */
class ToolCallAccumulator {
  private toolCalls: Map<number, OpenAIToolCall> = new Map();

  /**
   * 处理工具调用增量更新
   */
  processToolCallDelta(toolCallDeltas: Array<{
    index: number;
    id?: string;
    type?: 'function';
    function?: {
      name?: string;
      arguments?: string;
    };
  }>): void {
    toolCallDeltas.forEach((delta) => {
      const { index } = delta;
      
      if (!this.toolCalls.has(index)) {
        // 初始化新的工具调用
        this.toolCalls.set(index, {
          id: delta.id || '',
          type: 'function',
          function: {
            name: delta.function?.name || '',
            arguments: delta.function?.arguments || '',
          },
        });
      } else {
        // 累积更新现有工具调用
        const existing = this.toolCalls.get(index)!;
        this.toolCalls.set(index, {
          ...existing,
          id: existing.id + (delta.id || ''),
          function: {
            name: existing.function.name + (delta.function?.name || ''),
            arguments: existing.function.arguments + (delta.function?.arguments || ''),
          },
        });
      }
    });
  }

  /**
   * 获取当前累积的工具调用列表
   */
  getToolCalls(): OpenAIToolCall[] {
    return Array.from(this.toolCalls.values())
      .filter(call => call.function.name); // 只返回有名称的工具调用
  }

  /**
   * 清空累积状态
   */
  clear(): void {
    this.toolCalls.clear();
  }

  /**
   * 检查是否有有效的工具调用
   */
  hasValidToolCalls(): boolean {
    return this.getToolCalls().length > 0;
  }
}

/**
 * 内容格式化器类
 * 负责格式化不同类型的消息内容
 */
class ContentFormatter {
  /**
   * 格式化推理内容
   */
  static formatThinkingContent(
    originContent: string | undefined,
    currentThink: string,
    currentContent: string
  ): string {
    if (!originContent && currentThink) {
      return `<think>${currentThink}`;
    }
    
    if (
      originContent?.includes('<think>') &&
      !originContent.includes('</think>') &&
      currentContent
    ) {
      return `${originContent}</think>${currentContent}`;
    }
    
    return `${originContent || ''}${currentThink}${currentContent}`;
  }

  /**
   * 格式化工具调用状态显示
   */
  static formatToolCallsStatus(toolCalls: OpenAIToolCall[]): string {
    if (toolCalls.length === 0) {
      return '';
    }

    const toolCallsText = toolCalls
      .map(call => `🔧 正在调用工具: ${call.function.name}`)
      .join('\n');
    
    return `\n\n${toolCallsText}`;
  }
}

/**
 * 流式消息解析器
 * 负责解析 SSE 消息
 */
class StreamMessageParser {
  /**
   * 解析 SSE 消息块
   */
  static parseChunk(chunk: SSEOutput): {
    content: string;
    reasoning: string;
    toolCallDeltas: Array<{
      index: number;
      id?: string;
      type?: 'function';
      function?: { name?: string; arguments?: string; };
    }>;
    finishReason: string | null;
  } {
    const result = {
      content: '',
      reasoning: '',
      toolCallDeltas: [] as Array<{
        index: number;
        id?: string;
        type?: 'function';
        function?: { name?: string; arguments?: string; };
      }>,
      finishReason: null as string | null,
    };

    if (!chunk?.data || chunk.data.includes('DONE')) {
      return result;
    }

    try {
      const message: StreamMessage = JSON.parse(chunk.data);
      const choice: StreamChoice | undefined = message.choices?.[0];
      
      if (!choice) {
        return result;
      }

      result.content = choice.delta.content || '';
      result.reasoning = choice.delta.reasoning_content || '';
      result.finishReason = choice.finish_reason || null;
      
      if (choice.delta.tool_calls) {
        result.toolCallDeltas = choice.delta.tool_calls;
      }

      return result;
    } catch {
      // 静默处理解析错误，返回空结果
      return result;
    }
  }
}

// 创建工具调用累积器实例（每个会话一个）
const toolCallAccumulators = new Map<string, ToolCallAccumulator>();

/**
 * 获取或创建工具调用累积器
 */
function getToolCallAccumulator(sessionId: string = 'default'): ToolCallAccumulator {
  if (!toolCallAccumulators.has(sessionId)) {
    toolCallAccumulators.set(sessionId, new ToolCallAccumulator());
  }
  return toolCallAccumulators.get(sessionId)!;
}

/**
 * 清理工具调用累积器
 */
function clearToolCallAccumulator(sessionId: string = 'default'): void {
  const accumulator = toolCallAccumulators.get(sessionId);
  if (accumulator) {
    accumulator.clear();
  }
}

/**
 * 转换流式消息为标准格式
 * 
 * @param info 来自 Ant Design X 的消息转换信息
 * @param sessionId 会话ID，用于管理工具调用状态
 * @returns 转换后的消息
 */
export function transformMessage(
  info: {
    chunk: SSEOutput;
    chunks: SSEOutput[];
    status: MessageStatus;
    originMessage?: any;
  },
  sessionId: string = 'default'
) {
  const { chunk, status, originMessage } = info;
  const accumulator = getToolCallAccumulator(sessionId);
  
  // 解析当前消息块
  const parsed = StreamMessageParser.parseChunk(chunk);
  
  // 处理工具调用增量
  if (parsed.toolCallDeltas.length > 0) {
    accumulator.processToolCallDelta(parsed.toolCallDeltas);
  }
  
  // 格式化内容
  let content = ContentFormatter.formatThinkingContent(
    originMessage?.content,
    parsed.reasoning,
    parsed.content
  );
  
  // 添加工具调用状态显示
  if (accumulator.hasValidToolCalls()) {
    const toolCallsStatus = ContentFormatter.formatToolCallsStatus(
      accumulator.getToolCalls()
    );
    content += toolCallsStatus;
  }
  
  // 构建返回结果
  const result = {
    content,
    role: 'assistant' as const,
    tool_calls: status === 'success' && accumulator.hasValidToolCalls() 
      ? accumulator.getToolCalls() 
      : undefined,
  };
  
  // 清理状态（在完成或错误时）
  if (status === 'success' || status === 'error') {
    clearToolCallAccumulator(sessionId);
  }
  
  return result;
}

/**
 * 手动清理指定会话的工具调用状态
 */
export function clearMessageTransformState(sessionId: string = 'default'): void {
  clearToolCallAccumulator(sessionId);
}
