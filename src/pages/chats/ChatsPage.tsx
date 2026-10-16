import { useState } from 'react';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { useInstanceUiStore } from '@/entities/instance/model/instance';
import { GreenApiHttpClient } from '@/shared/api/http/client';
import { getStateInstance } from '@/shared/api/repositories/instance.repository';
import { useQuery } from '@tanstack/react-query';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatWindow } from './components/ChatWindow';
import { NewChatDialog } from './components/NewChatDialog';

export function ChatsPage() {
  const credentials = useCredentialsStore((state) => state.credentials);
  const clearCredentials = useCredentialsStore((state) => state.clear);
  const sidebarOpen = useInstanceUiStore((state) => state.sidebarOpen);
  const toggleSidebar = useInstanceUiStore((state) => state.toggleSidebar);
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

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-brand-700 text-white px-4 py-2 flex items-center justify-between">
        <span className="font-semibold">GREEN-API Chat</span>
        <button onClick={toggleSidebar} className="md:hidden text-white text-sm">Меню</button>
        <div className="flex gap-3 text-sm">
          <span>{stateQuery.data === 'authorized' ? '● онлайн' : '● проверка статуса'}</span>
          <button onClick={clearCredentials} className="underline">Выйти</button>
        </div>
      </div>

      {stateQuery.data !== 'authorized' ? (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm text-amber-800">
          Инстанс не авторизован. Откройте личный кабинет GREEN-API, авторизуйте номер и очистите webhookUrl.
        </div>
      ) : null}

      <div className="flex-1 flex overflow-hidden">
        <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block`}>
          <ChatSidebar onNewChat={() => setNewChatOpen(true)} />
        </div>
        <ChatWindow />
      </div>
      <NewChatDialog open={newChatOpen} onClose={() => setNewChatOpen(false)} />
    </div>
  );
}
