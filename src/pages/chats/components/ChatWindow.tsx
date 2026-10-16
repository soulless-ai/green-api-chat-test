import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useChatsStore } from '@/entities/chat/model/chat';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { GreenApiHttpClient } from '@/shared/api/http/client';
import { getChatHistory } from '@/shared/api/repositories/chats.repository';
import { sendMessage } from '@/shared/api/repositories/messages.repository';
import { mapHistoryItem } from '@/features/receive-messages/lib/mapHistory';
import { createTempId } from '@/shared/lib/id';
import { formatTime } from '@/shared/lib/date';
import { messengerProfiles } from '@/shared/api/green-api/profiles';

export function ChatWindow() {
  const credentials = useCredentialsStore((state) => state.credentials);
  const activeChatId = useChatsStore((state) => state.activeChatId);
  const messagesByChat = useChatsStore((state) => state.messagesByChat);
  const setMessages = useChatsStore((state) => state.setMessages);
  const upsertMessage = useChatsStore((state) => state.upsertMessage);
  const replaceMessage = useChatsStore((state) => state.replaceMessage);
  const markFailed = useChatsStore((state) => state.markFailed);
  const updatePreview = useChatsStore((state) => state.updatePreview);
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLDivElement | null>(null);

  const chat = useChatsStore((state) => state.chats.find((item) => item.id === activeChatId));

  const historyQuery = useQuery({
    queryKey: ['chat-history', activeChatId],
    enabled: Boolean(credentials && activeChatId),
    queryFn: async () => {
      if (!credentials || !activeChatId || !chat) return [];
      const client = new GreenApiHttpClient(() => credentials);
      const items = await getChatHistory(client, chat.chatId, 100);
      return items.map(mapHistoryItem).filter((item): item is NonNullable<typeof item> => Boolean(item));
    },
  });

  useEffect(() => {
    if (!activeChatId || !historyQuery.data) return;
    const current = messagesByChat[activeChatId] ?? [];
    if (current.length === 0) {
      setMessages(activeChatId, historyQuery.data);
    } else {
      const merged = [...current];
      historyQuery.data.forEach((item) => {
        if (!merged.some((existing) => existing.id === item.id)) merged.push(item);
      });
      merged.sort((a, b) => a.timestamp - b.timestamp);
      setMessages(activeChatId, merged);
    }
  }, [activeChatId, historyQuery.data, messagesByChat, setMessages]);

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!credentials || !chat) throw new Error('Missing chat');
      const client = new GreenApiHttpClient(() => credentials);
      return sendMessage(client, chat.chatId, text);
    },
    onMutate: async (text) => {
      if (!activeChatId) return;
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
    onError: (_error, _text, context) => {
      if (!activeChatId || !context) return;
      markFailed(activeChatId, context.tempId);
    },
  });

  const messages = activeChatId ? messagesByChat[activeChatId] ?? [] : [];
  const sorted = [...messages].sort((a, b) => a.timestamp - b.timestamp);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [sorted.length]);

  if (!activeChatId || !chat) {
    return <div className="flex-1 flex items-center justify-center text-slate-500">Выберите или создайте чат</div>;
  }

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    if (credentials && text.length > (messengerProfiles[credentials.messenger].messageMaxLength)) return;
    setDraft('');
    sendMutation.mutate(text);
  };

  return (
    <section className="flex-1 flex flex-col bg-[#efeae2]">
      <header className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="font-semibold">{chat.title}</div>
        <div className="text-xs text-slate-500">{chat.phone ?? chat.chatId}</div>
      </header>

      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {sorted.map((message) => (
          <div key={message.id} className={`flex ${message.direction === 'out' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-3 py-2 shadow-sm ${message.direction === 'out' ? 'bg-[#d9fdd3]' : 'bg-white'}`}>
              {message.senderName && message.direction === 'in' ? <div className="text-xs font-medium text-brand-700">{message.senderName}</div> : null}
              <div className="whitespace-pre-wrap break-words">{message.text}</div>
              <div className="text-[10px] text-slate-500 text-right mt-1 flex items-center justify-end gap-1">
                <span>{formatTime(message.timestamp)}</span>
                {message.direction === 'out' ? <span>{message.status === 'failed' ? '✗' : message.status === 'pending' ? '…' : '✓'}</span> : null}
              </div>
            </div>
          </div>
        ))}
        {historyQuery.isLoading ? <p className="text-center text-sm text-slate-500">Загрузка истории…</p> : null}
      </div>

      <div className="bg-white border-t border-slate-200 p-3 flex gap-2">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
          rows={1}
          placeholder="Сообщение"
          className="flex-1 border rounded-2xl px-3 py-2 resize-none"
        />
        <button onClick={handleSend} disabled={sendMutation.isPending} className="bg-brand-500 text-white rounded-2xl px-4 py-2 disabled:opacity-50">
          Отправить
        </button>
      </div>
    </section>
  );
}
