import { useEffect, useMemo, useRef, useState } from 'react';
import { useChatsQuery } from '@/entities/chat/api/useChatsQuery';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { summaryToChat } from '@/entities/chat/lib/chat';
import { Button } from '@/shared/ui/Button';
import { ChatListItem, ChatListItemSkeleton } from '@/widgets/chat-list';

const INITIAL_VISIBLE = 20;
const VISIBLE_STEP = 20;
const PLACEHOLDER_ROWS = 3;

export function ChatSidebar({ onNewChat }: { onNewChat: () => void }) {
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const credentials = useCredentialsStore((state) => state.credentials);
  const chatsQuery = useChatsQuery();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const chats = useMemo(
    () =>
      (chatsQuery.data ?? []).map((summary) =>
        summaryToChat(summary, credentials?.messenger ?? 'whatsapp'),
      ),
    [chatsQuery.data, credentials?.messenger],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return chats;

    return chats.filter((chat) =>
      `${chat.title} ${chat.phone ?? ''} ${chat.chatId}`
        .toLowerCase()
        .includes(term),
    );
  }, [chats, search]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [search]);

  const hasMore = visibleCount < filtered.length;
  const visibleChats = filtered.slice(0, visibleCount);
  const isInitialLoading = chatsQuery.isLoading;

  useEffect(() => {
    const element = sentinelRef.current;
    if (!element || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((count) => count + VISIBLE_STEP);
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasMore, filtered.length]);

  return (
    <aside className="w-full md:w-80 bg-white dark:bg-ga-darkPanel border-r border-ga-border dark:border-ga-darkBorder flex flex-col">
      <div className="p-5 border-b border-ga-border dark:border-ga-darkBorder space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ga-text dark:text-ga-darkText">Чаты</h2>
          <Button variant="primary" size="sm" onClick={onNewChat}>
            Новый чат
          </Button>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по чатам"
          className="w-full border border-ga-border dark:border-ga-darkBorder rounded-xl px-4 py-2.5 text-base text-ga-text dark:text-ga-darkText bg-white dark:bg-ga-darkInput placeholder:text-ga-text dark:text-ga-darkText-secondary focus:ring-2 focus:ring-ga-primary outline-none"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {isInitialLoading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <ChatListItemSkeleton key={index} />
          ))
        ) : chatsQuery.isError ? (
          <div className="p-6 flex flex-col items-center gap-4">
            <p className="text-base text-center text-ga-text dark:text-ga-darkText-secondary">
              Не удалось загрузить чаты.
            </p>
            <Button variant="outline" size="sm" onClick={() => chatsQuery.refetch()}>
              Повторить
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-base text-center text-ga-text dark:text-ga-darkText-secondary">
            {chats.length === 0
              ? 'Создайте первый чат по номеру телефона.'
              : 'Ничего не найдено.'}
          </p>
        ) : (
          <>
            {visibleChats.map((chat) => (
              <ChatListItem key={chat.chatId} chat={chat} />
            ))}

            {hasMore ? (
              <div ref={sentinelRef}>
                {Array.from({ length: PLACEHOLDER_ROWS }).map((_, index) => (
                  <ChatListItemSkeleton key={index} />
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>
    </aside>
  );
}
