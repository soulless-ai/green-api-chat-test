import { useQuery } from '@tanstack/react-query';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { GreenApiHttpClient } from '@/shared/api/http/client';
import { getAvatar } from '@/shared/api/repositories/chats.repository';
import { useQuotaExceeded } from '@/shared/lib/useQuotaExceeded';

export const chatAvatarQueryKey = (chatId: string | null) =>
  ['chat-avatar', chatId] as const;

export function useChatAvatarQuery(chatId: string | null, enabled: boolean) {
  const credentials = useCredentialsStore((state) => state.credentials);
  const quotaExceeded = useQuotaExceeded();

  return useQuery<string | null>({
    queryKey: chatAvatarQueryKey(chatId),
    enabled: Boolean(credentials && chatId && enabled) && !quotaExceeded,
    queryFn: async () => {
      if (!credentials || !chatId) return null;
      const client = new GreenApiHttpClient(() => credentials);
      const avatar = await getAvatar(client, chatId);
      return avatar?.urlAvatar || null;
    },
    staleTime: Infinity,
    retry: false,
  });
}
