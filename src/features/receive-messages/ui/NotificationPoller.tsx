import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { useChatsStore } from '@/entities/chat/model/chat';
import { messengerProfiles } from '@/shared/api/green-api/profiles';
import { GreenApiHttpClient } from '@/shared/api/http/client';
import { getStateInstance } from '@/shared/api/repositories/instance.repository';
import { receiveNotification, deleteNotification } from '@/shared/api/repositories/notifications.repository';
import { mapNotificationToMessage } from '../lib/mapNotification';
import { env } from '@/shared/config/env';

export function NotificationPoller() {
  const credentials = useCredentialsStore((state) => state.credentials);
  const queryClient = useQueryClient();
  const running = useRef(true);

  useEffect(() => {
    if (!credentials) return;
    running.current = true;
    const client = new GreenApiHttpClient(() => credentials);
    const profile = messengerProfiles[credentials.messenger];
    void profile;
    let backoff = env.pollBackoffBaseMs;

    const run = async () => {
      const state = await getStateInstance(client).catch(() => 'unknown' as const);
      if (state !== 'authorized') return;

      while (running.current) {
        try {
          const notification = await receiveNotification(client, env.pollReceiveTimeoutSec);
          if (!running.current) break;

          if (!notification) {
            await new Promise((resolve) => window.setTimeout(resolve, env.pollIdleDelayMs));
            continue;
          }

          const message = mapNotificationToMessage(notification.body);
          if (message) {
            const store = useChatsStore.getState();
            store.upsertMessage(message.chatId, message);
            const chat = store.chats.find((item) => item.chatId === message.chatId);
            if (!chat) {
              store.addChat({
                id: message.chatId,
                chatId: message.chatId,
                title: message.senderName ?? message.chatId,
                messenger: credentials.messenger,
                createdAt: Date.now(),
                lastMessagePreview: message.text,
                lastMessageAt: message.timestamp,
              });
            } else {
              store.updatePreview(message.chatId, message.text, message.timestamp);
            }
            void queryClient.invalidateQueries({ queryKey: ['chat-history', message.chatId] });
          }

          await deleteNotification(client, notification.receiptId);
          backoff = env.pollBackoffBaseMs;
        } catch {
          await new Promise((resolve) => window.setTimeout(resolve, backoff));
          backoff = Math.min(backoff * 2, env.pollBackoffMaxMs);
        }
      }
    };

    void run();
    return () => {
      running.current = false;
    };
  }, [credentials, queryClient]);

  return null;
}
