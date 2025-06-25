import { MessageInfo } from "@ant-design/x/es/use-x-chat";

import { MessageType } from "@/store/messageStore";

/**
 * 计算应该发送的历史消息
 * @param messages 所有消息列表
 * @param contextWindowSize 上下文窗口大小
 * @returns 应该发送的消息列表
 */
export const calculateMessagesToSend = (
  messages: MessageInfo<MessageType>[],
  contextWindowSize: number
): MessageType[] => {

  if (!messages.length) {
    return [];
  }

  let lastDividerIndex = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (
      messages[i].message.role === "system" &&
      messages[i].message.content.includes("<divider>上下文已清除</divider>")
    ) {
      lastDividerIndex = i;
      break;
    }
  }

  const startIndex = lastDividerIndex >= 0 ? lastDividerIndex + 1 : 0;
  const availableMessages = messages.slice(startIndex);

  const messagesToSend = availableMessages.slice(-contextWindowSize);

  return messagesToSend
    .filter(msg => !(
      msg.message.role === "system" &&
      msg.message.content.includes("<divider>上下文已清除</divider>")
    ))
    .map(msg => ({
      ...msg.message,
    }));
};
