import {
  Bubble,
  BubbleProps,
  Sender,
  useXAgent,
  useXChat,
} from "@ant-design/x";
import { useDebounceEffect } from "ahooks";
import { Flex, GetRef } from "antd";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { roles } from "@/pages/chat/constants";
import {
  type MessageType,
  useApiKeyStore,
  useMessageStore,
  useModelStore,
  useUserSettingsStore,
} from "@/store";
import { emitter } from "@/utils";
import { getErrorMessage } from "@/utils/error";

import ActionBar from "./components/ActionBar";
import "./index.scss";
import Welcome from "./components/Welcome";
import { calculateMessagesToSend, transformMessage } from "./helper";
const Chat = () => {
  const [content, setContent] = useState("");

  const { getCurrentModel } = useModelStore();
  const { getApiKey } = useApiKeyStore();
  const { useThinking, contextWindowSize, useSearch } = useUserSettingsStore();

  const { baseURL, modelId, providerId, thinkingId } = getCurrentModel();

  const [agent] = useXAgent<MessageType>({
    baseURL,
    dangerouslyApiKey: `Bearer ${getApiKey(providerId)}`,
    model: useThinking && thinkingId ? thinkingId : modelId,
  });

  const senderRef = useRef<GetRef<typeof Sender>>(null);
  const abortController = useRef<AbortController | null>(null);
  const {
    messages: messageStoreMessages,
    setMessages: setMessageStoreMessages,
  } = useMessageStore(
    useShallow((state) => ({
      messages: state.messages,
      setMessages: state.setMessages,
    }))
  );

  const sendMessage = (message: MessageType) => {
    const currentMessages = calculateMessagesToSend(
      messages,
      contextWindowSize
    );
    onRequest({
      enable_thinking: useThinking,
      enable_search: useSearch,
      search: { type: useSearch ? "enabled" : "disabled" },
      search_options: {
        forced_search: true,
      },
      thinking: { type: useThinking ? "enabled" : "disabled" }, // 兼容豆包API
      stream: true,
      message,
      messages: [...currentMessages, message],
    });
  };

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
    transformMessage,
  });

  // 历史记录存储
  useDebounceEffect(
    () => {
      setMessageStoreMessages(messages);
    },
    [messages, setMessageStoreMessages],
    {
      wait: 1000,
    }
  );

  // 自动聚焦
  useEffect(() => {
    emitter.on("toggle-window", (visiable) => {
      if (senderRef?.current && visiable) {
        senderRef.current.focus();
      }
    });
  }, []);

  return (
    <Flex gap="middle" style={{ height: "100%" }} vertical>
      {messages.length === 0 && <Welcome />}
      <Bubble.List
        items={messages.map(
          ({ id, message }) =>
            ({
              content: message.content,
              key: id,
              role: message.role,
            } as BubbleProps)
        )}
        roles={roles}
        style={{ height: "100%" }}
      />
      <Sender
        actions={false}
        autoSize={{ maxRows: 4, minRows: 1 }}
        disabled={!getApiKey(providerId)}
        footer={({ components }) => {
          const { LoadingButton, SendButton } = components;
          return (
            <Flex align="center" justify="space-between">
              <ActionBar />
              {agent.isRequesting() ? (
                <LoadingButton type="default" />
              ) : (
                <SendButton type="primary" />
              )}
            </Flex>
          );
        }}
        loading={agent.isRequesting()}
        onCancel={() => {
          abortController?.current?.abort?.();
        }}
        onChange={setContent}
        onSubmit={async (content) => {
          const message = {
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
    </Flex>
  );
};

export default Chat;
