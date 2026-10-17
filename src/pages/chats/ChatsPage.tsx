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
import { env } from '@/shared/config/env';
import { Header } from '@/shared/ui/Header';
import { Button } from '@/shared/ui/Button';
import { ChatListItem } from './components/ChatListItem';
import { Skeleton } from '@/shared/ui/Skeleton';
import { getChats } from '@/shared/api/repositories/chats.repository';
import { useChatsStore, type Chat } from '@/entities/chat/model/chat';
import type { ChatSummary } from '@/shared/api/green-api/types';

export function ChatsPage() {
  const credentials = useCredentialsStore((state) => state.credentials);
  const clearCredentials = useCredentialsStore((state) => state.clear);
  const theme = useInstanceUiStore((state) => state.theme);
  const setTheme = useInstanceUiStore((state) => state.setTheme);
  const sidebarOpen = useInstanceUiStore((state) => state.sidebarOpen);
  const toggleSidebar = useInstanceUiStore((state) => state.toggleSidebar);
  const updateChat = useChatsStore((state) => state.updateChat);
  const chats = useChatsStore((state) => state.chats);
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
    refetchInterval: 120000,
    retry: 1,
  });

  const chatsQuery = useQuery({
    queryKey: ['chats'],
    enabled: Boolean(credentials),
    queryFn: async () => {
      if (!credentials) return [];
      const client = new GreenApiHttpClient(() => credentials);
      return getChats(client, env.historyPageSize);
    },
    refetchInterval: 300000,
    retry: 1,
  });

  useEffect(() => {
    if (!chatsQuery.data) return;
    const existingByChatId = new Map(chats.map((item) => [item.chatId, item]));
    chatsQuery.data.forEach((summary) => {
      if (!summary.chatId) return;
      const existing = existingByChatId.get(summary.chatId);
      const phoneNumber = summary.phoneNumber ?? 0;
      const chat: Chat = {
        id: summary.chatId,
        chatId: summary.chatId,
        title:
          existing?.title ??
          summary.name ??
          (phoneNumber > 0 ? String(phoneNumber) : summary.chatId),
        phone: existing?.phone ?? (phoneNumber > 0 ? String(phoneNumber) : undefined),
        messenger: credentials?.messenger ?? 'whatsapp',
        createdAt: existing?.createdAt ?? Date.now(),
        unreadCount: summary.unreadCount ?? existing?.unreadCount,
        avatarUrl: existing?.avatarUrl ?? null,
      };
      updateChat(chat);
    });
  }, [chatsQuery.data, chats, credentials?.messenger, updateChat]);

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

  const renderChatListSkeleton = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-ga-dark-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton width="60" height="1.5em" />
            <Skeleton width="100" height="1em" />
          </div>
          <Button variant="primary" size="sm" disabled>
            Новый чат
          </Button>
        </div>
        <div className="flex gap-2">
          <Skeleton width="200" height="2.5em" className="rounded-full" />
          <Skeleton width="60" height="2.5em" className="rounded-full" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-ga-dark-border/50">
            <Skeleton width="36" height="36" className="rounded-full" />
            <div className="flex-1 min-w-0">
              <Skeleton width="120" height="1.25em" />
              <Skeleton width="200" height="1em" className="mt-1" />
            </div>
            <Skeleton width="48" height="1.25em" className="rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-dvh flex flex-col">
      <Header
        onToggleSidebar={toggleSidebar}
        onLogout={clearCredentials}
        onThemeToggle={handleThemeToggle}
        status={stateQuery.data ?? 'unknown'}
        statusLabel={statusLabelMap[stateQuery.data ?? 'unknown'] ?? 'Статус неизвестен'}
      />

      {stateQuery.data !== 'authorized' ? (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-3.5 text-base text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400">
          Инстанс не авторизован. Откройте личный кабинет GREEN-API, авторизуйте номер и очистите webhookUrl.
        </div>
      ) : null}

      <main className="flex-1 min-h-0 flex flex-col md:flex-row">
        {isMobile ? (
          sidebarOpen ? (
            <>
              <div
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                onClick={toggleSidebar}
                aria-hidden="true"
              />
              <div className={`fixed inset-y-0 right-0 z-60 w-full max-w-md bg-white dark:bg-[#1f2223] border-l border-ga-dark-border shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-5 border-b border-ga-dark-border flex items-center justify-between">
                  <h2 className="text-lg font-bold text-ga-dark-text">Чаты</h2>
                  <button
                    onClick={toggleSidebar}
                    className="p-2.5 text-ga-dark-text hover:bg-ga-dark-border rounded-lg transition-colors"
                    aria-label="Закрыть список чатов"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {chatsQuery.isLoading ? renderChatListSkeleton() : <ChatSidebar onNewChat={() => setNewChatOpen(true)} />}
              </div>
            </>
          ) : (
            <div className="flex-1 min-h-0 w-full md:hidden">
              <ChatWindow />
            </div>
          )
        ) : (
          <>
            <div className="hidden md:flex w-80 shrink-0 flex-col bg-white dark:bg-[#1f2223]">
              {chatsQuery.isLoading ? renderChatListSkeleton() : <ChatSidebar onNewChat={() => setNewChatOpen(true)} />}
            </div>
            <ChatWindow />
          </>
        )}
      </main>
      {newChatOpen ? <NewChatDialog open onClose={() => setNewChatOpen(false)} /> : null}
    </div>
  );
}
