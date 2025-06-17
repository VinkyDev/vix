import { MessageInfo } from "@ant-design/x/es/use-x-chat";
import { omit } from "lodash-es";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MessageType = {
  role: string;
  content: string;
  type?: "normal" | "divider";
};

interface MessageStore {
  maxMessages: number;
  messages: Omit<MessageInfo<MessageType>, "id">[];
  clearMessages: () => void;
  setMaxMessages: (maxMessages: number) => void;
  setMessages: (messages: MessageInfo<MessageType>[]) => void;
  addContextDivider: () => void;
}

export const useMessageStore = create<MessageStore>()(
  persist(
    (set, get) => ({
      maxMessages: 20,
      messages: [],
      clearMessages: () => set({ messages: [] }),
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
            content: ":::divider\n上下文已清除\n:::\n",
            type: "divider",
          },
          status: "success",
        };
        set({
          messages: [...state.messages, dividerMessage],
        });
      },
    }),
    {
      name: "message-storage",
      partialize: (state) => ({
        messages: state.messages,
        maxMessages: state.maxMessages,
      }),
    }
  )
);
