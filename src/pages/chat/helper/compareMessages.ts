import { MessageInfo } from "@ant-design/x/es/use-x-chat";

import { MessageType } from "@/store";

/**
 * 比较两个消息数组是否发生了变化
 * @param newMessages 新的消息数组
 * @param oldMessages 旧的消息数组
 * @returns 是否需要更新
 */
export const shouldUpdateMessages = (
  newMessages: MessageInfo<MessageType>[],
  oldMessages: Omit<MessageInfo<MessageType>, "id">[]
): boolean => {
  // 比较消息数量
  if (newMessages.length !== oldMessages.length) {
    return true;
  }

  // 如果没有消息，不需要更新
  if (newMessages.length === 0) {
    return false;
  }

  // 比较最后一条消息的内容
  const lastNewMessage = newMessages[newMessages.length - 1];
  const lastOldMessage = oldMessages[oldMessages.length - 1];

  // 如果旧消息不存在，需要更新
  if (!lastOldMessage) {
    return true;
  }

  // 比较消息的关键属性
  return (
    lastNewMessage.message.content !== lastOldMessage.message.content ||
    lastNewMessage.message.role !== lastOldMessage.message.role ||
    lastNewMessage.status !== lastOldMessage.status
  );
};
