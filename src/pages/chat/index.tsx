import {
  Bubble,
  BubbleProps,
  Sender,
  useXAgent,
  useXChat,
} from "@ant-design/x";
import { Flex, GetRef } from "antd";
import { useEffect, useRef, useState } from "react";

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
import Welcome from "./components/Welcome";
import "./index.scss";

const Chat = () => {
  const [content, setContent] = useState("");

  const { getCurrentModel } = useModelStore();
  const { getApiKey } = useApiKeyStore();
  const { useThinking } = useUserSettingsStore();

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
  } = useMessageStore();

  const sendMessage = (message: MessageType) => {
    onRequest({
      enable_thinking: useThinking,
      thinking: { type: useThinking ? "enabled" : "disabled" },
      stream: true,
      message,
      messages: [
        ...messages.map((msg) => ({
          ...msg.message,
        })),
        message,
      ],
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
    transformMessage: (info) => {
      const { chunk, originMessage } = info || {};
      let currentContent = "";
      let currentThink = "";

      if (chunk?.data && !chunk?.data.includes("DONE")) {
        const message = JSON.parse(chunk?.data);
        currentThink = message?.choices?.[0]?.delta?.reasoning_content || "";
        currentContent = message?.choices?.[0]?.delta?.content || "";
      }

      let content = "";

      if (!originMessage?.content && currentThink) {
        content = `<think>${currentThink}`;
      } else if (
        originMessage?.content?.includes("<think>") &&
        !originMessage?.content.includes("</think>") &&
        currentContent
      ) {
        content = `${originMessage?.content}</think>${currentContent}`;
      } else {
        content = `${
          originMessage?.content || ""
        }${currentThink}${currentContent}`;
      }

      return {
        content,
        role: "assistant",
      };
    },
  });

  // 历史记录存储
  useEffect(() => {
    setMessageStoreMessages(messages);
  }, [messages, setMessageStoreMessages]);

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
        items={messages
          .filter(
            (msg) =>
              msg.message.role !== "system" && msg.message.role !== "tool"
          )
          .map(
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
