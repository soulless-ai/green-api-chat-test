import { memo, useEffect, useRef, useState } from 'react';
import { useChatsStore } from '@/entities/chat/model/chat';
import { useChatAvatarQuery } from '@/entities/chat/api/useChatAvatarQuery';
import { isGroupChatId } from '@/entities/chat/lib/chat';
import { formatChatListTimestamp } from '@/shared/lib/date';
import { isPhoneLikeTitle, maskPhone } from '@/shared/lib/phone';
import { Avatar } from '@/shared/ui/Avatar';
import { Skeleton } from '@/shared/ui/Skeleton';
import type { Chat } from '@/entities/chat/model/chat';

const AVATAR_SIZE = 36;

const EMPTY_PREVIEW_GROUP = 'В группе пока нет сообщений';
const EMPTY_PREVIEW_PRIVATE = 'Начните переписку';

interface ChatListItemProps {
  chat: Chat;
  isActive: boolean;
  onSelect: (chatId: string) => void;
}

export const ChatListItemSkeleton = memo(function ChatListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-ga-border dark:border-ga-darkBorder/50">
      <Skeleton width={AVATAR_SIZE} height={AVATAR_SIZE} className="rounded-full shrink-0" />
      <div className="flex-1 min-w-0">
        <Skeleton width="60%" height="1.5rem" />
        <Skeleton width="85%" height="1.25rem" className="mt-0.5" />
      </div>
    </div>
  );
});

function ChatListItemComponent({ chat, isActive, onSelect }: ChatListItemProps) {
  const updateChat = useChatsStore((state) => state.updateChat);
  const [isVisible, setIsVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isGroup = isGroupChatId(chat.chatId);

  useEffect(() => {
    const element = buttonRef.current;
    if (!element || isVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '150px' },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [isVisible]);

  const avatarQuery = useChatAvatarQuery(chat.chatId, isVisible);
  const avatarUrl = avatarQuery.data ?? chat.avatarUrl ?? undefined;
  const showAvatarSkeleton = !avatarUrl && avatarQuery.isPending;

  const title = isPhoneLikeTitle(chat.title) ? maskPhone(chat.title) : chat.title;
  const preview = chat.lastMessagePreview
    ? chat.lastMessagePreview
    : isGroup
      ? EMPTY_PREVIEW_GROUP
      : EMPTY_PREVIEW_PRIVATE;
  const timestamp = chat.lastMessageAt ? formatChatListTimestamp(chat.lastMessageAt) : '';

  useEffect(() => {
    if (!isActive || !avatarUrl || avatarUrl === chat.avatarUrl) return;

    updateChat({ ...chat, avatarUrl });
  }, [isActive, avatarUrl, chat, updateChat]);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => onSelect(chat.id)}
      className={`w-full text-left px-5 py-4 border-b border-ga-border dark:border-ga-darkBorder/50 hover:bg-ga-border/50 dark:hover:bg-ga-darkBorder/50 transition-colors ${
        isActive
          ? 'bg-ga-primary/10 border-b-2 border-ga-primary'
          : 'border-b-2 border-transparent'
      }`}
    >
      <div className="flex items-center gap-4">
        {showAvatarSkeleton ? (
          <Skeleton
            width={AVATAR_SIZE}
            height={AVATAR_SIZE}
            className="rounded-full shrink-0"
          />
        ) : (
          <Avatar src={avatarUrl} name={chat.title} size="md" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate text-base leading-6 font-medium text-ga-text dark:text-ga-darkText">
              {title}
            </span>
            {timestamp ? (
              <span className="shrink-0 text-xs text-ga-textSecondary dark:text-ga-darkTextSecondary">
                {timestamp}
              </span>
            ) : null}
          </div>

          <div className="mt-0.5 flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate text-sm leading-5 text-ga-text dark:text-ga-darkTextSecondary">
              {preview}
            </span>
            {chat.unreadCount && chat.unreadCount > 0 ? (
              <span className="shrink-0 rounded-full bg-ga-primary px-2.5 py-0.5 text-xs font-bold text-white">
                {chat.unreadCount}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </button>
  );
}

export const ChatListItem = memo(ChatListItemComponent);
