import { JSONSchema7 } from './schema';

// OpenAI 工具调用相关类型定义
export interface OpenAITool {
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
}

export interface OpenAIToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface OpenAIToolMessage {
  role: 'tool';
  content: string;
  tool_call_id: string;
}

// 工具调用结果接口
export interface ToolCallResult {
  role: 'tool';
  content: string;
  tool_call_id: string;
}

// 工具调用状态
export interface ToolCallState {
  isProcessing: boolean;
  pendingCalls: OpenAIToolCall[];
  error?: string;
} 