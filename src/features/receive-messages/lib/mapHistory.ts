import type { ChatHistoryItem } from '@/shared/api/green-api/types';
import type { Message } from '@/entities/message/model/message';

export function mapHistoryItem(item: ChatHistoryItem): Message | null {
  const text = item.textMessage ?? item.extendedTextMessage?.text;
  if (!text) return null;
  return {
    id: item.idMessage,
    chatId: item.chatId,
    direction: item.type === 'outgoing' ? 'out' : 'in',
    text,
    timestamp: item.timestamp,
    status: item.type === 'outgoing' ? (item.statusMessage === 'read' ? 'read' : item.statusMessage === 'delivered' ? 'delivered' : 'sent') : 'delivered',
    senderName: item.senderName ?? item.senderContactName,
  };
}
