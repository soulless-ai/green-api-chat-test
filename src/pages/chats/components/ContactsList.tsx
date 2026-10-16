import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useChatsStore } from '@/entities/chat/model/chat';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { GreenApiHttpClient } from '@/shared/api/http/client';
import { getContacts } from '@/shared/api/repositories/contacts.repository';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import type { Contact } from '@/shared/api/green-api/types';

export function ContactsList() {
  const navigate = useNavigate();
  const credentials = useCredentialsStore((state) => state.credentials);
  const addChat = useChatsStore((state) => state.addChat);
  const setActiveChat = useChatsStore((state) => state.setActiveChat);

  const contactsQuery = useQuery({
    queryKey: ['contacts'],
    enabled: Boolean(credentials),
    queryFn: async () => {
      if (!credentials) return [];
      const client = new GreenApiHttpClient(() => credentials);
      return getContacts(client);
    },
    staleTime: 1000 * 60 * 30,
  });

  const createChatFromContact = (contact: Contact) => {
    const phoneNumber = contact.phoneNumber ?? 0;
    if (!phoneNumber) return;
    const chatId = String(phoneNumber);
    const existingChat = {
      id: chatId,
      chatId,
      title: contact.name ?? `+${phoneNumber}`,
      phone: String(phoneNumber),
      messenger: credentials?.messenger ?? 'whatsapp',
      createdAt: Date.now(),
      avatarUrl: contact.avatar ?? null,
    };
    addChat(existingChat);
    setActiveChat(chatId);
    navigate('/chats');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-ga-dark-border flex items-center justify-between">
        <Button variant="ghost" size="md" onClick={() => navigate('/chats')}>
          ← Назад к чатам
        </Button>
        <h2 className="text-lg font-bold text-ga-dark-text">Контакты</h2>
        <Button variant="ghost" size="sm">
          Обновить
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {contactsQuery.isLoading ? (
          <div className="p-10 flex flex-col items-center justify-center text-ga-dark-text-secondary">
            Загрузка контактов…
          </div>
        ) : !contactsQuery.data ? (
          <p className="p-6 text-base text-center text-ga-dark-text-secondary">Не удалось загрузить контакты.</p>
        ) : contactsQuery.data.length === 0 ? (
          <p className="p-6 text-base text-center text-ga-dark-text-secondary">Контакты не найдены.</p>
        ) : (
          contactsQuery.data.map((contact) => {
            const phoneNumber = contact.phoneNumber ?? 0;
            const canWrite = phoneNumber > 0;
            return (
              <div
                key={contact.id}
                className="flex items-center gap-4 px-5 py-4 border-b border-ga-dark-border/50 hover:bg-ga-dark-border/50 transition-colors cursor-pointer group"
                onClick={() => canWrite && createChatFromContact(contact)}
              >
                <Avatar
                  src={contact.avatar ?? undefined}
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
                      createChatFromContact(contact);
                    }}
                  >
                    Написать
                  </Button>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
