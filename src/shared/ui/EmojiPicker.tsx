
const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
  '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
  '😘', '😋', '😛', '😜', '🤪', '🤗', '🤭', '🤔',
  '😐', '😑', '😏', '😒', '🙄', '😬', '😔', '😴',
  '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '😈', '🤡',
  '👻', '💀', '👽', '🤖', '🎃', '😺', '😸', '😹',
  '😻', '😼', '😽', '🙀', '😿', '👍', '👎', '👏',
  '🙏', '💪', '❤️', '💔', '🔥', '😭', '🎉', '✨',
  '💯', '✅', '❌', '💖', '🤝', '👀', '💐', '🌹',
];

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  open: boolean;
  onClose: () => void;
}

export function EmojiPicker({
  onEmojiSelect,
  open,
  onClose,
}: EmojiPickerProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Выбор эмодзи"
      className="absolute bottom-full left-3 z-50 mb-3 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-ga-border bg-ga-bg shadow-xl shadow-black/10 dark:border-ga-darkBorder dark:bg-ga-darkPanel sm:left-5"
    >
      <div className="flex items-center justify-between border-b border-ga-border/70 px-3 py-2.5 dark:border-ga-darkBorder/70">
        <span className="text-sm font-semibold text-ga-text dark:text-ga-darkText">
          Эмодзи
        </span>

        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть выбор эмодзи"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-lg text-ga-muted transition-colors hover:bg-ga-border/50 hover:text-ga-text dark:hover:bg-ga-darkBorder dark:hover:text-ga-darkText"
        >
          ×
        </button>
      </div>

      <div className="grid max-h-56 grid-cols-8 gap-1 overflow-y-auto overscroll-contain p-2">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => {
              onEmojiSelect(emoji);
              onClose();
            }}
            aria-label={`Вставить ${emoji}`}
            className="flex aspect-square min-w-0 items-center justify-center rounded-lg text-xl transition-colors hover:bg-ga-border/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ga-primary active:scale-95 dark:hover:bg-ga-darkBorder"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
