import { MessageInfo } from "@ant-design/x/es/use-x-chat";
import { omit } from "lodash-es";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MessageType = {
  role?: string;
  content: string;
};

export type Conversation = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Omit<MessageInfo<MessageType>, "id">[];
};

interface MessageStore {
  maxMessages: number;
  conversations: Record<string, Conversation>;
  currentConversationId: string | null;
  messages: Omit<MessageInfo<MessageType>, "id">[];

  // 对话管理
  createConversation: (title?: string) => string;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  switchConversation: (id: string) => void;
  getCurrentConversation: () => Conversation | null;
  generateTitleFromMessage: (content: string) => string;

  // 消息管理
  setMaxMessages: (maxMessages: number) => void;
  setMessages: (messages: MessageInfo<MessageType>[]) => void;
  addContextDivider: () => void;
}

const generateId = () =>
  `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useMessageStore = create<MessageStore>()(
  persist(
    (set, get) => ({
      maxMessages: 20,
      conversations: {},
      currentConversationId: null,
      messages: [],

      createConversation: (title = "新对话") => {
        const id = generateId();
        const now = Date.now();
        const newConversation: Conversation = {
          id,
          title,
          createdAt: now,
          updatedAt: now,
          messages: [],
        };

        set((state) => ({
          conversations: {
            ...state.conversations,
            [id]: newConversation,
          },
          currentConversationId: id,
          messages: [],
        }));

        return id;
      },

      deleteConversation: (id) => {
        const state = get();
        if (!state.conversations[id]) return;

        const remainingConversations = { ...state.conversations };
        delete remainingConversations[id];

        // 如果删除的是当前对话，切换到其他对话或创建新对话
        let newCurrentId = state.currentConversationId;
        let newMessages = state.messages;

        if (state.currentConversationId === id) {
          const remainingIds = Object.keys(remainingConversations);
          if (remainingIds.length > 0) {
            newCurrentId = remainingIds[0];
            newMessages = remainingConversations[remainingIds[0]].messages;
          } else {
            newCurrentId = null;
            newMessages = [];
          }
        }

        set({
          conversations: remainingConversations,
          currentConversationId: newCurrentId,
          messages: newMessages,
        });
      },

      renameConversation: (id, title) => {
        set((state) => ({
          conversations: {
            ...state.conversations,
            [id]: {
              ...state.conversations[id],
              title,
            },
          },
        }));
      },

      switchConversation: (id) => {
        const state = get();
        const conversation = state.conversations[id];
        if (conversation) {
          set({
            currentConversationId: id,
            messages: conversation.messages,
          });
        }
      },

      getCurrentConversation: () => {
        const state = get();
        if (
          state.currentConversationId &&
          state.conversations[state.currentConversationId]
        ) {
          return state.conversations[state.currentConversationId];
        }
        return null;
      },

      setMaxMessages: (maxMessages) => set({ maxMessages }),

      setMessages: (messages) => {
        const state = get();
        const processedMessages = messages
          .slice(-state.maxMessages)
          .map((message) => ({
            ...omit(message, "id"),
          }));

        set({
          messages: processedMessages,
        });

        // 如果有当前对话，同步更新对话中的消息
        if (state.currentConversationId) {
          const currentConversationId = state.currentConversationId;
          const currentConv = state.conversations[currentConversationId];
          const shouldUpdateTitle =
            currentConv &&
            currentConv.title === "新对话" &&
            processedMessages.length > 0 &&
            processedMessages[0].message.role === "user";

          const newTitle = shouldUpdateTitle
            ? get().generateTitleFromMessage(
                processedMessages[0].message.content
              )
            : currentConv.title;

          set((prevState) => ({
            conversations: {
              ...prevState.conversations,
              [currentConversationId]: {
                ...prevState.conversations[currentConversationId],
                messages: processedMessages,
                title: newTitle,
                updatedAt: Date.now(),
              },
            },
          }));
        }
      },

      addContextDivider: () => {
        const state = get();
        const dividerMessage: Omit<MessageInfo<MessageType>, "id"> = {
          message: {
            role: "system",
            content: "<divider>上下文已清除</divider>",
          },
          status: "success",
        };

        const newMessages = [...state.messages, dividerMessage];

        set({
          messages: newMessages,
        });

        // 如果有当前对话，同步更新对话中的消息
        if (state.currentConversationId) {
          const currentConversationId = state.currentConversationId;
          set((prevState) => ({
            conversations: {
              ...prevState.conversations,
              [currentConversationId]: {
                ...prevState.conversations[currentConversationId],
                messages: newMessages,
                updatedAt: Date.now(),
              },
            },
          }));
        }
      },

      generateTitleFromMessage: (content: string) => {
        // 根据消息内容生成简短的标题（取前20个字符）
        const cleanContent = content.replace(/\n/g, " ").trim();
        return cleanContent.length > 20
          ? `${cleanContent.substring(0, 20)}...`
          : cleanContent || "新对话";
      },
    }),
    {
      name: "message-storage",
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
        messages: state.messages,
        maxMessages: state.maxMessages,
      }),
    }
  )
);
