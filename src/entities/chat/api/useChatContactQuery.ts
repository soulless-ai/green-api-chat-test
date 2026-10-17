import { useQuery } from '@tanstack/react-query';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { GreenApiHttpClient } from '@/shared/api/http/client';
import { getContactInfo } from '@/shared/api/repositories/contacts.repository';
import type { GetContactInfoResponse } from '@/shared/api/green-api/types';

export const chatContactQueryKey = (chatId: string | null) =>
  ['chat-contact', chatId] as const;

export function useChatContactQuery(chatId: string | null, enabled: boolean) {
  const credentials = useCredentialsStore((state) => state.credentials);

  return useQuery<GetContactInfoResponse | null>({
    queryKey: chatContactQueryKey(chatId),
    enabled: Boolean(credentials && chatId && enabled),
    queryFn: async () => {
      if (!credentials || !chatId) return null;
      const client = new GreenApiHttpClient(() => credentials);
      return getContactInfo(client, chatId);
    },
    staleTime: Infinity,
    retry: 1,
  });
}
