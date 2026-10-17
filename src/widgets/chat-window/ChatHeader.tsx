import { useChatsStore } from '@/entities/chat/model/chat';
import { useIsMobile } from '@/shared/lib/useIsMobile';
import { Avatar } from '@/shared/ui/Avatar';

interface ChatHeaderProps {
  chatId: string | null;
  onBack?: () => void;
}

export function ChatHeader({ chatId, onBack }: ChatHeaderProps) {
  const isMobile = useIsMobile();
  const chat = useChatsStore((state) => state.chats.find((item) => item.id === chatId));

  if (!chat) return null;

  return (
    <header className="bg-white dark:bg-[#1f2223] border-b border-ga-dark-border px-5 py-4">
      <div className="flex items-center gap-4">
        {isMobile && onBack && (
          <button
            onClick={onBack}
            className="p-2 text-ga-dark-text hover:bg-ga-dark-border/50 rounded-lg transition-colors"
            aria-label="Назад к списку чатов"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <Avatar src={chat.avatarUrl ?? undefined} name={chat.title} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="text-lg font-bold text-ga-dark-text truncate">{chat.title}</div>
          <div className="text-sm text-ga-dark-text-secondary truncate">
            {chat.phone ?? chat.chatId}
          </div>
        </div>
      </div>
    </header>
  );
}
