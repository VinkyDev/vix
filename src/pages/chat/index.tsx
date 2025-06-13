import {
  Bubble,
  BubbleProps,
  Sender,
  useXAgent,
  useXChat,
} from "@ant-design/x";
import { useDebounceEffect } from "ahooks";
import { Flex, GetRef } from "antd";
import React, { useEffect, useRef } from "react";

import { roles } from "@/constants/chat";
import { MessageType, useMessageStore } from "@/store/messageStore";
import { useModelStore } from "@/store/model";

import ActionBar from "./components/ActionBar";
import MessageAction from "./components/MessageAction";
const App = ({ visible }: { visible: boolean }) => {
  const [content, setContent] = React.useState("");
  const { model, useThinking } = useModelStore();
  const [agent] = useXAgent<MessageType>({
    baseURL: model.baseURL,
    dangerouslyApiKey: model.apiKey,
    model: model.id,
  });

  const senderRef = useRef<GetRef<typeof Sender>>(null);
  const abortController = useRef<AbortController | null>(null);
  const messageStore = useMessageStore();

  const { messages, onRequest } = useXChat({
    agent,
    defaultMessages: messageStore.messages,
    requestFallback: (_, { error }) => {
      if (error.name === "AbortError") {
        return {
          content: "请求已取消～",
          role: "assistant",
        };
      }
      return {
        content: "请求失败，请重试！",
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

  // 自动聚焦
  useEffect(() => {
    if (senderRef.current && visible) {
      senderRef.current.focus();
    }
  }, [visible]);

  // 历史记录存储
  useDebounceEffect(
    () => {
      messageStore.setMessages(messages);
    },
    [messages, messageStore],
    { wait: 1000 }
  );

  return (
    <Flex gap="middle" style={{ height: "100%" }} vertical>
      <Bubble.List
        items={messages.map(
          ({ id, message }) =>
            ({
              content: message.content,
              footer: (content) => <MessageAction content={content} />,
              key: id,
              role: message.role,
            } as BubbleProps)
        )}
        roles={roles}
        style={{ height: "100%" }}
      />
      <ActionBar />
      <Sender
        autoSize={{ maxRows: 4, minRows: 1 }}
        loading={agent.isRequesting()}
        onCancel={() => {
          abortController?.current?.abort?.();
        }}
        onChange={setContent}
        onSubmit={(nextContent) => {
          onRequest({
            enable_thinking: useThinking,
            message: {
              content: nextContent,
              role: "user",
            },
            stream: true,
          });
          setContent("");
        }}
        ref={senderRef}
        value={content}
      />
    </Flex>
  );
};

export default App;
