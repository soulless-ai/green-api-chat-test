import { useQuery } from '@tanstack/react-query';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { GreenApiHttpClient } from '@/shared/api/http/client';
import { getAvatar } from '@/shared/api/repositories/chats.repository';

export const chatAvatarQueryKey = (chatId: string | null) =>
  ['chat-avatar', chatId] as const;

export function useChatAvatarQuery(chatId: string | null, enabled: boolean) {
  const credentials = useCredentialsStore((state) => state.credentials);

  return useQuery<string | null>({
    queryKey: chatAvatarQueryKey(chatId),
    enabled: Boolean(credentials && chatId && enabled),
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
