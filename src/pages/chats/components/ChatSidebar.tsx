import { useState } from 'react';
import { useChatsStore } from '@/entities/chat/model/chat';
import { Button } from '@/shared/ui/Button';
import { ChatListItem } from './ChatListItem';

export function ChatSidebar({ onNewChat }: { onNewChat: () => void }) {
  const [search, setSearch] = useState('');
  const chats = useChatsStore((state) => state.chats);
  const filtered = chats.filter((chat) =>
    (chat.title + ' ' + (chat.lastMessagePreview ?? '')).toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <aside className="w-full md:w-80 bg-white dark:bg-[#1f2223] border-r border-ga-dark-border flex flex-col">
      <div className="p-5 border-b border-ga-dark-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ga-dark-text">Чаты</h2>
          <Button variant="primary" size="sm" onClick={onNewChat}>
            Новый чат
          </Button>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по чатам"
          className="w-full border border-ga-dark-border rounded-xl px-4 py-2.5 text-base text-ga-dark-text bg-white dark:bg-[#1a1a1a] placeholder:text-ga-dark-text-secondary focus:ring-2 focus:ring-ga-primary outline-none"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="p-6 text-base text-center text-ga-dark-text-secondary">Создайте первый чат по номеру телефона.</p>
        ) : (
          filtered.map((chat) => (
            <ChatListItem key={chat.chatId} chat={chat} />
          ))
        )}
      </div>
    </aside>
  );
}
