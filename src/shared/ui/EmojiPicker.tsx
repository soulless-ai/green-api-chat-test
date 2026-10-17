const RAW_EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😜', '🤪', '😝', '🤗', '🤭', '🤫', '🤔', '😐',
  '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😔', '😪',
  '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '😈',
  '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾',
  '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿',
  '👍', '👎', '❤️', '🔥', '😭', '🎉', '✨', '💯',
];

const EMOJIS = Array.from(new Set(RAW_EMOJIS));

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  open: boolean;
  onClose: () => void;
}

export function EmojiPicker({ onEmojiSelect, open, onClose }: EmojiPickerProps) {
  if (!open) return null;

  return (
    <div
      className="absolute bottom-full right-4 mb-2 z-40 w-72 max-h-64 overflow-y-auto rounded-xl border border-ga-border bg-white p-3 shadow-lg dark:border-ga-darkBorder dark:bg-ga-darkPanel"
      role="dialog"
      aria-label="Выбор смайлика"
    >
      <div className="grid grid-cols-8 gap-1">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => {
              onEmojiSelect(emoji);
              onClose();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-lg leading-none transition-colors hover:bg-ga-border/50 dark:hover:bg-ga-darkBorder/50"
            aria-label={`Смайлик ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
