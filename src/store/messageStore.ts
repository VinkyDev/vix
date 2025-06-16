import { MessageInfo } from "@ant-design/x/es/use-x-chat";
import { omit } from "lodash-es";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MessageType = {
  role: string;
  content: string;
  type?: 'normal' | 'divider';
};

interface MessageStore {
  clearMessages: () => void;
  maxMessages: number;
  messages: Omit<MessageInfo<MessageType>, "id">[];
  setMaxMessages: (maxMessages: number) => void;
  setMessages: (messages: MessageInfo<MessageType>[]) => void;
  addContextDivider: () => void;
}

export const useMessageStore = create<MessageStore>()(
  persist(
    (set, get) => ({
      clearMessages: () => set({ messages: [] }),
      maxMessages: 10,
      messages: [],
      setMaxMessages: (maxMessages) => set({ maxMessages }),
      setMessages: (messages) =>
        set((state) => ({
          // https://github.com/ant-design/x/issues/467 不能设置id字段, 否则会导致重复id
          messages: messages.slice(-state.maxMessages).map((message) => ({
            ...omit(message, "id"),
          })),
        })),

      addContextDivider: () => {
        const state = get();
        const dividerMessage: Omit<MessageInfo<MessageType>, "id"> = {
          message: {
            role: "system",
            content: "上下文已清除",
            type: "divider"
          },
          status: "success"
        };
        set({
          messages: [...state.messages, dividerMessage]
        });
      },
    }),
    {
      name: "message-storage",
      partialize: (state) => ({ messages: state.messages }),
    }
  )
);
