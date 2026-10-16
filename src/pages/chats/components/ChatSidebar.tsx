import { useChatsStore } from '@/entities/chat/model/chat';

import { useState } from 'react';

export function ChatSidebar({ onNewChat }: { onNewChat: () => void }) {
  const [search, setSearch] = useState('');
  const chats = useChatsStore((state) => state.chats);
  const activeChatId = useChatsStore((state) => state.activeChatId);
  const setActiveChat = useChatsStore((state) => state.setActiveChat);
  const filtered = chats.filter((chat) =>
    (chat.title + ' ' + (chat.lastMessagePreview ?? '')).toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <aside className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-4 border-b border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Чаты</h2>
          <button onClick={onNewChat} className="text-sm bg-brand-500 text-white px-3 py-1 rounded-lg">Новый</button>
        </div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск" className="w-full border rounded-lg px-3 py-1 text-sm" />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">Создайте первый чат по номеру телефона.</p>
        ) : (
          filtered.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-slate-50 ${activeChatId === chat.id ? 'bg-slate-100' : ''}`}
            >
              <div className="font-medium truncate">{chat.title}</div>
              <div className="text-sm text-slate-500 truncate">{chat.lastMessagePreview ?? chat.phone ?? chat.chatId}</div>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
