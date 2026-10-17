import { useEffect, useRef, useState } from 'react';
import { useChatsStore } from '@/entities/chat/model/chat';
import { useChatContactQuery } from '@/entities/chat/api/useChatContactQuery';
import {
  isGroupChatId,
  resolveAvatar,
  resolveContactName,
} from '@/entities/chat/lib/chat';
import { formatPhone } from '@/shared/lib/phone';
import { Avatar } from '@/shared/ui/Avatar';
import { Skeleton } from '@/shared/ui/Skeleton';
import type { Chat } from '@/entities/chat/model/chat';

interface ChatListItemProps {
  chat: Chat;
}

export function ChatListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-ga-border dark:border-ga-darkBorder/50">
      <Skeleton width="36" height="36" className="rounded-full shrink-0" />
      <div className="flex-1 min-w-0">
        <Skeleton width="55%" height="1.1em" />
        <Skeleton width="80%" height="0.9em" className="mt-1.5" />
      </div>
    </div>
  );
}

export function ChatListItem({ chat }: ChatListItemProps) {
  const activeChatId = useChatsStore((state) => state.activeChatId);
  const setActiveChat = useChatsStore((state) => state.setActiveChat);
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

  const contactQuery = useChatContactQuery(chat.chatId, isVisible && !isGroup);
  const info = contactQuery.data ?? null;

  const isActive = activeChatId === chat.id;
  const isResolving = isVisible && !isGroup && contactQuery.isPending;
  const showTextSkeleton = isResolving && !chat.hasName;

  const resolvedName = info
    ? resolveContactName(info.name, info.contactName)
    : undefined;
  const title = resolvedName ?? chat.title;
  const phone =
    info?.phoneNumber != null
      ? String(info.phoneNumber)
      : chat.phone;
  const avatarUrl =
    (info ? resolveAvatar(info.avatar, info.base64Avatar) : null) ??
    chat.avatarUrl ??
    undefined;

  const subtitle = chat.lastMessagePreview
    ? chat.lastMessagePreview
    : phone
      ? formatPhone(phone)
      : isGroup
        ? 'Группа'
        : chat.chatId;

  useEffect(() => {
    if (!isActive || !info) return;

    updateChat({
      ...chat,
      title,
      phone,
      avatarUrl: avatarUrl ?? null,
      hasName: Boolean(resolvedName) || Boolean(chat.hasName),
    });
  }, [isActive, info, title, phone, avatarUrl, resolvedName, chat, updateChat]);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => setActiveChat(chat.id)}
      className={`w-full text-left px-5 py-4 border-b border-ga-border dark:border-ga-darkBorder/50 hover:bg-ga-border/50 dark:hover:bg-ga-darkBorder/50 transition-colors ${
        isActive
          ? 'bg-ga-primary/10 border-l-2 border-ga-primary'
          : 'border-l-2 border-transparent'
      }`}
    >
      <div className="flex items-center gap-4">
        {isResolving ? (
          <Skeleton width="36" height="36" className="rounded-full shrink-0" />
        ) : (
          <Avatar src={avatarUrl} name={title} size="md" />
        )}

        <div className="flex-1 min-w-0">
          {showTextSkeleton ? (
            <>
              <Skeleton width="60%" height="1.1em" />
              <Skeleton width="85%" height="0.9em" className="mt-1.5" />
            </>
          ) : (
            <>
              <div className="text-base font-medium text-ga-text dark:text-ga-darkText truncate">
                {title}
              </div>
              <div className="text-sm text-ga-text dark:text-ga-darkText-secondary truncate mt-0.5">
                {subtitle}
              </div>
            </>
          )}
        </div>

        {chat.unreadCount && chat.unreadCount > 0 ? (
          <span className="flex-shrink-0 bg-ga-primary text-white text-xs font-bold rounded-full px-2.5 py-0.5">
            {chat.unreadCount}
          </span>
        ) : null}
      </div>
    </button>
  );
}
