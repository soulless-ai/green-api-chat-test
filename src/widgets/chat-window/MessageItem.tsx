import type { Message } from '@/entities/message/model/message';
import { formatTime } from '@/shared/lib/date';

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const isMedia = Boolean((message as any).mediaUrl);
  const isOutgoing = message.direction === 'out';

  return (
    <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${isOutgoing ? 'bg-ga-light-messageCardBg text-ga-dark-text' : 'bg-white dark:bg-ga-dark-messageCardBg text-ga-dark-text border border-ga-dark-border'}`}>
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
            <div className="text-xs text-ga-dark-text-secondary truncate">{message.text}</div>
          </div>
        ) : (
          <div className="text-base whitespace-pre-wrap break-words">{message.text}</div>
        )}
        <div className="text-[11px] text-ga-dark-text-secondary text-right mt-2 flex items-center justify-end gap-2">
          <span>{formatTime(message.timestamp)}</span>
          {isOutgoing ? (
            <span>{message.status === 'failed' ? '✗' : message.status === 'pending' ? '…' : '✓'}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
