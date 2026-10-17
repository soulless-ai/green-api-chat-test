import { useQuery } from '@tanstack/react-query';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { GreenApiHttpClient } from '@/shared/api/http/client';
import { getChats } from '@/shared/api/repositories/chats.repository';
import { env } from '@/shared/config/env';
import type { ChatSummary } from '@/shared/api/green-api/types';

export const chatsQueryKey = (idInstance?: string, messenger?: string) =>
  ['chats', idInstance, messenger] as const;

export function useChatsQuery() {
  const credentials = useCredentialsStore((state) => state.credentials);

  return useQuery<ChatSummary[]>({
    queryKey: chatsQueryKey(
      credentials?.idInstance,
      credentials?.messenger,
    ),
    enabled: Boolean(credentials),
    queryFn: async () => {
      if (!credentials) return [];
      const client = new GreenApiHttpClient(() => credentials);
      return getChats(client, env.historyPageSize);
    },
    refetchInterval: 300000,
    staleTime: 60000,
  });
}
