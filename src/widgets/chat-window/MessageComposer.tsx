import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/shared/ui/toast/ToastProvider';
import { Button } from '@/shared/ui/Button';
import { EmojiPicker } from '@/shared/ui/EmojiPicker';
import { messengerProfiles } from '@/shared/api/green-api/profiles';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';

interface MessageComposerProps {
  onSend: (text: string) => void;
  isSending: boolean;
  draft: string;
  setDraft: (text: string) => void;
}

function SendIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4Z" />
    </svg>
  );
}

export function MessageComposer({
  onSend,
  isSending,
  draft,
  setDraft,
}: MessageComposerProps) {
  const credentials = useCredentialsStore((state) => state.credentials);
  const toast = useToast();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const composerRef = useRef<HTMLDivElement | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);

  useEffect(() => {
    if (!emojiOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!composerRef.current?.contains(event.target as Node)) {
        setEmojiOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setEmojiOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [emojiOpen]);

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

  const handleAttach = () => {
    toast.show('Скоро добавим отправку файлов 📎', 'info');
  };

  return (
    <div
      ref={composerRef}
      className="relative border-t border-ga-border bg-ga-bg p-3 dark:border-ga-darkBorder dark:bg-ga-darkPanel sm:p-4"
    >
      <EmojiPicker
        open={emojiOpen}
        onEmojiSelect={(emoji) => setDraft(`${draft}${emoji}`)}
        onClose={() => setEmojiOpen(false)}
      />

      <div className="flex items-end gap-1.5 sm:gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEmojiOpen((open) => !open)}
          aria-label="Смайлики"
          className="shrink-0"
        >
          😊
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAttach}
          aria-label="Прикрепить файл"
          className="shrink-0"
        >
          📎
        </Button>
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Напишите сообщение…"
          className="min-w-0 flex-1 resize-none rounded-xl border border-ga-border bg-ga-bg px-3 py-2.5 text-base text-ga-text outline-none focus:ring-2 focus:ring-ga-primary dark:border-ga-darkBorder dark:bg-ga-darkInput dark:text-ga-darkText sm:px-4 sm:py-3"
        />
        <Button
          variant="primary"
          size="sm"
          onClick={handleSend}
          disabled={!draft.trim() || isSending}
          loading={isSending}
          className="shrink-0"
          aria-label="Отправить"
        >
          <SendIcon />
          <span className="ml-1.5 hidden sm:inline">Отправить</span>
        </Button>
      </div>
    </div>
  );
}
