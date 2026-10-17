import { useCallback, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Header } from '@/shared/ui/Header';
import { ChatSidebar } from '@/widgets/chat-sidebar';
import { ChatWindow } from '@/widgets/chat-window';
import { NewChatDialog } from '@/widgets/new-chat-dialog';
import { useChatsStore } from '@/entities/chat/model/chat';
import { useChatsQuery } from '@/entities/chat/api/useChatsQuery';
import { summaryToChat } from '@/entities/chat/lib/chat';

export function ChatsPage() {
  const navigate = useNavigate();
  const credentials = useCredentialsStore((state) => state.credentials);
  const clearCredentials = useCredentialsStore((state) => state.clear);
  const theme = useInstanceUiStore((state) => state.theme);
  const setTheme = useInstanceUiStore((state) => state.setTheme);
  const sidebarOpen = useInstanceUiStore((state) => state.sidebarOpen);
  const setSidebarOpen = useInstanceUiStore((state) => state.setSidebarOpen);
  const setAvatarUrl = useChatsStore((state) => state.setAvatarUrl);
  const setChatsList = useChatsStore((state) => state.setChatsList);
  const setActiveChat = useChatsStore((state) => state.setActiveChat);
  const setCredentials = useCredentialsStore((state) => state.setCredentials);
  const isMobile = useIsMobile();
  const [newChatOpen, setNewChatOpen] = useState(false);
  const handleNewChat = useCallback(() => setNewChatOpen(true), []);

  const handleSelectChat = useCallback(
    (chatId: string) => {
      setActiveChat(chatId);
      setSidebarOpen(false);
    },
    [setActiveChat, setSidebarOpen],
  );

  const handleOpenContacts = useCallback(() => {
    navigate('/contacts');
  }, [navigate]);

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
  const messenger = credentials?.messenger ?? 'whatsapp';

  const chats = useMemo(
    () =>
      (chatsQuery.data ?? []).map((summary) =>
        summaryToChat(summary, messenger),
      ),
    [chatsQuery.data, messenger],
  );

  useEffect(() => {
    if (!chatsQuery.data || !credentials) return;
    setChatsList(chats);
  }, [chatsQuery.data, chats, credentials, setChatsList]);

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

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-ga-bg dark:bg-ga-darkBg md:flex-row">
        {isMobile ? (
          sidebarOpen ? (
            <ChatSidebar
              chats={chats}
              isLoading={chatsQuery.isLoading}
              isError={chatsQuery.isError}
              quotaExceeded={chatsQuotaExceeded}
              onRetry={handleRetryChats}
              onNewChat={handleNewChat}
              onOpenContacts={handleOpenContacts}
              onSelectChat={handleSelectChat}
            />
          ) : (
            <ChatWindow />
          )
        ) : (
          <>
            <div className="hidden w-80 shrink-0 flex-col md:flex">
              <ChatSidebar
                chats={chats}
                isLoading={chatsQuery.isLoading}
                isError={chatsQuery.isError}
                quotaExceeded={chatsQuotaExceeded}
                onRetry={handleRetryChats}
                onNewChat={handleNewChat}
                onOpenContacts={handleOpenContacts}
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
