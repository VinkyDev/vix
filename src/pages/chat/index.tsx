import {
  Bubble,
  BubbleProps,
  Sender,
  useXAgent,
  useXChat,
} from "@ant-design/x";
import { useDebounceEffect } from "ahooks";
import { Flex, GetRef } from "antd";
import { Fragment, useEffect, useRef, useState } from "react";
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
import { ConversationDrawer } from "./components/ConversationDrawer";
import { TitleBar } from "./components/TitleBar";
import "./index.scss";
import {
  calculateMessagesToSend,
  shouldUpdateMessages,
  transformMessage,
} from "./helper";

const ChatComponent = () => {
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
      // 使用工具函数比较消息是否真正发生变化，避免不必要的更新
      if (shouldUpdateMessages(messages, messageStoreMessages)) {
        setMessageStoreMessages(messages);
      }
    },
    [messages, messageStoreMessages, setMessageStoreMessages],
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
    <Fragment>
      <Bubble.List
        className="chat-bubble-list"
        items={messages.map(
          ({ id, message }) =>
            ({
              content: message.content,
              key: id,
              role: message.role,
            } as BubbleProps)
        )}
        roles={roles}
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
