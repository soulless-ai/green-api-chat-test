import { useQuery } from '@tanstack/react-query';
import { useChatsStore } from '@/entities/chat/model/chat';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { GreenApiHttpClient } from '@/shared/api/http/client';
import { getAvatar } from '@/shared/api/repositories/chats.repository';
import { Avatar } from '@/shared/ui/Avatar';
import type { Chat } from '@/entities/chat/model/chat';

interface ChatListItemProps {
  chat: Chat;
}

export function ChatListItem({ chat }: ChatListItemProps) {
  const credentials = useCredentialsStore((state) => state.credentials);
  const activeChatId = useChatsStore((state) => state.activeChatId);
  const setActiveChat = useChatsStore((state) => state.setActiveChat);

  const avatarQuery = useQuery({
    queryKey: ['avatar', chat.chatId],
    enabled: Boolean(credentials && chat.chatId),
    queryFn: async () => {
      if (!credentials || !chat.chatId) return null;
      const client = new GreenApiHttpClient(() => credentials);
      const avatar = await getAvatar(client, chat.chatId);
      return avatar?.urlAvatar ?? null;
    },
    staleTime: 1000 * 60 * 30,
  });

  return (
    <button
      onClick={() => setActiveChat(chat.id)}
      className={`w-full text-left px-5 py-4 border-b border-ga-dark-border/50 hover:bg-ga-dark-border/50 transition-colors ${activeChatId === chat.id ? 'bg-ga-primary-transparent border-l-2 border-ga-primary' : ''}`}
    >
      <div className="flex items-center gap-4">
        <Avatar src={avatarQuery.data ?? chat.avatarUrl ?? undefined} name={chat.title} size="md" />
        <div className="flex-1 min-w-0">
          <div className="text-base font-medium text-ga-dark-text truncate">{chat.title}</div>
          <div className="text-sm text-ga-dark-text-secondary truncate mt-0.5">
            {chat.lastMessagePreview ?? chat.phone ?? chat.chatId}
          </div>
        </div>
        {chat.unreadCount && chat.unreadCount > 0 ? (
          <span className="flex-shrink-0 bg-ga-primary text-white text-xs font-bold rounded-full px-2.5 py-0.5">
            {chat.unreadCount}
          </span>
        ) : null}
      </div>
    </button>
  );
}
