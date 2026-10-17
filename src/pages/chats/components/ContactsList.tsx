import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { GreenApiHttpClient } from '@/shared/api/http/client';
import { getContacts } from '@/shared/api/repositories/contacts.repository';
import { ContactItem } from './ContactItem';
import { Button } from '@/shared/ui/Button';
import { Preloader } from '@/shared/ui/Preloader';

const PAGE_SIZE = 50;

export function ContactsList() {
  const navigate = useNavigate();
  const credentials = useCredentialsStore((state) => state.credentials);

  const contactsQuery = useInfiniteQuery({
    queryKey: ['contacts'],
    enabled: Boolean(credentials),
    queryFn: async ({ pageParam = PAGE_SIZE }) => {
      if (!credentials) return [];
      const client = new GreenApiHttpClient(() => credentials);
      return getContacts(client, pageParam);
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length === 0) return undefined;
      return (pages.length * PAGE_SIZE) + PAGE_SIZE;
    },
    initialPageParam: PAGE_SIZE,
    staleTime: 1000 * 60 * 30,
  });

  if (contactsQuery.isFetching && !contactsQuery.data) {
    return (
      <div className="flex flex-col h-full items-center justify-center pt-20">
        <Preloader size="lg" />
        <p className="mt-3 text-base text-ga-dark-text-secondary">Загрузка контактов…</p>
      </div>
    );
  }

  if (!contactsQuery.data) {
    return (
      <div className="flex flex-col h-full items-center justify-center pt-20">
        <p className="text-base text-ga-dark-text-secondary">Не удалось загрузить контакты.</p>
      </div>
    );
  }

  const allContacts = contactsQuery.data.pages.flat();
  const isFetchingMore = contactsQuery.isFetching && contactsQuery.data.pages.length > 1;

  if (allContacts.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center pt-20">
        <p className="text-base text-ga-dark-text-secondary">Контакты не найдены.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-ga-dark-border flex items-center justify-between">
        <Button variant="ghost" size="md" onClick={() => navigate('/chats')}>
          ← Назад к чатам
        </Button>
        <h2 className="text-lg font-bold text-ga-dark-text">Контакты</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {allContacts.map((contact) => (
          <ContactItem key={contact.chatId} contact={contact} />
        ))}
        {contactsQuery.hasNextPage && (
          <div className="p-4 flex justify-center">
            <Button
              variant="outline"
              size="md"
              onClick={() => contactsQuery.fetchNextPage()}
              disabled={isFetchingMore}
            >
              {isFetchingMore ? <Preloader size="sm" className="mr-2" /> : null}
              Загрузить еще
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
