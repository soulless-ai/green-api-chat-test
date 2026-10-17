import { useEffect, useRef, useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useChatsStore } from '@/entities/chat/model/chat';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { useInstanceUiStore } from '@/entities/instance/model/instance';
import { GreenApiHttpClient } from '@/shared/api/http/client';
import { getChatHistory, sendTyping, readChat } from '@/shared/api/repositories/chats.repository';
import { isQuotaExceeded } from '@/shared/api/http/quota';
import { sendMessage } from '@/shared/api/repositories/messages.repository';
import { mapHistoryItem, mergeMessages, collectDeletedHistoryIds } from '@/features/receive-messages/lib/mapHistory';
import { createTempId } from '@/shared/lib/id';
import { useToast } from '@/shared/ui/toast/ToastProvider';
import { useIsMobile } from '@/shared/lib/useIsMobile';
import { messengerProfiles } from '@/shared/api/green-api/profiles';
import type { Message } from '@/entities/message/model/message';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageComposer } from './MessageComposer';
import { EmptyChat } from './EmptyChat';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { deleteMessage } from '@/shared/api/repositories/chats.repository';

export function ChatWindow() {
  const credentials = useCredentialsStore((state) => state.credentials);
  const activeChatId = useChatsStore((state) => state.activeChatId);
  const messagesByChat = useChatsStore((state) => state.messagesByChat);
  const upsertMessage = useChatsStore((state) => state.upsertMessage);
  const replaceMessage = useChatsStore((state) => state.replaceMessage);
  const markFailed = useChatsStore((state) => state.markFailed);
  const markMessageDeleted = useChatsStore((state) => state.markMessageDeleted);
  const updatePreview = useChatsStore((state) => state.updatePreview);
  const setSidebarOpen = useInstanceUiStore((state) => state.setSidebarOpen);
  const isMobile = useIsMobile();
  const toast = useToast();
  const [draft, setDraft] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [deleteConfirmMessageId, setDeleteConfirmMessageId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const chat = useChatsStore((state) => state.chats.find((item) => item.id === activeChatId));

  const historyQuery = useQuery({
    queryKey: ['chat-history', activeChatId],
    enabled: Boolean(credentials && activeChatId),
    queryFn: async () => {
      if (!credentials || !activeChatId || !chat) {
        return { messages: [] as Message[], deletedIds: [] as string[] };
      }
      const client = new GreenApiHttpClient(() => credentials);
      const items = await getChatHistory(client, chat.chatId, 100);
      return {
        messages: items
          .map(mapHistoryItem)
          .filter((item): item is Message => item !== null),
        deletedIds: collectDeletedHistoryIds(items),
      };
    },
    refetchInterval: 20000,
  });

  useEffect(() => {
    if (!activeChatId || !historyQuery.data) return;

    const { messages: historyMessages, deletedIds } = historyQuery.data;
    const store = useChatsStore.getState();

    for (const id of deletedIds) {
      store.markMessageDeleted(activeChatId, id);
    }

    const current = store.messagesByChat[activeChatId] ?? [];
    const merged = mergeMessages(current, historyMessages);
    store.setMessages(activeChatId, merged);

    const last = merged[merged.length - 1];

    if (last) {
      const existing = store.chats.find((item) => item.chatId === last.chatId);

      if (!existing?.lastMessageAt || last.timestamp >= existing.lastMessageAt) {
        const preview = last.isDeleted
          ? 'Сообщение удалено'
          : `${last.direction === 'out' ? 'Вы: ' : ''}${last.text}`;
        store.updatePreview(last.chatId, preview, last.timestamp);
      }
    }
  }, [activeChatId, historyQuery.data]);

  const readChatId = chat?.chatId;

  useEffect(() => {
    if (!credentials || !readChatId || isQuotaExceeded()) return;
    readChat(new GreenApiHttpClient(() => credentials), readChatId).catch(() => {});
  }, [credentials, readChatId]);

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!credentials || !chat) throw new Error('Missing chat');
      const client = new GreenApiHttpClient(() => credentials);
      return sendMessage(client, chat.chatId, text);
    },
    onMutate: async (text) => {
      if (!activeChatId) return;
      if (credentials && chat) {
        sendTyping(new GreenApiHttpClient(() => credentials), chat.chatId).catch(() => {});
      }
      const tempId = createTempId();
      const optimistic = {
        id: tempId,
        chatId: chat?.chatId ?? '',
        direction: 'out' as const,
        text,
        timestamp: Math.floor(Date.now() / 1000),
        status: 'pending' as const,
        isOptimistic: true,
      };
      upsertMessage(activeChatId, optimistic);
      return { tempId };
    },
    onSuccess: (result, _text, context) => {
      if (!activeChatId || !context) return;
      const messages = messagesByChat[activeChatId] ?? [];
      const optimistic = messages.find((item) => item.id === context.tempId);
      replaceMessage(activeChatId, context.tempId, {
        ...(optimistic ?? { id: result.idMessage, chatId: chat?.chatId ?? '', direction: 'out', text: '', timestamp: Math.floor(Date.now() / 1000), status: 'sent' }),
        id: result.idMessage,
        status: 'sent',
      });
      updatePreview(activeChatId, _text, Math.floor(Date.now() / 1000));
    },
    onError: (error, _text, context) => {
      if (!activeChatId || !context) return;
      markFailed(activeChatId, context.tempId);
      toast.show(error instanceof Error ? error.message : 'Не удалось отправить сообщение', 'error');
    },
  });

  const messages = useMemo(() => {
    const list = activeChatId ? messagesByChat[activeChatId] ?? [] : [];
    return [...list].sort((a, b) => a.timestamp - b.timestamp);
  }, [activeChatId, messagesByChat]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length]);

  useEffect(() => {
    const timer = setTimeout(() => setTypingUsers([]), 3000);
    return () => clearTimeout(timer);
  }, [typingUsers]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    if (credentials && text.length > messengerProfiles[credentials.messenger].messageMaxLength) {
      toast.show(`Сообщение длиннее ${messengerProfiles[credentials.messenger].messageMaxLength} символов`, 'error');
      return;
    }
    setDraft('');
    sendMutation.mutate(text);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmMessageId || !credentials || !chat || !activeChatId) return;
    const messageId = deleteConfirmMessageId;
    try {
      await deleteMessage(new GreenApiHttpClient(() => credentials), chat.chatId, messageId);
      markMessageDeleted(activeChatId, messageId);

      const target = (useChatsStore.getState().messagesByChat[activeChatId] ?? []).find(
        (item) => item.id === messageId,
      );

      if (target && target.timestamp >= (chat.lastMessageAt ?? 0)) {
        updatePreview(chat.chatId, 'Сообщение удалено', target.timestamp);
      }

      setDeleteConfirmMessageId(null);
    } catch {
      setDeleteConfirmMessageId(null);
    }
  };

  if (!activeChatId || !chat) {
    return <EmptyChat chatTitle={null} />;
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-ga-chatBg dark:bg-ga-darkChatBg">
      <ChatHeader chatId={activeChatId} onBack={isMobile ? () => setSidebarOpen(true) : undefined} />
      {typingUsers.length > 0 && (
        <div className="mt-2 px-3 text-sm font-medium italic text-ga-primary sm:px-5">
          {typingUsers.join(', ')} печатает…
        </div>
      )}
      <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-4 sm:px-5">
        <MessageList messages={messages} isLoading={historyQuery.isLoading} onDelete={setDeleteConfirmMessageId} />
      </div>
      <MessageComposer
        onSend={handleSend}
        isSending={sendMutation.isPending}
        draft={draft}
        setDraft={setDraft}
      />
      <ConfirmDialog
        open={deleteConfirmMessageId !== null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmMessageId(null)}
        title="Удалить сообщение?"
        message="Сообщение будет удалено без возможности восстановления."
        confirmLabel="Удалить"
        cancelLabel="Отмена"
      />
    </section>
  );
}
