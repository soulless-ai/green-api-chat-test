import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { useChatsStore } from '@/entities/chat/model/chat';
import { GreenApiHttpClient } from '@/shared/api/http/client';
import { getStateInstance } from '@/shared/api/repositories/instance.repository';
import { receiveNotification, deleteNotification } from '@/shared/api/repositories/notifications.repository';
import { mapNotificationToMessage, mapOutgoingStatusNotification } from '../lib/mapNotification';
import { env } from '@/shared/config/env';

const STATE_CHECK_INTERVAL = 60000;
const RATE_LIMIT_BACKOFF = 30000;

export function NotificationPoller() {
  const credentials = useCredentialsStore((state) => state.credentials);
  const queryClient = useQueryClient();
  const running = useRef(true);
  const rateLimitBackoff = useRef(0);

  useEffect(() => {
    if (!credentials) return;
    running.current = true;
    const client = new GreenApiHttpClient(() => credentials);

    let stateCheckTimer: ReturnType<typeof setTimeout> | null = null;

    const checkState = async () => {
      try {
        const s = await getStateInstance(client);
        rateLimitBackoff.current = 0;
        return s;
      } catch {
        rateLimitBackoff.current = Math.min(rateLimitBackoff.current + RATE_LIMIT_BACKOFF, 300000);
        return 'unknown' as const;
      }
    };

    const run = async () => {
      let currentState = await checkState();

      while (running.current) {
        if (currentState !== 'authorized') {
          await new Promise((resolve) => window.setTimeout(resolve, STATE_CHECK_INTERVAL));
          currentState = await checkState();
          continue;
        }

        try {
          const notification = await receiveNotification(client, env.pollReceiveTimeoutSec);
          if (!running.current) break;

          if (!notification) {
            await new Promise((resolve) => window.setTimeout(resolve, env.pollIdleDelayMs));
            continue;
          }

          const body = notification.body;
          const statusUpdate = mapOutgoingStatusNotification(body);
          if (statusUpdate) {
            useChatsStore
              .getState()
              .updateMessageStatus(
                statusUpdate.chatId,
                statusUpdate.idMessage,
                statusUpdate.status,
              );
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
          rateLimitBackoff.current = 0;
        } catch {
          currentState = await checkState();
          await new Promise((resolve) => window.setTimeout(resolve, Math.max(env.pollBackoffBaseMs, rateLimitBackoff.current)));
        }
      }

      if (stateCheckTimer) clearTimeout(stateCheckTimer);
    };

    stateCheckTimer = window.setInterval(checkState, STATE_CHECK_INTERVAL);

    void run();
    return () => {
      running.current = false;
      if (stateCheckTimer) clearTimeout(stateCheckTimer);
    };
  }, [credentials, queryClient]);

  return null;
}
