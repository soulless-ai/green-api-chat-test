import { useEffect } from 'react';
import { useChatsStore } from '@/entities/chat/model/chat';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { useChatAvatarQuery } from '@/entities/chat/api/useChatAvatarQuery';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import { isPhoneLikeTitle, maskPhone } from '@/shared/lib/phone';
import type { Contact } from '@/shared/api/green-api/types';
import type { Chat } from '@/entities/chat/model/chat';

interface ContactItemProps {
  contact: Contact;
  onOpen: (chat: Chat) => void;
}

export function ContactItem({ contact, onOpen }: ContactItemProps) {
  const credentials = useCredentialsStore((state) => state.credentials);
  const setAvatarUrl = useChatsStore((state) => state.setAvatarUrl);

  const chatId = contact.chatId;
  const canWrite = Boolean(chatId);
  const phoneNumber = contact.phoneNumber ?? 0;

  const avatarQuery = useChatAvatarQuery(chatId || null, canWrite);

  useEffect(() => {
    if (avatarQuery.data && chatId) {
      setAvatarUrl(chatId, avatarQuery.data);
    }
  }, [avatarQuery.data, chatId, setAvatarUrl]);

  const chatTitle =
    contact.name || contact.contactName || (phoneNumber > 0 ? `+${phoneNumber}` : chatId);
  const displayTitle = isPhoneLikeTitle(chatTitle) ? maskPhone(chatTitle) : chatTitle;
  const displayPhone = phoneNumber > 0 ? maskPhone(String(phoneNumber)) : '';

  const handleOpen = () => {
    if (!canWrite) return;

    onOpen({
      id: chatId,
      chatId,
      title: chatTitle,
      phone: phoneNumber > 0 ? String(phoneNumber) : undefined,
      messenger: credentials?.messenger ?? 'whatsapp',
      createdAt: Date.now(),
      avatarUrl: avatarQuery.data ?? null,
    });
  };

  return (
    <div
      role="button"
      tabIndex={canWrite ? 0 : -1}
      onClick={handleOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleOpen();
        }
      }}
      className="flex cursor-pointer items-center gap-4 border-b border-ga-border px-5 py-4 transition-colors hover:bg-ga-border/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ga-primary dark:border-ga-darkBorder/50 dark:hover:bg-ga-darkBorder/50"
    >
      {canWrite && avatarQuery.isPending ? (
        <Skeleton width={36} height={36} className="shrink-0 rounded-full" />
      ) : (
        <Avatar src={avatarQuery.data ?? undefined} name={chatTitle} size="md" />
      )}

      <div className="min-w-0 flex-1">
        <div className="truncate text-base font-medium text-ga-text dark:text-ga-darkText">
          {displayTitle}
        </div>
        {displayPhone ? (
          <div className="truncate text-sm text-ga-textSecondary dark:text-ga-darkTextSecondary">
            {displayPhone}
          </div>
        ) : null}
      </div>

      {canWrite ? (
        <Button
          variant="primary"
          size="sm"
          className="shrink-0"
          onClick={(event) => {
            event.stopPropagation();
            handleOpen();
          }}
        >
          Написать
        </Button>
      ) : null}
    </div>
  );
}
