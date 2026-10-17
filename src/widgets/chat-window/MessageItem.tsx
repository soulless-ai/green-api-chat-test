import type { Message } from '@/entities/message/model/message';
import { formatTime } from '@/shared/lib/date';

interface MessageItemProps {
  message: Message;
  onDelete?: () => void;
}

export function MessageItem({ message, onDelete }: MessageItemProps) {
  const isMedia = Boolean((message as any).mediaUrl);
  const isOutgoing = message.direction === 'out';

  return (
    <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${isOutgoing ? 'bg-ga-messageCardOutBg text-ga-text dark:bg-ga-darkMessageCardOutBg dark:text-ga-darkText' : 'bg-ga-messageCardInBg dark:bg-ga-darkMessageCardInBg text-ga-text dark:text-ga-darkText border border-ga-border dark:border-ga-darkBorder'}`}>
        {message.direction === 'in' && message.senderName && (
          <div className="text-xs font-semibold text-ga-primary mb-1">{message.senderName}</div>
        )}
        {isMedia ? (
          <div className="flex flex-col gap-2">
            <img
              src={(message as any).mediaUrl}
              alt={message.text}
              className="max-w-full max-h-64 rounded-xl object-cover cursor-pointer"
            />
            <div className="text-xs text-ga-text dark:text-ga-darkTextSecondary truncate">{message.text}</div>
          </div>
        ) : (
          <div className="text-base whitespace-pre-wrap break-words">{message.text}</div>
        )}
        <div className="text-[11px] text-ga-text dark:text-ga-darkTextSecondary text-right mt-2 flex items-center justify-end gap-2">
          <span>{formatTime(message.timestamp)}</span>
          {isOutgoing ? (
            <>
              <span>{message.status === 'failed' ? '✗' : message.status === 'pending' ? '…' : '✓'}</span>
              <button
                onClick={onDelete}
                className="ml-2 p-1 text-ga-text dark:text-ga-darkTextSecondary hover:text-ga-danger hover:bg-ga-border/50 dark:hover:bg-ga-darkBorder/50 rounded"
                aria-label="Удалить сообщение"
              >
                ✕
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
