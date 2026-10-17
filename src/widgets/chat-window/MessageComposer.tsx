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
      className="relative bg-white dark:bg-ga-darkPanel border-t border-ga-border dark:border-ga-darkBorder p-4"
    >
      <EmojiPicker
        open={emojiOpen}
        onEmojiSelect={(emoji) => setDraft(`${draft}${emoji}`)}
        onClose={() => setEmojiOpen(false)}
      />

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
        <div className="flex gap-1 items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEmojiOpen((open) => !open)}
            aria-label="Смайлики"
          >
            😊
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAttach}
            aria-label="Прикрепить файл"
          >
            📎
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSend}
            disabled={!draft.trim() || isSending}
            loading={isSending}
          >
            Отправить
          </Button>
        </div>
      </div>
    </div>
  );
}
