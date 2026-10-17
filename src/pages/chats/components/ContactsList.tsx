import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { GreenApiHttpClient } from '@/shared/api/http/client';
import { getContacts } from '@/shared/api/repositories/contacts.repository';
import { ContactItem } from './ContactItem';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';

const PAGE_SIZE = 100;

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
      <div className="flex-1 overflow-y-auto">
        <div className="p-5 border-b border-ga-dark-border flex items-center justify-between">
          <Button variant="ghost" size="md" onClick={() => navigate('/chats')}>
            ← Назад к чатам
          </Button>
          <h2 className="text-lg font-bold text-ga-dark-text">Контакты</h2>
        </div>
        <div className="flex flex-col space-y-1 px-5 py-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-ga-dark-border/50">
              <Skeleton width="36" height="36" className="rounded-full" />
              <div className="flex-1 min-w-0">
                <Skeleton width="140" height="1.25em" />
                <Skeleton width="200" height="1em" className="mt-1" />
              </div>
              <Skeleton width="80" height="1.25em" className="rounded-full" />
            </div>
          ))}
        </div>
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
              {isFetchingMore ? <Skeleton width="16" height="16" className="mr-2 rounded-full" /> : null}
              Загрузить еще
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
