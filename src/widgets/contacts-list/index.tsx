import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { GreenApiHttpClient } from '@/shared/api/http/client';
import { getContacts } from '@/shared/api/repositories/contacts.repository';
import { ContactItem } from '@/widgets/contact-item';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';

const PAGE_SIZE = 100;

function ContactsHeader() {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between gap-3 border-b border-ga-border px-4 py-3 dark:border-ga-darkBorder sm:px-5 sm:py-4">
      <Button variant="outline" size="sm" onClick={() => navigate('/chats')}>
        ← К чатам
      </Button>
      <h2 className="text-lg font-bold text-ga-text dark:text-ga-darkText">Контакты</h2>
    </header>
  );
}

export function ContactsList() {
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
      <div className="flex h-dvh flex-col overflow-hidden bg-ga-bg dark:bg-ga-darkBg">
        <ContactsHeader />
        <div className="flex-1 overflow-y-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex items-center gap-4 border-b border-ga-border px-5 py-4 dark:border-ga-darkBorder/50">
              <Skeleton width={36} height={36} className="rounded-full" />
              <div className="flex-1 min-w-0">
                <Skeleton width="45%" height="1.25rem" />
                <Skeleton width="30%" height="1rem" className="mt-1" />
              </div>
              <Skeleton width={88} height={32} className="rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!contactsQuery.data) {
    return (
      <div className="flex h-dvh flex-col overflow-hidden bg-ga-bg dark:bg-ga-darkBg">
        <ContactsHeader />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-base text-ga-text dark:text-ga-darkTextSecondary">Не удалось загрузить контакты.</p>
        </div>
      </div>
    );
  }

  const allContacts = contactsQuery.data.pages.flat();
  const isFetchingMore = contactsQuery.isFetching && contactsQuery.data.pages.length > 1;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-ga-bg dark:bg-ga-darkBg">
      <ContactsHeader />

      {allContacts.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-base text-ga-text dark:text-ga-darkTextSecondary">Контакты не найдены.</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto">
            {allContacts.map((contact) => (
              <ContactItem key={contact.chatId} contact={contact} />
            ))}
          </div>
          {contactsQuery.hasNextPage && (
            <div className="border-t border-ga-border p-4 dark:border-ga-darkBorder">
              <Button
                variant="outline"
                size="md"
                className="w-full"
                onClick={() => contactsQuery.fetchNextPage()}
                disabled={isFetchingMore}
              >
                {isFetchingMore ? <Skeleton width={16} height={16} className="mr-2 rounded-full" /> : null}
                Загрузить ещё
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
