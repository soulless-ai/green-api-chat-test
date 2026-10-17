import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { useChatsStore } from '@/entities/chat/model/chat';
import { GreenApiHttpClient } from '@/shared/api/http/client';
import { getStateInstance } from '@/shared/api/repositories/instance.repository';
import { receiveNotification, deleteNotification } from '@/shared/api/repositories/notifications.repository';
import { mapNotificationToMessage } from '../lib/mapNotification';
import { env } from '@/shared/config/env';

const STATE_CHECK_INTERVAL = 30000;

export function NotificationPoller() {
  const credentials = useCredentialsStore((state) => state.credentials);
  const queryClient = useQueryClient();
  const running = useRef(true);
  const [state, setState] = useState<'authorized' | 'notAuthorized' | 'starting' | 'blocked' | 'sleepMode' | 'unknown' | null>(null);

  useEffect(() => {
    if (!credentials) return;
    running.current = true;
    const client = new GreenApiHttpClient(() => credentials);

    let stateCheckTimer: ReturnType<typeof setTimeout> | null = null;

    const checkState = async () => {
      const s = await getStateInstance(client).catch(() => 'unknown' as const);
      setState(s);
      return s;
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
          if (body.typeWebhook === 'outgoingMessageStatus') {
            const status = String((body as { statusData?: { status?: string } }).statusData?.status ?? '').toLowerCase();
            const mapped =
              status === 'read' ? 'read' :
              status === 'delivered' ? 'delivered' :
              status === 'failed' ? 'failed' : 'sent';
            const chatId = body.senderData?.chatId;
            if (body.idMessage && chatId) {
              useChatsStore.getState().updateMessageStatus(chatId, body.idMessage, mapped);
            }
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
        } catch {
          currentState = await checkState();
          await new Promise((resolve) => window.setTimeout(resolve, env.pollBackoffBaseMs));
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
