import {
  Bubble,
  BubbleProps,
  Sender,
  useXAgent,
  useXChat,
} from "@ant-design/x";
import { MessageInfo } from "@ant-design/x/es/use-x-chat";
import { Flex, GetRef } from "antd";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useMCPTools, useToolCalls } from "@/hooks";
import { roles } from "@/pages/chat/constants";
import {
  type MessageType,
  useApiKeyStore,
  useMessageStore,
  useModelStore,
  useUserSettingsStore,
} from "@/store";
import { ChatRequestParams } from "@/types";
import { emitter } from "@/utils";
import { getErrorMessage } from "@/utils/error";

import ActionBar from "./components/ActionBar";
import { ConversationDrawer } from "./components/ConversationDrawer";
import "./index.scss";
import { TitleBar } from "./components/TitleBar";
import { Welcome } from "./components/Welcome";
import {
  calculateMessagesToSend,
  clearMessageTransformState,
  shouldUpdateMessages,
  transformMessage,
} from "./helper";

const ChatComponent = () => {
  const [content, setContent] = useState("");
  const { getCurrentModel } = useModelStore();
  const { getApiKey } = useApiKeyStore();
  const { useThinking, contextWindowSize, useSearch } = useUserSettingsStore();
  const { tools: mcpTools, hasTools } = useMCPTools();

  const { baseURL, modelId, providerId, thinkingId } = getCurrentModel();

  const [agent] = useXAgent<MessageType>({
    baseURL,
    dangerouslyApiKey: `Bearer ${getApiKey(providerId)}`,
    model: useThinking && thinkingId ? thinkingId : modelId,
  });

  const senderRef = useRef<GetRef<typeof Sender>>(null);
  const abortController = useRef<AbortController | null>(null);
  const messagesRef = useRef<MessageInfo<MessageType>[]>([]);

  const {
    messages: messageStoreMessages,
    setMessages: setMessageStoreMessages,
    getCurrentConversation,
  } = useMessageStore(
    useShallow((state) => ({
      messages: state.messages,
      setMessages: state.setMessages,
      getCurrentConversation: state.getCurrentConversation,
    }))
  );

  const currentConversation = getCurrentConversation();
  const sessionId = currentConversation?.id || "default";

  const { executeToolCalls, clearState: clearToolCallState } = useToolCalls({
    onToolCallsComplete: (results) => {
      const combinedContent = results[0].content;
      const combinedToolCallIds = results[0].tool_call_id;
      sendMessage({
        content: combinedContent,
        role: "tool",
        tool_call_id: combinedToolCallIds,
      });
    },
    onError: (_error) => {
      sendMessage({
        content: `工具调用过程中发生错误: ${_error.message}`,
        role: "assistant",
      });
    },
  });

  const { messages, onRequest } = useXChat({
    agent,
    defaultMessages: messageStoreMessages,
    requestFallback: (_, { error }) => {
      if (error.name === "AbortError") {
        return {
          content: "请求已取消～",
          role: "assistant",
        };
      }
      return {
        content: getErrorMessage(error),
        role: "assistant",
      };
    },
    requestPlaceholder: () => {
      return {
        content: "请稍后...",
        role: "assistant",
      };
    },
    resolveAbortController: (controller) => {
      abortController.current = controller;
    },
    transformMessage: (info) => {
      const result = transformMessage(info, sessionId);
      if (result.tool_calls && result.tool_calls.length > 0) {
        executeToolCalls(result.tool_calls);
      }
      return result;
    },
  });

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const sendMessage = (message: MessageType) => {
    const currentMessages = calculateMessagesToSend(
      messagesRef.current,
      contextWindowSize
    );

    const requestParams: ChatRequestParams = {
      enable_thinking: useThinking,
      enable_search: useSearch,
      search: { type: useSearch ? "enabled" : "disabled" },
      search_options: {
        forced_search: true,
      },
      thinking: { type: useThinking ? "enabled" : "disabled" },
      stream: true,
      message,
      messages: [...currentMessages, message],
    };

    if (hasTools && mcpTools.length > 0) {
      requestParams.tools = mcpTools;
      requestParams.tool_choice = "auto";
    }

    onRequest(requestParams);
  };

  // 历史记录存储
  useEffect(() => {
    if (shouldUpdateMessages(messages, messageStoreMessages)) {
      setMessageStoreMessages(messages);
    }
  }, [messages, messageStoreMessages, setMessageStoreMessages]);

  // 清理状态当对话切换时
  useEffect(() => {
    return () => {
      clearMessageTransformState(sessionId);
      clearToolCallState();
    };
  }, [sessionId, clearToolCallState]);

  // 自动聚焦
  useEffect(() => {
    emitter.on("toggle-window", (visible) => {
      if (senderRef?.current && visible) {
        senderRef.current.focus();
      }
    });
    return () => {
      emitter.off("toggle-window");
    };
  }, []);

  const displayMessages = useMemo(() => {
    return messages
      .filter((message) => message.message.role !== "tool")
      .map(
        ({ id, message }) =>
          ({
            content: message.content,
            key: id,
            role: message.role,
          } as BubbleProps)
      );
  }, [messages]);

  const loading = useMemo(() => {
    return (
      messages[messages.length - 1]?.message.role === "tool" ||
      agent.isRequesting()
    );
  }, [messages, agent]);

  return (
    <Fragment>
      {messages.length === 0 && <Welcome />}
      <Bubble.List
        className="chat-bubble-list"
        items={displayMessages}
        roles={roles}
      />
      <Sender
        actions={false}
        disabled={!getApiKey(providerId)}
        footer={({ components }) => {
          const { LoadingButton, SendButton } = components;
          return (
            <Flex align="center" justify="space-between">
              <ActionBar />
              {loading ? (
                <LoadingButton type="default" />
              ) : (
                <SendButton type="primary" />
              )}
            </Flex>
          );
        }}
        loading={loading}
        onCancel={() => {
          abortController?.current?.abort?.();
        }}
        onChange={setContent}
        onSubmit={async (content) => {
          const message: MessageType = {
            content,
            role: "user",
          };

          sendMessage(message);
          setContent("");
        }}
        placeholder={
          !getApiKey(providerId) ? "请前往模型配置设置API Key" : "请输入内容..."
        }
        ref={senderRef}
        value={content}
      />
    </Fragment>
  );
};

const Chat = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { getCurrentModel } = useModelStore();

  const { name } = getCurrentModel();

  const { conversations, createConversation, getCurrentConversation } =
    useMessageStore(
      useShallow((state) => ({
        conversations: state.conversations,
        createConversation: state.createConversation,
        getCurrentConversation: state.getCurrentConversation,
      }))
    );

  // 确保至少有一个对话
  useEffect(() => {
    if (Object.keys(conversations).length === 0) {
      createConversation("新对话");
    }
  }, [conversations, createConversation]);

  const currentConversation = getCurrentConversation();
  const currentConversationId = currentConversation?.id;
  const displayName = currentConversation?.title || name;

  return (
    <Flex className="chat-container" key={currentConversationId}>
      <ConversationDrawer open={drawerOpen} setOpen={setDrawerOpen} />
      <TitleBar name={displayName} setDrawerOpen={setDrawerOpen} />
      <ChatComponent />
    </Flex>
  );
};

export default Chat;
