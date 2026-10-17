import { useRef, useState } from 'react';
import type { Message } from '@/entities/message/model/message';
import { useToast } from '@/shared/ui/toast/ToastProvider';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { EmojiPicker } from '@/shared/ui/EmojiPicker';
import { Skeleton } from '@/shared/ui/Skeleton';
import { messengerProfiles } from '@/shared/api/green-api/profiles';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';

interface MessageComposerProps {
  onSend: (text: string) => void;
  onSendFile: () => void;
  onFileChange: (file: File | null) => void;
  onRemoveFile: () => void;
  onToggleEmoji: () => void;
  isSending: boolean;
  selectedFile: File | null;
  uploadingFile: boolean;
  draft: string;
  setDraft: (text: string) => void;
}

export function MessageComposer({
  onSend,
  onSendFile,
  onFileChange,
  onRemoveFile,
  onToggleEmoji,
  isSending,
  selectedFile,
  uploadingFile,
  draft,
  setDraft,
}: MessageComposerProps) {
  const credentials = useCredentialsStore((state) => state.credentials);
  const toast = useToast();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    if (credentials && text.length > messengerProfiles[credentials.messenger].messageMaxLength) {
      toast.show(`Сообщение длиннее ${messengerProfiles[credentials.messenger].messageMaxLength} символов`, 'error');
      return;
    }
    setDraft('');
    onSend(text);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white dark:bg-ga-darkPanel border-t border-ga-border dark:border-ga-darkBorder p-4">
      <div className="flex flex-col gap-3">
        {selectedFile && (
          <div className="flex items-center gap-3 px-2 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <span className="text-xs text-amber-800 dark:text-amber-400 font-medium">📎 {selectedFile.name}</span>
            <button
              onClick={onRemoveFile}
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
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Напишите сообщение…"
            className="flex-1 border border-ga-border dark:border-ga-darkBorder rounded-xl px-4 py-3 resize-none text-base text-ga-text dark:text-ga-darkText bg-white dark:bg-ga-darkInput focus:ring-2 focus:ring-ga-primary outline-none"
          />
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={onToggleEmoji}>
              😊
            </Button>
            <label className="relative group">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
                className="sr-only"
              />
              <Button variant="ghost" size="sm" disabled={uploadingFile}>
                📎
              </Button>
            </label>
            <Button
              variant="primary"
              size="sm"
              onClick={selectedFile ? onSendFile : handleSend}
              disabled={(!draft.trim() && !selectedFile) || isSending || uploadingFile}
              loading={isSending || uploadingFile}
            >
              {selectedFile ? 'Отправить файл' : 'Отправить'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
