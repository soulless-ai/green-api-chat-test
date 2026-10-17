import { useQuery } from '@tanstack/react-query';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { GreenApiHttpClient } from '@/shared/api/http/client';
import {
  getLastIncomingMessages,
  getLastOutgoingMessages,
} from '@/shared/api/repositories/chats.repository';
import { env } from '@/shared/config/env';
import type { ChatHistoryItem } from '@/shared/api/green-api/types';

export interface ChatLastMessage {
  text: string;
  timestamp: number;
  direction: 'in' | 'out';
}

export type ChatLastMessagesMap = Record<string, ChatLastMessage>;

export const chatLastMessagesQueryKey = (idInstance?: string, messenger?: string) =>
  ['chats-last-messages', idInstance, messenger] as const;

function toLastMessage(item: ChatHistoryItem): ChatLastMessage | null {
  const direction: 'in' | 'out' = item.type === 'outgoing' ? 'out' : 'in';

  if (item.typeMessage === 'deletedMessage') {
    return { text: 'Сообщение удалено', timestamp: item.timestamp, direction };
  }

  const text = item.textMessage ?? item.extendedTextMessage?.text;
  if (!text) return null;

  return {
    text,
    timestamp: item.timestamp,
    direction,
  };
}

export function useChatLastMessagesQuery() {
  const credentials = useCredentialsStore((state) => state.credentials);

  return useQuery<ChatLastMessagesMap>({
    queryKey: chatLastMessagesQueryKey(
      credentials?.idInstance,
      credentials?.messenger,
    ),
    enabled: Boolean(credentials),
    queryFn: async () => {
      if (!credentials) return {};

      const client = new GreenApiHttpClient(() => credentials);
      const [incomingResult, outgoingResult] = await Promise.allSettled([
        getLastIncomingMessages(client, env.historyPageSize),
        getLastOutgoingMessages(client, env.historyPageSize),
      ]);

      const incoming =
        incomingResult.status === 'fulfilled' ? incomingResult.value : [];
      const outgoing =
        outgoingResult.status === 'fulfilled' ? outgoingResult.value : [];

      const byChat: ChatLastMessagesMap = {};

      for (const item of [...incoming, ...outgoing]) {
        const last = toLastMessage(item);
        if (!last) continue;

        const keys = [item.chatId, item.chatId.split('@')[0] ?? item.chatId];

        for (const key of keys) {
          const existing = byChat[key];
          if (!existing || last.timestamp > existing.timestamp) {
            byChat[key] = last;
          }
        }
      }

      return byChat;
    },
    refetchInterval: 300000,
    staleTime: 60000,
  });
}
