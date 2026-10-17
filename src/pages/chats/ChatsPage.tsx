import { useCallback, useMemo, useState, useEffect } from 'react';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { useInstanceUiStore } from '@/entities/instance/model/instance';
import {
  GreenApiHttpClient,
  isQuotaExceededError,
} from '@/shared/api/http/client';
import {
  getStateInstance,
  getMessengerSettings,
} from '@/shared/api/repositories/instance.repository';
import { useQuery } from '@tanstack/react-query';
import { useIsMobile } from '@/shared/lib/useIsMobile';
import { useQuotaExceeded } from '@/shared/lib/useQuotaExceeded';
import { Header } from '@/shared/ui/Header';
import { Sidebar } from '@/widgets/sidebar';
import { ChatWindow } from '@/widgets/chat-window';
import { NewChatDialog } from '@/widgets/new-chat-dialog';
import { useChatsStore } from '@/entities/chat/model/chat';
import { useChatsQuery } from '@/entities/chat/api/useChatsQuery';
import { useChatLastMessagesQuery } from '@/entities/chat/api/useChatLastMessagesQuery';
import { summaryToChat } from '@/entities/chat/lib/chat';
import type { Chat } from '@/entities/chat/model/chat';

export function ChatsPage() {
  const credentials = useCredentialsStore((state) => state.credentials);
  const clearCredentials = useCredentialsStore((state) => state.clear);
  const theme = useInstanceUiStore((state) => state.theme);
  const setTheme = useInstanceUiStore((state) => state.setTheme);
  const sidebarOpen = useInstanceUiStore((state) => state.sidebarOpen);
  const setSidebarOpen = useInstanceUiStore((state) => state.setSidebarOpen);
  const setAvatarUrl = useChatsStore((state) => state.setAvatarUrl);
  const setChatsList = useChatsStore((state) => state.setChatsList);
  const setActiveChat = useChatsStore((state) => state.setActiveChat);
  const addChat = useChatsStore((state) => state.addChat);
  const setCredentials = useCredentialsStore((state) => state.setCredentials);
  const isMobile = useIsMobile();
  const quotaExceeded = useQuotaExceeded();
  const [newChatOpen, setNewChatOpen] = useState(false);
  const handleNewChat = useCallback(() => setNewChatOpen(true), []);

  const handleSelectChat = useCallback(
    (chatId: string) => {
      setActiveChat(chatId);
      setSidebarOpen(false);
    },
    [setActiveChat, setSidebarOpen],
  );

  const handleOpenContact = useCallback(
    (chat: Chat) => {
      addChat(chat);
      setActiveChat(chat.id);
      setSidebarOpen(false);
    },
    [addChat, setActiveChat, setSidebarOpen],
  );

  const stateQuery = useQuery({
    queryKey: ['instance-state'],
    enabled: Boolean(credentials),
    queryFn: async () => {
      if (!credentials) return 'unknown';
      const client = new GreenApiHttpClient(() => credentials);
      return getStateInstance(client);
    },
    refetchInterval: 0,
  });

  const accountQuery = useQuery({
    queryKey: ['account-settings', credentials?.messenger],
    enabled: Boolean(credentials) && stateQuery.data === 'authorized',
    queryFn: async () => {
      if (!credentials) return null;
    
      const client = new GreenApiHttpClient(() => credentials);
    
      return getMessengerSettings(
        client,
        credentials.messenger ?? 'whatsapp',
      );
    },
    refetchInterval: 300000,
  });

  const chatsQuery = useChatsQuery();
  const lastMessagesQuery = useChatLastMessagesQuery();
  const storedChats = useChatsStore((state) => state.chats);
  const messenger = credentials?.messenger ?? 'whatsapp';

  const apiChats = useMemo(
    () =>
      (chatsQuery.data ?? []).map((summary) => {
        const chat = summaryToChat(summary, messenger);
        const digits = summary.id.split('@')[0] ?? summary.id;
        const last =
          lastMessagesQuery.data?.[summary.id] ??
          lastMessagesQuery.data?.[digits];

        if (!last) return chat;

        return {
          ...chat,
          lastMessagePreview: `${last.direction === 'out' ? 'Вы: ' : ''}${last.text}`,
          lastMessageAt: last.timestamp,
        };
      }),
    [chatsQuery.data, messenger, lastMessagesQuery.data],
  );

  const displayChats = useMemo(() => {
    const localOnly = storedChats.filter(
      (item) =>
        item.isLocal &&
        !apiChats.some((chat) => chat.chatId === item.chatId),
    );

    const merged = apiChats.map((chat) => {
      const stored = storedChats.find((item) => item.chatId === chat.chatId);

      if (!stored || !stored.lastMessagePreview) return chat;

      return (stored.lastMessageAt ?? 0) >= (chat.lastMessageAt ?? 0)
        ? {
            ...chat,
            lastMessagePreview: stored.lastMessagePreview,
            lastMessageAt: stored.lastMessageAt,
          }
        : chat;
    });

    return [...localOnly, ...merged];
  }, [storedChats, apiChats]);

  useEffect(() => {
    if (!chatsQuery.data || !credentials) return;
    setChatsList(apiChats);
  }, [chatsQuery.data, apiChats, credentials, setChatsList]);

  const handleRetryChats = useCallback(() => {
    void chatsQuery.refetch();
  }, [chatsQuery.refetch]);

  const chatsQuotaExceeded = isQuotaExceededError(chatsQuery.error);

  useEffect(() => {
    if (accountQuery.data?.avatar && accountQuery.data.chatId && credentials?.avatarUrl !== accountQuery.data.avatar) {
      setAvatarUrl(accountQuery.data.chatId, accountQuery.data.avatar);
      setCredentials(
        { ...credentials!, avatarUrl: accountQuery.data.avatar },
        true,
      );
    }
  }, [accountQuery.data, credentials?.avatarUrl, setAvatarUrl, setCredentials]);

  const statusLabelMap: Record<string, string> = {
    authorized: 'Авторизован',
    notAuthorized: 'Требуется авторизация',
    starting: 'Запуск инстанса',
    blocked: 'Заблокирован',
    sleepMode: 'Спящий режим',
    unknown: 'Статус неизвестен',
  };

  const handleThemeToggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Header
        onLogout={clearCredentials}
        onThemeToggle={handleThemeToggle}
        status={stateQuery.data ?? 'unknown'}
        statusLabel={statusLabelMap[stateQuery.data ?? 'unknown'] ?? 'Статус неизвестен'}
      />

      {stateQuery.data !== 'authorized' ? (
        <div className="border-b border-ga-border bg-ga-notAuthorizedBg px-5 py-3.5 text-base text-ga-text dark:border-ga-darkBorder dark:bg-ga-darkNotAuthorizedBg dark:text-ga-darkText">
          Инстанс не авторизован. Откройте личный кабинет GREEN-API, авторизуйте номер и очистите webhookUrl.
        </div>
      ) : null}

      {quotaExceeded ? (
        <div className="border-b border-ga-border bg-ga-notAuthorizedBg px-5 py-3.5 text-base text-ga-text dark:border-ga-darkBorder dark:bg-ga-darkNotAuthorizedBg dark:text-ga-darkText">
          Достигнут лимит тарифа GREEN-API. Загрузка аватарок и отметка о прочтении приостановлены.
        </div>
      ) : null}

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-ga-bg dark:bg-ga-darkBg md:flex-row">
        {isMobile ? (
          sidebarOpen ? (
            <Sidebar
              chats={displayChats}
              isLoading={chatsQuery.isLoading}
              isError={chatsQuery.isError}
              quotaExceeded={chatsQuotaExceeded}
              onRetry={handleRetryChats}
              onNewChat={handleNewChat}
              onOpenContact={handleOpenContact}
              onSelectChat={handleSelectChat}
            />
          ) : (
            <ChatWindow />
          )
        ) : (
          <>
            <div className="hidden w-80 shrink-0 flex-col md:flex">
              <Sidebar
                chats={displayChats}
                isLoading={chatsQuery.isLoading}
                isError={chatsQuery.isError}
                quotaExceeded={chatsQuotaExceeded}
                onRetry={handleRetryChats}
                onNewChat={handleNewChat}
                onOpenContact={handleOpenContact}
                onSelectChat={handleSelectChat}
              />
            </div>
            <ChatWindow />
          </>
        )}
      </main>
      {newChatOpen ? <NewChatDialog open onClose={() => setNewChatOpen(false)} /> : null}
    </div>
  );
}
