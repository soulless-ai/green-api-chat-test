import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { MessengerId } from '@/shared/types/messenger';
import type { Message } from '@/entities/message/model/message';
import type { Contact } from '@/shared/api/green-api/types';

export interface Chat {
  id: string;
  chatId: string;
  title: string;
  phone?: string;
  messenger: MessengerId;
  createdAt: number;
  lastMessagePreview?: string;
  lastMessageAt?: number;
  avatarUrl?: string | null;
  unreadCount?: number;
  isLocal?: boolean;
}

interface ChatsState {
  chats: Chat[];
  activeChatId: string | null;
  messagesByChat: Record<string, Message[]>;
  deletedMessageIds: string[];
  contacts: Contact[];
  setActiveChat: (id: string | null) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chat: Chat) => void;
  removeChat: (id: string) => void;
  updatePreview: (chatId: string, preview: string, at: number) => void;
  setAvatarUrl: (chatId: string, avatarUrl: string | null) => void;
  setChatsList: (chats: Chat[]) => void;
  setContacts: (contacts: Contact[]) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
  upsertMessage: (chatId: string, message: Message) => void;
  updateMessageStatus: (chatId: string, messageId: string, status: Message['status']) => void;
  replaceMessage: (chatId: string, oldId: string, message: Message) => void;
  markFailed: (chatId: string, messageId: string) => void;
  markMessageDeleted: (chatId: string, messageId: string) => void;
}

export const useChatsStore = create<ChatsState>()(
  persist(
    (set) => ({
      chats: [],
      activeChatId: null,
      messagesByChat: {},
      deletedMessageIds: [],
      contacts: [],
      setActiveChat: (id) => set({ activeChatId: id }),
      addChat: (chat) =>
        set((state) => ({
          chats: state.chats.some((item) => item.chatId === chat.chatId)
            ? state.chats
            : [{ ...chat, isLocal: chat.isLocal ?? true }, ...state.chats],
        })),
      updateChat: (chat) =>
        set((state) => {
          const index = state.chats.findIndex(
            (item) =>
              item.chatId === chat.chatId &&
              item.messenger === chat.messenger,
          );

          if (index === -1) {
            return { chats: [chat, ...state.chats] };
          }

          const existing = state.chats[index];

          if (!existing) {
            return state;
          }

          const chats = [...state.chats];

          chats[index] = {
            ...existing,
            ...chat,
            createdAt: existing.createdAt,
            lastMessagePreview:
              chat.lastMessagePreview ?? existing.lastMessagePreview,
            lastMessageAt:
              chat.lastMessageAt ?? existing.lastMessageAt,
            avatarUrl: chat.avatarUrl ?? existing.avatarUrl,
            unreadCount: chat.unreadCount ?? existing.unreadCount,
            phone: chat.phone ?? existing.phone,
          };

          return { chats };
        }),
      removeChat: (id) =>
        set((state) => ({
          chats: state.chats.filter((item) => item.id !== id),
          activeChatId: state.activeChatId === id ? null : state.activeChatId,
        })),
      updatePreview: (chatId, preview, at) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.chatId === chatId ? { ...chat, lastMessagePreview: preview, lastMessageAt: at } : chat,
          ),
        })),
      setAvatarUrl: (chatId, avatarUrl) =>
        set((state) => ({
          chats: state.chats.map((chat) => (chat.chatId === chatId ? { ...chat, avatarUrl } : chat)),
        })),
      setChatsList: (chats: Chat[]) =>
        set((state) => {
          const mapped = chats.map((chat) => {
            const existing = state.chats.find(
              (item) => item.chatId === chat.chatId,
            );

            if (!existing) return chat;

            const keepExistingPreview =
              (existing.lastMessageAt ?? 0) >= (chat.lastMessageAt ?? 0);

            return {
              ...chat,
              createdAt: existing.createdAt,
              avatarUrl: existing.avatarUrl ?? chat.avatarUrl,
              lastMessagePreview: keepExistingPreview
                ? existing.lastMessagePreview ?? chat.lastMessagePreview
                : chat.lastMessagePreview ?? existing.lastMessagePreview,
              lastMessageAt: keepExistingPreview
                ? existing.lastMessageAt ?? chat.lastMessageAt
                : chat.lastMessageAt ?? existing.lastMessageAt,
            };
          });

          const localOnly = state.chats.filter(
            (existing) =>
              existing.isLocal &&
              !chats.some((chat) => chat.chatId === existing.chatId),
          );

          return { chats: [...localOnly, ...mapped] };
        }),
      setContacts: (contacts) => set({ contacts }),
      setMessages: (chatId, messages) =>
        set((state) => {
          const deleted = new Set(state.deletedMessageIds);
          const normalized = messages.map((item) =>
            deleted.has(item.id) && !item.isDeleted
              ? { ...item, isDeleted: true, text: '', mediaUrl: undefined, fileName: undefined }
              : item,
          );
          return { messagesByChat: { ...state.messagesByChat, [chatId]: normalized } };
        }),
      upsertMessage: (chatId, message) =>
        set((state) => {
          const current = state.messagesByChat[chatId] ?? [];
          if (current.some((item) => item.id === message.id)) return state;
          return { messagesByChat: { ...state.messagesByChat, [chatId]: [...current, message] } };
        }),
      updateMessageStatus: (chatId, messageId, status) =>
        set((state) => ({
          messagesByChat: {
            ...state.messagesByChat,
            [chatId]: (state.messagesByChat[chatId] ?? []).map((item) =>
              item.id === messageId ? { ...item, status } : item,
            ),
          },
        })),
      replaceMessage: (chatId, oldId, message) =>
        set((state) => {
          const current = state.messagesByChat[chatId] ?? [];
          const replaced = current.map((item) => (item.id === oldId ? message : item));
          if (!replaced.some((item) => item.id === message.id)) replaced.push(message);
          return { messagesByChat: { ...state.messagesByChat, [chatId]: replaced } };
        }),
      markFailed: (chatId, messageId) =>
        set((state) => ({
          messagesByChat: {
            ...state.messagesByChat,
            [chatId]: (state.messagesByChat[chatId] ?? []).map((item) =>
              item.id === messageId ? { ...item, status: 'failed' } : item,
            ),
          },
        })),
      markMessageDeleted: (chatId, messageId) =>
        set((state) => {
          const deletedMessageIds = state.deletedMessageIds.includes(messageId)
            ? state.deletedMessageIds
            : [...state.deletedMessageIds, messageId];

          const current = state.messagesByChat[chatId] ?? [];

          if (!current.some((item) => item.id === messageId)) {
            return { deletedMessageIds };
          }

          return {
            deletedMessageIds,
            messagesByChat: {
              ...state.messagesByChat,
              [chatId]: current.map((item) =>
                item.id === messageId
                  ? { ...item, isDeleted: true, text: '', mediaUrl: undefined, fileName: undefined }
                  : item,
              ),
            },
          };
        }),
    }),
    {
      name: 'green-api-chats',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as Partial<ChatsState>;
        return {
          chats: state.chats ?? [],
          contacts: state.contacts ?? [],
          activeChatId: null,
          messagesByChat: {},
          deletedMessageIds: [],
        } as unknown as ChatsState;
      },
    },
  ),
);
