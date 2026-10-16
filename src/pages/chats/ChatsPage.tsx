import { useState, useEffect } from 'react';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { useInstanceUiStore } from '@/entities/instance/model/instance';
import { GreenApiHttpClient } from '@/shared/api/http/client';
import { getStateInstance } from '@/shared/api/repositories/instance.repository';
import { useQuery } from '@tanstack/react-query';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatWindow } from './components/ChatWindow';
import { NewChatDialog } from './components/NewChatDialog';
import { useIsMobile } from '@/shared/lib/useIsMobile';
import { Header } from '@/shared/ui/Header';
import { getChats } from '@/shared/api/repositories/chats.repository';
import { getAvatar } from '@/shared/api/repositories/chats.repository';
import { useChatsStore, type Chat } from '@/entities/chat/model/chat';
import type { ChatSummary } from '@/shared/api/green-api/types';

export function ChatsPage() {
  const credentials = useCredentialsStore((state) => state.credentials);
  const clearCredentials = useCredentialsStore((state) => state.clear);
  const theme = useInstanceUiStore((state) => state.theme);
  const setTheme = useInstanceUiStore((state) => state.setTheme);
  const sidebarOpen = useInstanceUiStore((state) => state.sidebarOpen);
  const toggleSidebar = useInstanceUiStore((state) => state.toggleSidebar);
  const addChat = useChatsStore((state) => state.addChat);
  const updateChat = useChatsStore((state) => state.updateChat);
  const setAvatarUrl = useChatsStore((state) => state.setAvatarUrl);
  const isMobile = useIsMobile();
  const [newChatOpen, setNewChatOpen] = useState(false);

  const stateQuery = useQuery({
    queryKey: ['instance-state'],
    enabled: Boolean(credentials),
    queryFn: async () => {
      if (!credentials) return 'unknown';
      const client = new GreenApiHttpClient(() => credentials);
      return getStateInstance(client);
    },
    refetchInterval: 15000,
  });

  const statusLabelMap: Record<string, string> = {
    authorized: 'Авторизован',
    notAuthorized: 'Не авторизован',
    starting: 'Запуск',
    blocked: 'Заблокирован',
    sleepMode: 'Спящий режим',
    unknown: 'Неизвестно',
  };

  const chatsQuery = useQuery({
    queryKey: ['chats'],
    enabled: Boolean(credentials),
    queryFn: async () => {
      if (!credentials) return [];
      const client = new GreenApiHttpClient(() => credentials);
      return getChats(client);
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!chatsQuery.data) return;
    chatsQuery.data.forEach((summary) => {
      const chat: Chat = {
        id: summary.chatId,
        chatId: summary.chatId,
        title: summary.name ?? summary.phoneNumber?.toString() ?? summary.chatId,
        phone: summary.phoneNumber ? String(summary.phoneNumber) : undefined,
        messenger: credentials?.messenger ?? 'whatsapp',
        createdAt: Date.now(),
        unreadCount: summary.unreadCount,
        avatarUrl: null,
      };
      addChat(chat);
    });
  }, [chatsQuery.data, credentials?.messenger, addChat]);

  useEffect(() => {
    if (!chatsQuery.data || !credentials) return;
    const client = new GreenApiHttpClient(() => credentials);
    (async () => {
      for (const summary of chatsQuery.data) {
        try {
          const avatar = await getAvatar(client, summary.chatId);
          setAvatarUrl(summary.chatId, avatar?.urlAvatar ?? null);
        } catch {
          // аватар не обязателен
        }
      }
    })();
  }, [chatsQuery.data, credentials, setAvatarUrl]);

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="h-dvh flex flex-col">
      <Header
        onToggleSidebar={toggleSidebar}
        onLogout={clearCredentials}
        onThemeToggle={handleThemeToggle}
        status={stateQuery.data ?? 'unknown'}
        statusLabel={statusLabelMap[stateQuery.data ?? 'unknown'] ?? 'Неизвестно'}
      />

      {stateQuery.data !== 'authorized' ? (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400">
          Инстанс не авторизован. Откройте личный кабинет GREEN-API, авторизуйте номер и очистите webhookUrl.
        </div>
      ) : null}

      <div className="flex-1 min-h-0 flex flex-col md:flex-row">
        {isMobile ? (
          sidebarOpen ? (
            <div className="w-full min-h-0 flex flex-col bg-white dark:bg-[#1f2223] md:hidden">
              <ChatSidebar onNewChat={() => setNewChatOpen(true)} />
            </div>
          ) : (
            <div className="flex-1 min-h-0 w-full md:hidden">
              <ChatWindow />
            </div>
          )
        ) : (
          <>
            <div className="hidden md:flex w-80 shrink-0 flex-col bg-white dark:bg-[#1f2223]">
              <ChatSidebar onNewChat={() => setNewChatOpen(true)} />
            </div>
            <ChatWindow />
          </>
        )}
      </div>
      {newChatOpen ? <NewChatDialog open onClose={() => setNewChatOpen(false)} /> : null}
    </div>
  );
}
