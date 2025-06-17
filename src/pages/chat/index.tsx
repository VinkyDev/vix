import {
  Attachments,
  Bubble,
  BubbleProps,
  Sender,
  useXAgent,
  useXChat,
} from "@ant-design/x";
import { Attachment } from "@ant-design/x/es/attachments";
import { MessageInfo } from "@ant-design/x/es/use-x-chat";
import { useDebounceEffect } from "ahooks";
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
import AttachmentHeader from "./components/AttachmentHeader";
import Welcome from "./components/Welcome";

const Chat = () => {
  const [content, setContent] = useState("");
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [attachmentItems, setAttachmentItems] = useState<Attachment[]>([]);
  const [fileContents, setFileContents] = useState<Record<string, string>>({});

  const { getCurrentModel } = useModelStore();
  const { getApiKey } = useApiKeyStore();
  const { useThinking, contextWindowSize } = useUserSettingsStore();

  const { baseURL, modelId, providerId, thinkingId } = getCurrentModel();

  const [agent] = useXAgent<MessageType>({
    baseURL,
    dangerouslyApiKey: `Bearer ${getApiKey(providerId)}`,
    model: useThinking && thinkingId ? thinkingId : modelId,
  });

  const senderRef = useRef<GetRef<typeof Sender>>(null);
  const attachmentsRef = useRef<GetRef<typeof Attachments>>(null);
  const abortController = useRef<AbortController | null>(null);
  const messageStore = useMessageStore();

  // 计算有效的上下文消息
  const getEffectiveMessages = (messages: MessageInfo<MessageType>[]) => {
    // 找到最后一个分割线的位置
    let lastDividerIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].message?.type === "divider") {
        lastDividerIndex = i;
        break;
      }
    }

    // 如果有分割线，从分割线后开始截取
    const startIndex = lastDividerIndex === -1 ? 0 : lastDividerIndex + 1;
    const contextMessages = messages.slice(startIndex);

    // 根据上下文窗口大小限制消息数量
    return contextMessages.slice(-contextWindowSize);
  };

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
  useDebounceEffect(
    () => {
      messageStore.setMessages(messages);
    },
    [messages, messageStore],
    { wait: 1000 }
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
              <ActionBar
                attachmentsOpen={attachmentsOpen}
                setAttachmentsOpen={setAttachmentsOpen}
              />
              {agent.isRequesting() ? (
                <LoadingButton type="default" />
              ) : (
                <SendButton type="primary" />
              )}
            </Flex>
          );
        }}
        header={
          <AttachmentHeader
            attachmentItems={attachmentItems}
            attachmentsOpen={attachmentsOpen}
            attachmentsRef={attachmentsRef}
            fileContents={fileContents}
            senderRef={senderRef}
            setAttachmentItems={setAttachmentItems}
            setAttachmentsOpen={setAttachmentsOpen}
            setFileContents={setFileContents}
          />
        }
        loading={agent.isRequesting()}
        onCancel={() => {
          abortController?.current?.abort?.();
        }}
        onChange={setContent}
        onPasteFile={(_, files) => {
          for (const file of files) {
            attachmentsRef.current?.upload(file);
          }
          setAttachmentsOpen(true);
        }}
        onSubmit={async (nextContent) => {
          let finalContent = nextContent;

          if (attachmentItems.length > 0) {
            const processedContents: string[] = [];

            attachmentItems.forEach((item) => {
              const content = fileContents[item.uid];
              if (content) {
                processedContents.push(
                  `\n\n--- 文件: ${item.name} ---\n${content}`
                );
              }
            });

            if (processedContents.length > 0) {
              finalContent = `${nextContent}${processedContents.join("\n")}`;
            }
          }

          // 获取有效的上下文消息用于发送请求
          const effectiveMessages = getEffectiveMessages(messages);

          const message = {
            content: finalContent,
            role: "user",
          };

          onRequest({
            enable_thinking: useThinking,
            thinking: { type: useThinking ? "enabled" : "disabled" },
            message,
            stream: true,
            messages: effectiveMessages
              .map((msg) => ({
                ...msg.message,
              }))
              .filter((msg) => msg.role !== "system")
              .concat(message),
          });
          setContent("");
          setAttachmentItems([]);
          setFileContents({});
          setAttachmentsOpen(false);
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
