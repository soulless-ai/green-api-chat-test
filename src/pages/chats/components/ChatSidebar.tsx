import { useState } from 'react';
import { useChatsStore } from '@/entities/chat/model/chat';
import { Avatar } from '@/shared/ui/Avatar';

export function ChatSidebar({ onNewChat }: { onNewChat: () => void }) {
  const [search, setSearch] = useState('');
  const chats = useChatsStore((state) => state.chats);
  const activeChatId = useChatsStore((state) => state.activeChatId);
  const setActiveChat = useChatsStore((state) => state.setActiveChat);
  const filtered = chats.filter((chat) =>
    (chat.title + ' ' + (chat.lastMessagePreview ?? '')).toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <aside className="w-full md:w-80 bg-white dark:bg-[#1f2223] border-r border-ga-dark-border flex flex-col">
      <div className="p-4 border-b border-ga-dark-border space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ga-dark-text">Чаты</h2>
          <button onClick={onNewChat} className="text-sm bg-ga-primary text-white px-3 py-1 rounded-lg hover:bg-brand-600">Новый</button>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск"
          className="w-full border border-ga-dark-border rounded-lg px-3 py-1 text-sm text-ga-dark-text bg-white dark:bg-[#1a1a1a] placeholder:text-ga-dark-text-secondary focus:ring-2 focus:ring-ga-primary"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="p-4 text-sm text-ga-dark-text-secondary">Создайте первый чат по номеру телефона.</p>
        ) : (
          filtered.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`w-full text-left px-4 py-3 border-b border-ga-dark-border/50 hover:bg-ga-dark-border/50 transition-colors ${activeChatId === chat.id ? 'bg-ga-primary-transparent' : ''}`}
            >
              <div className="flex items-center gap-3">
                <Avatar src={chat.avatarUrl ?? undefined} name={chat.title} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-ga-dark-text truncate">{chat.title}</div>
                  <div className="text-sm text-ga-dark-text-secondary truncate">
                    {chat.lastMessagePreview ?? chat.phone ?? chat.chatId}
                  </div>
                </div>
                {chat.unreadCount && chat.unreadCount > 0 ? (
                  <span className="flex-shrink-0 bg-ga-primary text-white text-xs font-bold rounded-full px-2 py-0.5">
                    {chat.unreadCount}
                  </span>
                ) : null}
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
