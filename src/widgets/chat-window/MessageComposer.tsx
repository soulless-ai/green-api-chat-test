
import { useCallback, useEffect, useRef, useState } from 'react';

import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { messengerProfiles } from '@/shared/api/green-api/profiles';
import { Button } from '@/shared/ui/Button';
import { EmojiPicker } from '@/shared/ui/EmojiPicker';
import {
  TOAST_STYLES,
  useToast,
} from '@/shared/ui/toast/ToastProvider';

interface MessageComposerProps {
  onSend: (text: string) => void;
  isSending: boolean;
  draft: string;
  setDraft: (text: string) => void;
}

function Icon({
  name,
  className = 'h-5 w-5',
}: {
  name: 'smile' | 'paperclip' | 'send';
  className?: string;
}) {
  const common = {
    className,
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 1.7,
    viewBox: '0 0 24 24',
    'aria-hidden': true as const,
  };

  switch (name) {
    case 'smile':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <path d="M9 9h.01M15 9h.01" />
        </svg>
      );

    case 'paperclip':
      return (
        <svg {...common}>
          <path d="m8 12.5 6.8-6.8a3.2 3.2 0 0 1 4.5 4.5l-8.8 8.9a5 5 0 0 1-7.1-7.1l8.5-8.5" />
        </svg>
      );

    case 'send':
      return (
        <svg {...common}>
          <path d="m22 2-7 20-4-9-9-4Z" />
          <path d="M22 2 11 13" />
        </svg>
      );
  }
}

export function MessageComposer({
  onSend,
  isSending,
  draft,
  setDraft,
}: MessageComposerProps) {
  const credentials = useCredentialsStore(
    (state) => state.credentials,
  );

  const { toasts, show, dismiss } = useToast();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);

  const [emojiOpen, setEmojiOpen] = useState(false);

  const maxLength = credentials
    ? messengerProfiles[credentials.messenger].messageMaxLength
    : undefined;

  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = '0px';

    const maxHeight = 160;

    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      maxHeight,
    )}px`;

    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [draft, resizeTextarea]);

  useEffect(() => {
    if (!emojiOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !composerRef.current?.contains(event.target)
      ) {
        setEmojiOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setEmojiOpen(false);
        textareaRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [emojiOpen]);

  const handleSend = useCallback(() => {
    const text = draft.trim();

    if (!text || isSending) return;

    if (maxLength !== undefined && text.length > maxLength) {
      show(
        `Максимальная длина сообщения — ${maxLength} символов`,
        'error',
      );
      return;
    }

    setEmojiOpen(false);
    setDraft('');
    onSend(text);
  }, [draft, isSending, maxLength, onSend, setDraft, show]);

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setDraft(`${draft}${emoji}`);
    textareaRef.current?.focus();
  };

  const handleAttach = () => {
    show('Отправка файлов скоро появится', 'info');
  };

  return (
    <div
      ref={composerRef}
      className="relative z-10 border-t border-ga-border/70 bg-ga-bg/95 px-3 py-3 dark:border-ga-darkBorder/70 dark:bg-ga-darkPanel/95 sm:px-5 sm:py-4"
    >
      <EmojiPicker
        open={emojiOpen}
        onEmojiSelect={handleEmojiSelect}
        onClose={() => setEmojiOpen(false)}
      />

      {/* Уведомления над полем ввода */}
      <div
        aria-label="Уведомления"
        aria-live="polite"
        className="pointer-events-none absolute bottom-full left-3 z-[100] mb-3 flex w-[min(20rem,calc(100vw-1.5rem))] flex-col items-start gap-2 sm:left-5"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur-xl ${TOAST_STYLES[toast.type]}`}
          >
            <span className="min-w-0 flex-1 break-words">
              {toast.message}
            </span>

            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Закрыть уведомление"
              className="flex aspect-square min-w-0 items-center justify-center rounded-lg text-xl transition-colors hover:bg-ga-border/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ga-primary active:scale-95 dark:hover:bg-ga-darkBorder"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="mx-auto flex max-w-5xl items-end gap-2">
        <div className="flex shrink-0 items-center gap-1 pb-1">
          <button
            type="button"
            onClick={() => setEmojiOpen((open) => !open)}
            aria-label="Выбрать эмодзи"
            aria-expanded={emojiOpen}
            title="Эмодзи"
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ga-primary ${
              emojiOpen
                ? 'bg-ga-primary/10 text-ga-primary'
                : 'text-ga-muted hover:bg-ga-border/50 hover:text-ga-text dark:hover:bg-ga-darkBorder/60 dark:hover:text-ga-darkText'
            }`}
          >
            <Icon name="smile" />
          </button>

          <button
            type="button"
            onClick={handleAttach}
            aria-label="Прикрепить файл"
            title="Прикрепить файл"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-ga-muted transition-colors hover:bg-ga-border/50 hover:text-ga-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ga-primary dark:hover:bg-ga-darkBorder/60 dark:hover:text-ga-darkText"
          >
            <Icon name="paperclip" />
          </button>
        </div>

        <div className="min-w-0 flex-1 rounded-2xl border border-ga-border bg-white transition-[border-color,box-shadow] focus-within:border-ga-primary/60 focus-within:ring-2 focus-within:ring-ga-primary/10 dark:border-ga-darkBorder dark:bg-ga-darkInput">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Напишите сообщение..."
            aria-label="Текст сообщения"
            className="block max-h-40 min-h-11 w-full resize-none bg-transparent px-3 py-3 text-sm leading-5 text-ga-text outline-none placeholder:text-ga-muted/80 disabled:cursor-not-allowed disabled:opacity-60 dark:text-ga-darkText sm:px-4"
          />
        </div>

        <div className="shrink-0 pb-1">
          <Button
            variant="primary"
            size="sm"
            onClick={handleSend}
            disabled={!draft.trim() || isSending}
            loading={isSending}
            aria-label="Отправить сообщение"
            className="!h-9 !w-10 !min-w-0 !px-0 sm:!w-auto sm:!px-4"
          >
            <Icon name="send" className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Отправить</span>
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-1.5 flex max-w-5xl items-center justify-between gap-3 pl-1 text-[11px] text-ga-muted">
        <span>Enter — отправить · Shift + Enter — новая строка</span>

        {maxLength !== undefined && (
          <span
            className={
              draft.length > maxLength
                ? 'shrink-0 font-medium text-ga-danger'
                : 'shrink-0 tabular-nums'
            }
          >
            {draft.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
