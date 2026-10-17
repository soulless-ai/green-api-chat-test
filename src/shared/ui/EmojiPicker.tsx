import { useState } from 'react';

const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😜', '🤪', '😝', '🤗', '🤭', '🤫', '🤔', '😐',
  '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪',
  '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '😇', '😈',
  '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾',
  '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿',
  '🙀', '👍', '👎', '❤️', '🔥', '😭', '🎉', '✨', '💯', '🤔',
];

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  open: boolean;
  onClose: () => void;
}

export function EmojiPicker({ onEmojiSelect, open, onClose }: EmojiPickerProps) {
  if (!open) return null;

  return (
    <div
      className="fixed bottom-[88px] right-4 w-64 bg-white dark:bg-ga-darkPanel border border-ga-border dark:border-ga-darkBorder rounded-xl shadow-lg p-2 z-40 flex flex-col gap-2"
      role="dialog"
      aria-modal="true"
      aria-label="Выбор смайлика"
    >
      <div className="flex-wrap gap-1">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              onEmojiSelect(emoji);
              onClose();
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-lg hover:bg-ga-border/50 dark:hover:bg-ga-darkBorder/50 transition-colors"
            aria-label={`Смайлик ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
