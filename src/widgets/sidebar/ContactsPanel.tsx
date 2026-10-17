import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useContactsQuery } from '@/entities/contact/api/useContactsQuery';
import { Button } from '@/shared/ui/Button';
import { ChatListItemSkeleton } from '@/widgets/chat-list';
import { ContactItem } from '@/widgets/contact-item';
import type { Chat } from '@/entities/chat/model/chat';

const INITIAL_VISIBLE = 20;
const VISIBLE_STEP = 20;
const PLACEHOLDER_ROWS = 3;

interface ContactsPanelProps {
  onOpenContact: (chat: Chat) => void;
}

function ContactsPanelComponent({ onOpenContact }: ContactsPanelProps) {
  const contactsQuery = useContactsQuery();
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const contacts = contactsQuery.data ?? [];
    const term = search.trim().toLowerCase();
    if (!term) return contacts;

    return contacts.filter((contact) =>
      `${contact.name ?? ''} ${contact.contactName ?? ''} ${contact.phoneNumber ?? ''} ${contact.chatId}`
        .toLowerCase()
        .includes(term),
    );
  }, [contactsQuery.data, search]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [search]);

  const hasMore = visibleCount < filtered.length;
  const visibleContacts = filtered.slice(0, visibleCount);

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

  const handleOpen = useCallback(
    (chat: Chat) => onOpenContact(chat),
    [onOpenContact],
  );

  return (
    <>
      <div className="border-b border-ga-border p-3 dark:border-ga-darkBorder sm:p-4">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Поиск по контактам"
          className="w-full rounded-xl border border-ga-border bg-ga-bg px-4 py-2.5 text-base text-ga-text outline-none placeholder:text-ga-textSecondary focus:ring-2 focus:ring-ga-primary dark:border-ga-darkBorder dark:bg-ga-darkInput dark:text-ga-darkText dark:placeholder:text-ga-darkTextSecondary"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {contactsQuery.isLoading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <ChatListItemSkeleton key={index} />
          ))
        ) : contactsQuery.isError ? (
          <div className="flex flex-col items-center gap-4 p-6">
            <p className="text-center text-base text-ga-text dark:text-ga-darkTextSecondary">
              Не удалось загрузить контакты.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void contactsQuery.refetch()}
            >
              Повторить
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-center text-base text-ga-text dark:text-ga-darkTextSecondary">
            {search.trim() ? 'Ничего не найдено.' : 'Контакты не найдены.'}
          </p>
        ) : (
          <>
            {visibleContacts.map((contact) => (
              <ContactItem
                key={contact.chatId}
                contact={contact}
                onOpen={handleOpen}
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

export const ContactsPanel = memo(ContactsPanelComponent);
