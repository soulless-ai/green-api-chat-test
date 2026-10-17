import type { Message } from '@/entities/message/model/message';
import { formatTime } from '@/shared/lib/date';

interface MessageItemProps {
  message: Message;
  onDelete?: () => void;
}

function SingleCheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3 w-3"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      viewBox="0 0 12 11"
    >
      <path d="M1 5.5 4.5 9 11 1.5" />
    </svg>
  );
}

function DoubleCheckIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-3 w-4 ${className ?? ''}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      viewBox="0 0 18 11"
    >
      <path d="M1 5.5 4.5 9 11 1.5" />
      <path d="M6.5 5.5 10 9 16.5 1.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3 w-3"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.6}
      viewBox="0 0 16 16"
    >
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 4.5V8l2.5 1.5" />
    </svg>
  );
}

function FailedIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3 w-3 text-ga-danger dark:text-ga-darkDanger"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      viewBox="0 0 16 16"
    >
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 5v4M8 11h.01" />
    </svg>
  );
}

function MessageStatus({ status }: { status: Message['status'] }) {
  switch (status) {
    case 'pending':
      return <ClockIcon />;
    case 'failed':
      return <FailedIcon />;
    case 'read':
      return <DoubleCheckIcon className="text-ga-readTick dark:text-ga-darkReadTick" />;
    case 'delivered':
      return <DoubleCheckIcon />;
    default:
      return <SingleCheckIcon />;
  }
}

export function MessageItem({ message, onDelete }: MessageItemProps) {
  const isOutgoing = message.direction === 'out';

  return (
    <div className={`group flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm sm:max-w-[70%] ${
          isOutgoing
            ? 'rounded-br-md bg-ga-messageCardOutBg text-ga-text dark:bg-ga-darkMessageCardOutBg dark:text-ga-darkText'
            : 'rounded-bl-md bg-ga-messageCardInBg text-ga-text dark:bg-ga-darkMessageCardInBg dark:text-ga-darkText'
        }`}
      >
        {message.direction === 'in' && message.senderName ? (
          <div className="mb-1 text-xs font-semibold text-ga-primary">{message.senderName}</div>
        ) : null}

        {message.mediaUrl ? (
          <div className="flex flex-col gap-2">
            <img
              src={message.mediaUrl}
              alt={message.text}
              className="max-h-64 max-w-full cursor-pointer rounded-xl object-cover"
            />
            {message.text ? (
              <div className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                {message.text}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
            {message.text}
          </div>
        )}

        <div className="mt-1 flex items-center justify-end gap-1 text-[11px] leading-none text-ga-textSecondary dark:text-ga-darkTextSecondary">
          <span>{formatTime(message.timestamp)}</span>
          {isOutgoing ? <MessageStatus status={message.status} /> : null}
          {isOutgoing && onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="-mr-1 ml-0.5 rounded p-1 opacity-100 transition-opacity hover:text-ga-danger focus-visible:outline-none focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100"
              aria-label="Удалить сообщение"
            >
              ✕
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
