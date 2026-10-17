import type { GreenApiNotification } from '@/shared/api/green-api/types';
import type { Message } from '@/entities/message/model/message';

interface OutgoingStatusUpdate {
  chatId: string;
  idMessage: string;
  status: Message['status'];
}

const OUTGOING_STATUS_MAP: Record<string, Message['status']> = {
  sent: 'sent',
  delivered: 'delivered',
  read: 'read',
  failed: 'failed',
  noaccount: 'failed',
  notingroup: 'failed',
};

export function mapOutgoingStatusNotification(
  notification: GreenApiNotification,
): OutgoingStatusUpdate | null {
  if (notification.typeWebhook !== 'outgoingMessageStatus') return null;

  const chatId = notification.chatId ?? notification.senderData?.chatId;
  const idMessage = notification.idMessage ?? notification.statusData?.idMessage;
  if (!chatId || !idMessage) return null;

  const rawStatus = String(
    notification.status ?? notification.statusData?.status ?? '',
  ).toLowerCase();

  return {
    chatId,
    idMessage,
    status: OUTGOING_STATUS_MAP[rawStatus] ?? 'sent',
  };
}

export function mapNotificationToMessage(notification: GreenApiNotification): Message | null {
  const timestamp = notification.timestamp ?? Math.floor(Date.now() / 1000);

  if (notification.typeWebhook === 'incomingMessageReceived') {
    const chatId = notification.senderData?.chatId;
    const text = notification.messageData?.textMessageData?.textMessage ?? notification.messageData?.extendedTextMessageData?.text;
    if (!chatId || !text) return null;
    return {
      id: notification.idMessage ?? `${chatId}-${timestamp}`,
      chatId,
      direction: 'in',
      text,
      timestamp,
      status: 'delivered',
      senderName: notification.senderData?.senderName ?? notification.senderData?.chatName,
    };
  }

  if (notification.typeWebhook === 'outgoingMessageReceived' || notification.typeWebhook === 'outgoingApiMessageReceived') {
    const chatId = notification.senderData?.chatId;
    const text = notification.messageData?.textMessageData?.textMessage ?? notification.messageData?.extendedTextMessageData?.text;
    if (!chatId || !text) return null;
    return {
      id: notification.idMessage ?? `${chatId}-${timestamp}-out`,
      chatId,
      direction: 'out',
      text,
      timestamp,
      status: 'sent',
    };
  }

  return null;
}
