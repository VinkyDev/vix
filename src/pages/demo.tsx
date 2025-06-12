import { UserOutlined } from "@ant-design/icons";
import { Bubble, Sender, useXAgent, useXChat } from "@ant-design/x";
import { Flex, type GetProp, GetRef } from "antd";
import React, { useEffect, useRef } from "react";

import MarkdownRender from "@/components/MarkdownRender";

const BASE_URL =
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const MODEL = "qwen-turbo";
const API_KEY = import.meta.env.VITE_DASHSCOPE_API_KEY;

type MessageType = {
  role: string;
  content: string;
};

const roles: GetProp<typeof Bubble.List, "roles"> = {
  assistant: {
    avatar: { icon: <UserOutlined />, style: { background: "#fde3cf" } },
    messageRender: MarkdownRender,
    placement: "start",
  },
  user: {
    avatar: { icon: <UserOutlined />, style: { background: "#87d068" } },
    messageRender: MarkdownRender,
    placement: "end",
  },
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

  return (
    <Flex gap="middle" style={{ height: "100%" }} vertical>
      <Bubble.List
        items={messages.map(({ id, message }) => ({
          content: message.content,
          key: id,
          role: message.role,
        }))}
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
