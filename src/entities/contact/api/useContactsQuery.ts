import { useQuery } from '@tanstack/react-query';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { GreenApiHttpClient } from '@/shared/api/http/client';
import { getContacts } from '@/shared/api/repositories/contacts.repository';
import type { Contact } from '@/shared/api/green-api/types';

export const contactsQueryKey = (idInstance?: string, messenger?: string) =>
  ['contacts', idInstance, messenger] as const;

export function useContactsQuery() {
  const credentials = useCredentialsStore((state) => state.credentials);

  return useQuery<Contact[]>({
    queryKey: contactsQueryKey(
      credentials?.idInstance,
      credentials?.messenger,
    ),
    enabled: Boolean(credentials),
    queryFn: async () => {
      if (!credentials) return [];
      const client = new GreenApiHttpClient(() => credentials);
      return getContacts(client);
    },
    refetchInterval: 300000,
    staleTime: 60000,
  });
}
