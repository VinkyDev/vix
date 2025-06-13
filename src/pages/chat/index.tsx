import {
  Attachments,
  Bubble,
  BubbleProps,
  Sender,
  useXAgent,
  useXChat,
} from "@ant-design/x";
import { Attachment } from "@ant-design/x/es/attachments";
import { useDebounceEffect } from "ahooks";
import { Flex, GetRef } from "antd";
import React, { useEffect, useRef } from "react";

import { roles } from "@/constants/chat";
import { MessageType, useMessageStore } from "@/store/messageStore";
import { useModelStore } from "@/store/model";

import ActionBar from "./components/ActionBar";
import AttachmentHeader from "./components/AttachmentHeader";
import MessageAction from "./components/MessageAction";

const App = ({ visible }: { visible: boolean }) => {
  const [content, setContent] = React.useState("");
  const [attachmentsOpen, setAttachmentsOpen] = React.useState(false);
  const [attachmentItems, setAttachmentItems] = React.useState<Attachment[]>(
    []
  );
  // 存储文件处理后的内容
  const [fileContents, setFileContents] = React.useState<
    Record<string, string>
  >({});

  const { model, useThinking } = useModelStore();
  const [agent] = useXAgent<MessageType>({
    baseURL: model.baseURL,
    dangerouslyApiKey: model.apiKey,
    model: model.id,
  });

  const senderRef = useRef<GetRef<typeof Sender>>(null);
  const attachmentsRef = useRef<GetRef<typeof Attachments>>(null);
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
      <Sender
        actions={false}
        autoSize={{ maxRows: 4, minRows: 1 }}
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

          onRequest({
            enable_thinking: useThinking,
            message: {
              content: finalContent,
              role: "user",
            },
            stream: true,
          });
          setContent("");
          setAttachmentItems([]);
          setFileContents({});
          setAttachmentsOpen(false);
        }}
        ref={senderRef}
        value={content}
      />
    </Flex>
  );
};

export default App;
