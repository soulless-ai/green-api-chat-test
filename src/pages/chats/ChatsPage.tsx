import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { useInstanceUiStore } from '@/entities/instance/model/instance';
import { GreenApiHttpClient } from '@/shared/api/http/client';
import { getStateInstance } from '@/shared/api/repositories/instance.repository';
import { useQuery } from '@tanstack/react-query';
import { useIsMobile } from '@/shared/lib/useIsMobile';
import { Header } from '@/shared/ui/Header';
import { Button } from '@/shared/ui/Button';
import { ChatSidebar } from '@/widgets/chat-sidebar';
import { ChatWindow } from '@/widgets/chat-window';
import { NewChatDialog } from '@/widgets/new-chat-dialog';
import { getMessengerSettings } from '@/shared/api/repositories/instance.repository';
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
  const toggleSidebar = useInstanceUiStore((state) => state.toggleSidebar);
  const setChatsList = useChatsStore((state) => state.setChatsList);
  const setAvatarUrl = useChatsStore((state) => state.setAvatarUrl);
  const setCredentials = useCredentialsStore((state) => state.setCredentials);
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
    refetchInterval: 0,
    retry: 1,
  });

  const chatsQuery = useChatsQuery();

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
    retry: 1,
  });

  useEffect(() => {
    if (accountQuery.data?.avatar && accountQuery.data.chatId && credentials?.avatarUrl !== accountQuery.data.avatar) {
      setAvatarUrl(accountQuery.data.chatId, accountQuery.data.avatar);
      setCredentials(
        { ...credentials!, avatarUrl: accountQuery.data.avatar },
        true,
      );
    }
  }, [accountQuery.data, credentials?.avatarUrl, setAvatarUrl, setCredentials]);

  useEffect(() => {
    if (!chatsQuery.data || !credentials) return;

    const messenger = credentials.messenger ?? 'whatsapp';

    setChatsList(
      chatsQuery.data.map((summary) => summaryToChat(summary, messenger)),
    );
  }, [chatsQuery.data, credentials?.messenger, setChatsList]);

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
    <div className="h-dvh flex flex-col">
      <Header
        onToggleSidebar={toggleSidebar}
        onLogout={clearCredentials}
        onThemeToggle={handleThemeToggle}
        status={stateQuery.data ?? 'unknown'}
        statusLabel={statusLabelMap[stateQuery.data ?? 'unknown'] ?? 'Статус неизвестен'}
      />

      {stateQuery.data !== 'authorized' ? (
        <div className="bg-ga-notAuthorizedBg border-b border-ga-border px-5 py-3.5 text-base text-ga-text dark:border-ga-darkBorder">
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
              <div className={`fixed inset-y-0 right-0 z-60 w-full max-w-md bg-white dark:bg-ga-darkPanel border-l border-ga-border dark:border-ga-darkBorder shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-5 border-b border-ga-border dark:border-ga-darkBorder flex items-center justify-between">
                  <h2 className="text-lg font-bold text-ga-text dark:text-ga-darkText">Навигация</h2>
                  <button
                    onClick={toggleSidebar}
                    className="p-2.5 text-ga-text dark:text-ga-darkText hover:bg-ga-dark-border rounded-lg transition-colors"
                    aria-label="Закрыть навигацию"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-ga-text dark:text-ga-darkText-secondary uppercase tracking-wider mb-3">Чаты</h3>
                    <ChatSidebar onNewChat={() => setNewChatOpen(true)} />
                  </div>
                  <div className="px-4 pb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toggleSidebar();
                        navigate('/contacts');
                      }}
                      className="w-full"
                    >
                      Контакты
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 min-h-0 w-full md:hidden">
              <ChatWindow />
            </div>
          )
        ) : (
          <>
            <div className="hidden md:flex w-80 shrink-0 flex-col bg-white dark:bg-ga-darkPanel">
              <ChatSidebar onNewChat={() => setNewChatOpen(true)} />
            </div>
            <ChatWindow />
          </>
        )}
      </main>
      {newChatOpen ? <NewChatDialog open onClose={() => setNewChatOpen(false)} /> : null}
    </div>
  );
}
