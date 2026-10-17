import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useChatsStore } from '@/entities/chat/model/chat';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { useInstanceUiStore } from '@/entities/instance/model/instance';
import { GreenApiHttpClient } from '@/shared/api/http/client';
import { getChatHistory, sendTyping, readChat, sendFileByUpload } from '@/shared/api/repositories/chats.repository';
import { sendMessage } from '@/shared/api/repositories/messages.repository';
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

const MAX_FILE_SIZE = 10 * 1024 * 1024;

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
  const [deleteConfirmMessageId, setDeleteConfirmMessageId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const chat = useChatsStore((state) => state.chats.find((item) => item.id === activeChatId));

  const historyQuery = useQuery({
    queryKey: ['chat-history', activeChatId],
    enabled: Boolean(credentials && activeChatId),
    queryFn: async () => {
      if (!credentials || !activeChatId || !chat) return [];
      const client = new GreenApiHttpClient(() => credentials);
      const items = await getChatHistory(client, chat.chatId, 100);
      return items.map((item) => {
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
      }).filter(Boolean) as Message[];
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
  }, [activeChatId, historyQuery.data, setMessages, credentials, chat]);

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
    onError: (error, _error, context) => {
      if (!activeChatId || !context) return;
      setUploadingFile(false);
      markFailed(activeChatId, context.tempId);
      toast.show(error instanceof Error ? error.message : 'Не удалось отправить файл', 'error');
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

  const handleFileChange = (file: File | null) => {
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

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmMessageId || !credentials || !chat || !activeChatId) return;
    try {
      await deleteMessage(new GreenApiHttpClient(() => credentials), chat.chatId, deleteConfirmMessageId);
      setMessages(activeChatId, (messagesByChat[activeChatId] ?? []).filter((m: Message) => m.id !== deleteConfirmMessageId));
      setDeleteConfirmMessageId(null);
    } catch {
      setDeleteConfirmMessageId(null);
    }
  };

  if (!activeChatId || !chat) {
    return <EmptyChat chatTitle={null} />;
  }

  return (
    <section className="flex-1 flex flex-col bg-ga-light-chatBg dark:bg-ga-darkChatBg">
      <ChatHeader chatId={activeChatId} onBack={isMobile ? toggleSidebar : undefined} />
      {typingUsers.length > 0 && (
        <div className="mt-2 text-sm font-medium text-ga-dark-primary italic px-5">
          {typingUsers.join(', ')} печатает…
        </div>
      )}
      <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4">
        <MessageList messages={messages} isLoading={historyQuery.isLoading} onDelete={setDeleteConfirmMessageId} />
      </div>
      <MessageComposer
        onSend={handleSend}
        onSendFile={handleSendFile}
        onFileChange={handleFileChange}
        onRemoveFile={removeSelectedFile}
        onToggleEmoji={() => setEmojiPickerOpen(!emojiPickerOpen)}
        isSending={sendMutation.isPending}
        selectedFile={selectedFile}
        uploadingFile={uploadingFile}
        draft={draft}
        setDraft={setDraft}
      />
      {emojiPickerOpen && (
        <div className="flex justify-end pr-2">
          <div
            className="fixed bottom-[110px] right-4 w-64 bg-white dark:bg-ga-darkPanel border border-ga-border dark:border-ga-darkBorder rounded-xl shadow-lg p-2 z-40 flex flex-col gap-2"
            role="dialog"
            aria-modal="true"
            aria-label="Выбор смайлика"
          >
            <div className="flex-wrap gap-1">
              {['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤗', '🤭', '🤫', '🤔', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '😇', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '🙀', '👍', '👎', '❤️', '🔥', '😭', '🎉', '✨', '💯', '🤔'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setDraft((prev) => prev + emoji);
                    setEmojiPickerOpen(false);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-lg hover:bg-ga-border/50 dark:hover:bg-ga-darkBorder/50 transition-colors"
                  aria-label={`Смайлик ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
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
