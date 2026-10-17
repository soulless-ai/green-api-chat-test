import { memo, useCallback, useState } from 'react';
import { ChatsPanel } from './ChatsPanel';
import { ContactsPanel } from './ContactsPanel';
import type { Chat } from '@/entities/chat/model/chat';

export type SidebarTab = 'chats' | 'contacts';

interface SidebarProps {
  chats: Chat[];
  isLoading: boolean;
  isError: boolean;
  quotaExceeded: boolean;
  onRetry: () => void;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onOpenContact: (chat: Chat) => void;
}

const TABS: Array<{ id: SidebarTab; label: string }> = [
  { id: 'chats', label: 'Чаты' },
  { id: 'contacts', label: 'Контакты' },
];

function SidebarComponent({
  chats,
  isLoading,
  isError,
  quotaExceeded,
  onRetry,
  onNewChat,
  onSelectChat,
  onOpenContact,
}: SidebarProps) {
  const [tab, setTab] = useState<SidebarTab>('chats');

  const handleOpenContact = useCallback(
    (chat: Chat) => {
      setTab('chats');
      onOpenContact(chat);
    },
    [onOpenContact],
  );

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-r border-ga-border bg-ga-bg dark:border-ga-darkBorder dark:bg-ga-darkPanel">
      <div
        role="tablist"
        aria-label="Разделы"
        className="flex gap-1 border-b border-ga-border p-2.5 dark:border-ga-darkBorder sm:p-3"
      >
        {TABS.map((item) => {
          const isActive = tab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(item.id)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ga-primary ${
                isActive
                  ? 'bg-ga-primary text-white'
                  : 'text-ga-textSecondary hover:bg-ga-border/50 dark:text-ga-darkTextSecondary dark:hover:bg-ga-darkBorder/50'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === 'chats' ? (
        <ChatsPanel
          chats={chats}
          isLoading={isLoading}
          isError={isError}
          quotaExceeded={quotaExceeded}
          onRetry={onRetry}
          onNewChat={onNewChat}
          onSelectChat={onSelectChat}
        />
      ) : (
        <ContactsPanel onOpenContact={handleOpenContact} />
      )}
    </aside>
  );
}

export const Sidebar = memo(SidebarComponent);
