import { useQuery } from '@tanstack/react-query';
import { useChatsStore } from '@/entities/chat/model/chat';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { GreenApiHttpClient } from '@/shared/api/http/client';
import { getContactInfo } from '@/shared/api/repositories/contacts.repository';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { Preloader } from '@/shared/ui/Preloader';
import type { Contact } from '@/shared/api/green-api/types';
import { useNavigate } from 'react-router-dom';

interface ContactItemProps {
  contact: Contact;
}

export function ContactItem({ contact }: ContactItemProps) {
  const navigate = useNavigate();
  const credentials = useCredentialsStore((state) => state.credentials);
  const addChat = useChatsStore((state) => state.addChat);
  const setActiveChat = useChatsStore((state) => state.setActiveChat);
  const setAvatarUrl = useChatsStore((state) => state.setAvatarUrl);

  const phoneNumber = contact.phoneNumber ?? 0;
  const canWrite = phoneNumber > 0;

  const avatarQuery = useQuery({
    queryKey: ['contact-avatar', contact.chatId],
    enabled: Boolean(credentials && canWrite),
    queryFn: async () => {
      if (!credentials) return null;
      const client = new GreenApiHttpClient(() => credentials);
      const info = await getContactInfo(client, contact.chatId);
      return info?.avatar ?? null;
    },
    staleTime: 1000 * 60 * 30,
  });

  const handleClick = async () => {
    if (!canWrite) return;
    const chatId = String(phoneNumber);
    const existingChat = {
      id: chatId,
      chatId,
      title: contact.name ?? `+${phoneNumber}`,
      phone: String(phoneNumber),
      messenger: credentials?.messenger ?? 'whatsapp',
      createdAt: Date.now(),
      avatarUrl: null,
    };
    addChat(existingChat);
    setActiveChat(chatId);
    navigate('/chats');
    if (credentials) {
      try {
        const client = new GreenApiHttpClient(() => credentials);
        const info = await getContactInfo(client, chatId);
        if (info?.avatar) {
          setAvatarUrl(chatId, info.avatar);
        }
      } catch {
      }
    }
  };

  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-ga-dark-border/50 hover:bg-ga-dark-border/50 transition-colors cursor-pointer group"
      onClick={handleClick}>
      <Avatar
        src={avatarQuery.data ?? undefined}
        name={contact.name ?? `+${phoneNumber}`}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <div className="text-base font-medium text-ga-dark-text truncate">
          {contact.name ?? `+${phoneNumber}`}
        </div>
        {canWrite ? (
          <div className="text-sm text-ga-dark-text-secondary truncate">
            +{phoneNumber}
          </div>
        ) : (
          <div className="text-sm text-ga-dark-text-secondary truncate">Без номера телефона</div>
        )}
      </div>
      {canWrite ? (
        <Button
          variant="primary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          Написать
        </Button>
      ) : null}
    </div>
  );
}
