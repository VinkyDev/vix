import { MessageType } from "../store/messageStore";
import { OpenAITool } from "./openai";

// 流式消息处理相关类型
export interface StreamChoice {
  delta: {
    content?: string;
    reasoning_content?: string;
    tool_calls?: Array<{
      index: number;
      id?: string;
      type?: "function";
      function?: {
        name?: string;
        arguments?: string;
      };
    }>;
  };
  finish_reason?: "stop" | "tool_calls" | "length" | "content_filter" | null;
}

export interface StreamMessage {
  choices: StreamChoice[];
}

// 聊天请求相关类型
export interface ChatRequestWithTools {
  tools?: OpenAITool[];
  tool_choice?:
    | "auto"
    | "none"
    | { type: "function"; function: { name: string } };
}

// 聊天请求参数类型
export interface ChatRequestParams {
  enable_thinking: boolean;
  enable_search: boolean;
  search: { type: string };
  search_options: { forced_search: boolean };
  thinking: { type: string };
  stream: boolean;
  message: MessageType;
  messages: MessageType[];
  tools?: OpenAITool[];
  tool_choice?: string;
}

// 工具调用状态跟踪
export interface ToolCallStatusInfo {
  id: string;
  toolName: string;
  status: "pending" | "success" | "error";
  result?: string;
  error?: string;
}

// 消息中的工具调用信息
export interface MessageToolCallInfo {
  pendingCalls: ToolCallStatusInfo[];
  completedCalls: ToolCallStatusInfo[];
}
