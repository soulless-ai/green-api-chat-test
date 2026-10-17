import type { ChatHistoryItem } from '@/shared/api/green-api/types';
import type { Message } from '@/entities/message/model/message';

export function mapHistoryItem(item: ChatHistoryItem): Message | null {
  if (item.typeMessage === 'deletedMessage') return null;

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

export function collectDeletedHistoryIds(items: ChatHistoryItem[]): string[] {
  const ids: string[] = [];

  for (const item of items) {
    if (item.typeMessage !== 'deletedMessage') continue;

    const id = item.deletedMessageData?.stanzaId ?? item.stanzaId ?? item.idMessage;
    if (id) ids.push(id);
  }

  return ids;
}

const STATUS_RANK: Record<Message['status'], number> = {
  pending: 0,
  failed: 0,
  sent: 1,
  delivered: 2,
  read: 3,
};

export function mergeMessages(current: Message[], history: Message[]): Message[] {
  const byId = new Map<string, Message>();

  for (const message of current) {
    byId.set(message.id, message);
  }

  for (const incoming of history) {
    const existing = byId.get(incoming.id);

    if (!existing) {
      byId.set(incoming.id, incoming);
      continue;
    }

    if (existing.isDeleted) {
      continue;
    }

    if (incoming.isDeleted) {
      byId.set(incoming.id, {
        ...existing,
        ...incoming,
        isDeleted: true,
        text: '',
        mediaUrl: undefined,
        fileName: undefined,
      });
      continue;
    }

    const status =
      STATUS_RANK[incoming.status] >= STATUS_RANK[existing.status]
        ? incoming.status
        : existing.status;

    const unchanged =
      existing.status === status &&
      existing.text === incoming.text &&
      existing.timestamp === incoming.timestamp &&
      existing.senderName === incoming.senderName &&
      existing.direction === incoming.direction;

    if (unchanged) continue;

    byId.set(incoming.id, { ...existing, ...incoming, status });
  }

  return [...byId.values()].sort((a, b) => a.timestamp - b.timestamp);
}
