import type { Chat } from '@/entities/chat/model/chat';
import type { ChatSummary } from '@/shared/api/green-api/types';
import type { MessengerId } from '@/shared/types/messenger';

export function chatIdToPhone(chatId: string): string | undefined {
  const local = chatId.split('@')[0] ?? '';
  const digits = local.replace(/\D/g, '');
  return digits.length > 0 ? digits : undefined;
}

export function isGroupChatId(chatId: string): boolean {
  return chatId.endsWith('@g.us');
}

export function summaryToChat(summary: ChatSummary, messenger: MessengerId): Chat {
  const phone = chatIdToPhone(summary.id);
  const name = summary.name?.trim();

  return {
    id: summary.id,
    chatId: summary.id,
    title: name || (phone ? `+${phone}` : summary.id),
    phone,
    messenger,
    createdAt: Date.now(),
    unreadCount: summary.unreadCount,
    avatarUrl: null,
  };
}
