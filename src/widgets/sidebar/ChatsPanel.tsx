import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useChatsStore } from '@/entities/chat/model/chat';
import { Button } from '@/shared/ui/Button';
import { ChatListItem, ChatListItemSkeleton } from '@/widgets/chat-list';
import type { Chat } from '@/entities/chat/model/chat';

const INITIAL_VISIBLE = 20;
const VISIBLE_STEP = 20;
const PLACEHOLDER_ROWS = 3;

interface ChatsPanelProps {
  chats: Chat[];
  isLoading: boolean;
  isError: boolean;
  quotaExceeded: boolean;
  onRetry: () => void;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
}

function ChatsPanelComponent({
  chats,
  isLoading,
  isError,
  quotaExceeded,
  onRetry,
  onNewChat,
  onSelectChat,
}: ChatsPanelProps) {
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const activeChatId = useChatsStore((state) => state.activeChatId);
  const sentinelRef = useRef<HTMLDivElement>(null);

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

  const handleSelect = useCallback(
    (chatId: string) => onSelectChat(chatId),
    [onSelectChat],
  );

  const hasMore = visibleCount < filtered.length;
  const visibleChats = filtered.slice(0, visibleCount);

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
    <>
      <div className="flex gap-2 border-b border-ga-border p-3 dark:border-ga-darkBorder sm:p-4">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Поиск по чатам"
          className="min-w-0 flex-1 rounded-xl border border-ga-border bg-ga-bg px-4 py-2.5 text-base text-ga-text outline-none placeholder:text-ga-textSecondary focus:ring-2 focus:ring-ga-primary dark:border-ga-darkBorder dark:bg-ga-darkInput dark:text-ga-darkText dark:placeholder:text-ga-darkTextSecondary"
        />
        <Button
          variant="primary"
          size="sm"
          onClick={onNewChat}
          className="shrink-0 whitespace-nowrap"
        >
          Новый чат
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <ChatListItemSkeleton key={index} />
          ))
        ) : isError ? (
          <div className="flex flex-col items-center gap-4 p-6">
            <p className="text-center text-base text-ga-text dark:text-ga-darkTextSecondary">
              {quotaExceeded
                ? 'Достигнут лимит тарифа «Разработчик». Повысьте тариф в личном кабинете GREEN-API.'
                : 'Не удалось загрузить чаты.'}
            </p>
            {quotaExceeded ? null : (
              <Button variant="outline" size="sm" onClick={onRetry}>
                Повторить
              </Button>
            )}
          </div>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-center text-base text-ga-text dark:text-ga-darkTextSecondary">
            {chats.length === 0
              ? 'Создайте первый чат по номеру телефона.'
              : 'Ничего не найдено.'}
          </p>
        ) : (
          <>
            {visibleChats.map((chat) => (
              <ChatListItem
                key={chat.chatId}
                chat={chat}
                isActive={chat.id === activeChatId}
                onSelect={handleSelect}
              />
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
    </>
  );
}

export const ChatsPanel = memo(ChatsPanelComponent);
