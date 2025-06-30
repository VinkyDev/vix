import { MessageInfo } from "@ant-design/x/es/use-x-chat";

import { MessageType } from "@/store/messageStore";

/**
 * 计算应该发送的历史消息
 * @param messages 所有消息列表
 * @returns 应该发送的消息列表
 */
export const calculateMessagesToSend = (
  messages: MessageInfo<MessageType>[]
): MessageType[] => {
  return messages
    .filter(
      (msg) =>
        !(
          msg.message.role === "system" &&
          msg.message.content.includes("<divider>上下文已清除</divider>")
        )
    )
    .map((msg) => ({
      ...msg.message,
    }));
};
