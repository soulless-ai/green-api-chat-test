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

interface DeletedMessageUpdate {
  chatId: string;
  messageId: string;
}

export function mapDeletedMessageNotification(
  notification: GreenApiNotification,
): DeletedMessageUpdate | null {
  const isDeleted =
    notification.messageData?.typeMessage === 'deletedMessage' ||
    notification.typeWebhook === 'deletedMessage' ||
    notification.typeWebhook === 'incomingDeletedMessage' ||
    notification.typeWebhook === 'outgoingDeletedMessage';

  if (!isDeleted) return null;

  const chatId = notification.chatId ?? notification.senderData?.chatId;
  const messageId =
    notification.messageData?.deletedMessageData?.stanzaId ??
    notification.deletedMessageData?.stanzaId ??
    notification.idMessage;

  if (!chatId || !messageId) return null;

  return { chatId, messageId };
}

export function mapNotificationToMessage(notification: GreenApiNotification): Message | null {
  if (notification.messageData?.typeMessage === 'deletedMessage') return null;

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

  if (
    notification.typeWebhook === 'outgoingMessageReceived' ||
    notification.typeWebhook === 'outgoingAPIMessageReceived' ||
    notification.typeWebhook === 'outgoingApiMessageReceived'
  ) {
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
