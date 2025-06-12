import {
  Actions,
  Bubble,
  BubbleProps,
  Sender,
  useXAgent,
  useXChat,
} from "@ant-design/x";
import { ActionItem } from "@ant-design/x/es/actions/interface";
import { MessageInfo } from "@ant-design/x/es/use-x-chat";
import { useDebounceEffect } from "ahooks";
import { Flex, GetRef } from "antd";
import React, { useEffect, useRef } from "react";

import { actionItems, roles } from "@/constants/chat";
import { localStorageUtils } from "@/utils/storage";

const BASE_URL =
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const MODEL = "qwen-turbo-latest";
const API_KEY = import.meta.env.VITE_DASHSCOPE_API_KEY;

type MessageType = {
  role: string;
  content: string;
};

const App = ({ visible }: { visible: boolean }) => {
  const [content, setContent] = React.useState("");
  const [agent] = useXAgent<MessageType>({
    baseURL: BASE_URL,
    dangerouslyApiKey: API_KEY,
    model: MODEL,
  });

  const senderRef = useRef<GetRef<typeof Sender>>(null);
  const abortController = useRef<AbortController | null>(null);

  const { messages, onRequest } = useXChat({
    agent,
    defaultMessages:
      localStorageUtils.getItem<MessageInfo<MessageType>[]>("messages") || [],
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

  const handleAction = (item: ActionItem, content: string) => {
    const { key } = item;
    switch (key) {
      case "copy":
        navigator.clipboard.writeText(
          content.replace(/<think>[\s\S]*?<\/think>/g, "")
        );
        break;
    }
  };

  // 自动聚焦
  useEffect(() => {
    if (senderRef.current && visible) {
      senderRef.current.focus();
    }
  }, [visible]);

  // 历史记录存储
  useDebounceEffect(
    () => {
      // 保存最近 10 条
      localStorageUtils.setItem<MessageInfo<MessageType>[]>(
        "messages",
        messages.slice(-10)
      );
    },
    [messages],
    { wait: 1000 }
  );

  return (
    <Flex gap="middle" style={{ height: "100%" }} vertical>
      <Bubble.List
        items={messages.map(
          ({ id, message }) =>
            ({
              content: message.content,
              footer: (content) => (
                <Actions
                  items={actionItems}
                  onClick={(item) => handleAction(item, content)}
                />
              ),
              key: id,
              role: message.role,
            } as BubbleProps)
        )}
        roles={roles}
        style={{ height: "100%" }}
      />
      <Sender
        autoSize={{ maxRows: 4, minRows: 1 }}
        loading={agent.isRequesting()}
        onCancel={() => {
          abortController?.current?.abort?.();
        }}
        onChange={setContent}
        onSubmit={(nextContent) => {
          onRequest({
            enable_thinking: true,
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
