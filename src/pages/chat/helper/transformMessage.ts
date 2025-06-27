import { MessageStatus } from "@ant-design/x/es/use-x-chat";
import { SSEOutput } from "@ant-design/x/es/x-stream";

import { MessageType } from "@/store/messageStore";

export const transformMessage = (info: {
  chunk: SSEOutput;
  chunks: SSEOutput[];
  status: MessageStatus;
  originMessage?: MessageType;
}) => {
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
    content = `${originMessage?.content || ""}${currentThink}${currentContent}`;
  }

  return {
    content,
    role: "assistant",
  };
};
