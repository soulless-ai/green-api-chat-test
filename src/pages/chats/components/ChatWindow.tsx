import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useChatsStore } from '@/entities/chat/model/chat';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { useInstanceUiStore } from '@/entities/instance/model/instance';
import { GreenApiHttpClient } from '@/shared/api/http/client';
import { getChatHistory, sendTyping, readChat, sendFileByUpload } from '@/shared/api/repositories/chats.repository';
import { sendMessage } from '@/shared/api/repositories/messages.repository';
import { mapHistoryItem } from '@/features/receive-messages/lib/mapHistory';
import { createTempId } from '@/shared/lib/id';
import { formatTime } from '@/shared/lib/date';
import { useToast } from '@/shared/ui/toast/ToastProvider';
import { messengerProfiles } from '@/shared/api/green-api/profiles';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { EmojiPicker } from '@/shared/ui/EmojiPicker';
import { useIsMobile } from '@/shared/lib/useIsMobile';
import type { Message } from '@/entities/message/model/message';
import type { SendFileByUploadResponse } from '@/shared/api/green-api/types';

interface MessageWithDate extends Message {
  dateLabel?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function ChatWindow() {
  const credentials = useCredentialsStore((state) => state.credentials);
  const activeChatId = useChatsStore((state) => state.activeChatId);
  const messagesByChat = useChatsStore((state) => state.messagesByChat);
  const setMessages = useChatsStore((state) => state.setMessages);
  const upsertMessage = useChatsStore((state) => state.upsertMessage);
  const replaceMessage = useChatsStore((state) => state.replaceMessage);
  const markFailed = useChatsStore((state) => state.markFailed);
  const updatePreview = useChatsStore((state) => state.updatePreview);
  const toggleSidebar = useInstanceUiStore((state) => state.toggleSidebar);
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [draft, setDraft] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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
    if (credentials && chat) {
      readChat(new GreenApiHttpClient(() => credentials), chat.chatId).catch(() => {});
    }
  }, [activeChatId, historyQuery.data, messagesByChat, setMessages, credentials, chat]);

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

  const sendFileMutation = useMutation({
    mutationFn: async () => {
      if (!credentials || !chat || !selectedFile) throw new Error('Missing data');
      const client = new GreenApiHttpClient(() => credentials);
      return sendFileByUpload(client, chat.chatId, selectedFile, draft.trim() || undefined);
    },
    onMutate: async () => {
      if (!activeChatId || !selectedFile) return;
      const tempId = createTempId();
      const optimistic = {
        id: tempId,
        chatId: chat?.chatId ?? '',
        direction: 'out' as const,
        text: selectedFile.name,
        timestamp: Math.floor(Date.now() / 1000),
        status: 'pending' as const,
        isOptimistic: true,
        mediaUrl: URL.createObjectURL(selectedFile),
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
      };
      upsertMessage(activeChatId, optimistic);
      return { tempId };
    },
    onSuccess: (result, _context) => {
      if (!activeChatId) return;
      const fileName = selectedFile?.name ?? 'файл';
      setSelectedFile(null);
      setUploadingFile(false);
      updatePreview(activeChatId, `📎 ${fileName}`, Math.floor(Date.now() / 1000));
      queryClient.invalidateQueries({ queryKey: ['chat-history', activeChatId] });
      toast.show('Файл отправлен', 'success');
    },
    onError: (error, _context) => {
      if (!activeChatId) return;
      setUploadingFile(false);
      markFailed(activeChatId, createTempId());
      toast.show(error instanceof Error ? error.message : 'Не удалось отправить файл', 'error');
    },
  });

  const messages = useMemo(() => {
    const list = activeChatId ? messagesByChat[activeChatId] ?? [] : [];
    return [...list].sort((a, b) => a.timestamp - b.timestamp);
  }, [activeChatId, messagesByChat]);

  const messagesWithDates = useMemo(() => {
    const result: MessageWithDate[] = [];
    let prevDate: string | null = null;
    messages.forEach((message) => {
      const date = new Date(message.timestamp * 1000).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
      if (date !== prevDate) {
        result.push({ ...message, dateLabel: date } as MessageWithDate);
        prevDate = date;
      } else {
        result.push(message);
      }
    });
    return result;
  }, [messages]);

  const isMediaMessage = (message: Message) => Boolean((message as any).mediaUrl);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length]);

  useEffect(() => {
    const timer = setTimeout(() => setTypingUsers([]), 3000);
    return () => clearTimeout(timer);
  }, [typingUsers]);

  const insertEmoji = useCallback((emoji: string) => {
    setDraft((prev) => prev + emoji);
    setEmojiPickerOpen(false);
  }, []);

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.show('Файл слишком большой (макс. 10 МБ)', 'error');
      return;
    }
    setSelectedFile(file);
  };

  const handleSendFile = () => {
    if (!selectedFile) return;
    setUploadingFile(true);
    sendFileMutation.mutate();
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setUploadingFile(false);
  };

  if (!activeChatId || !chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-ga-dark-text-secondary">
        <Avatar name={chat ? chat.title : 'Выберите чат'} size="lg" className="mb-3 opacity-50" />
        <p className="text-lg font-medium text-ga-dark-text">Выберите или создайте чат</p>
        <p className="text-sm mt-1">Нажмите «Новый чат» и укажите номер телефона собеседника</p>
      </div>
    );
  }

  return (
    <section className="flex-1 flex flex-col bg-[#efeae2] dark:bg-[#1a1a1a]">
      <header className="bg-white dark:bg-[#1f2223] border-b border-ga-dark-border px-5 py-4">
        <div className="flex items-center gap-4">
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-2 text-ga-dark-text hover:bg-ga-dark-border rounded-lg"
              aria-label="Назад к списку чатов"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <Avatar src={chat.avatarUrl ?? undefined} name={chat.title} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="text-lg font-bold text-ga-dark-text truncate">{chat.title}</div>
            <div className="text-sm text-ga-dark-text-secondary truncate">
              {chat.phone ?? chat.chatId}
            </div>
          </div>
        </div>
        {typingUsers.length > 0 && (
          <div className="mt-2 text-sm font-medium text-ga-dark-primary italic">
            {typingUsers.join(', ')} печатает…
          </div>
        )}
      </header>

      <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4">
        {messagesWithDates.map((message, index) => (
          <React.Fragment key={`${message.dateLabel ?? message.id}-${index}`}>
            {message.dateLabel ? (
              <div key="date" className="my-3 flex items-center text-center">
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold text-ga-dark-text-secondary bg-white dark:bg-[#1f2223] border border-ga-dark-border">
                  {message.dateLabel}
                </span>
              </div>
            ) : null}
            <div className={`flex ${message.direction === 'out' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${message.direction === 'out' ? 'bg-ga-message-card-bg text-ga-dark-text' : 'bg-white dark:bg-[#1f2223] text-ga-dark-text border border-ga-dark-border'}`}>
                {(message.direction === 'in' && message.senderName) && (
                  <div className="text-xs font-semibold text-ga-primary mb-1">{message.senderName}</div>
                )}
                {isMediaMessage(message) ? (
                  <div className="flex flex-col gap-2">
                    <img
                      src={(message as any).mediaUrl}
                      alt={message.text}
                      className="max-w-full max-h-64 rounded-xl object-cover cursor-pointer"
                    />
                    <div className="text-xs text-ga-dark-text-secondary truncate">{message.text}</div>
                  </div>
                ) : (
                  <div className="text-base whitespace-pre-wrap break-words">{message.text}</div>
                )}
                <div className="text-[11px] text-ga-dark-text-secondary text-right mt-2 flex items-center justify-end gap-2">
                  <span>{formatTime(message.timestamp)}</span>
                  {message.direction === 'out' ? (
                    <span>{message.status === 'failed' ? '✗' : message.status === 'pending' ? '…' : '✓'}</span>
                  ) : null}
                </div>
              </div>
            </div>
          </React.Fragment>
        ))}
        {historyQuery.isLoading ? <p className="text-center text-sm text-ga-dark-text-secondary py-4">Загрузка истории…</p> : null}
      </div>

      <div className="bg-white dark:bg-[#1f2223] border-t border-ga-dark-border p-4">
        <div className="flex flex-col gap-3">
          {selectedFile && (
            <div className="flex items-center gap-3 px-2 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <span className="text-xs text-amber-800 dark:text-amber-400 font-medium">📎 {selectedFile.name}</span>
              <button
                onClick={removeSelectedFile}
                className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 text-xs"
              >
                Убрать
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              placeholder="Напишите сообщение…"
              className="flex-1 border border-ga-dark-border rounded-xl px-4 py-3 resize-none text-base text-ga-dark-text bg-white dark:bg-[#1a1a1a] focus:ring-2 focus:ring-ga-primary outline-none"
            />
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}>
                😊
              </Button>
              <label className="relative group">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />
                <Button variant="ghost" size="sm" disabled={uploadingFile}>
                  📎
                </Button>
              </label>
              <Button
                variant="primary"
                size="sm"
                onClick={selectedFile ? handleSendFile : handleSend}
                disabled={(!draft.trim() && !selectedFile) || (sendMutation.isPending || sendFileMutation.isPending)}
                loading={sendMutation.isPending || sendFileMutation.isPending}
              >
                {selectedFile ? 'Отправить файл' : 'Отправить'}
              </Button>
            </div>
          </div>
          {emojiPickerOpen && (
            <div className="flex justify-end pr-2">
              <EmojiPicker
                open={emojiPickerOpen}
                onClose={() => setEmojiPickerOpen(false)}
                onEmojiSelect={insertEmoji}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
