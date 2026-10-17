
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
      className="h-3.5 w-3.5 shrink-0"
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

function DoubleCheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-3.5 w-4 shrink-0 ${className}`}
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
      className="h-3.5 w-3.5 shrink-0"
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
      className="h-3.5 w-3.5 shrink-0 text-ga-danger dark:text-ga-darkDangerText"
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

const STATUS_LABELS: Record<Message['status'], string> = {
  pending: 'Отправляется',
  failed: 'Ошибка отправки',
  delivered: 'Доставлено',
  read: 'Прочитано',
  sent: 'Отправлено',
};

function MessageStatus({ status }: { status: Message['status'] }) {
  const label = STATUS_LABELS[status] ?? 'Статус сообщения';

  let icon;

  switch (status) {
    case 'pending':
      icon = <ClockIcon />;
      break;

    case 'failed':
      icon = <FailedIcon />;
      break;

    case 'read':
      icon = (
        <DoubleCheckIcon className="text-ga-readTick dark:text-ga-darkReadTick" />
      );
      break;

    case 'delivered':
      icon = <DoubleCheckIcon />;
      break;

    default:
      icon = <SingleCheckIcon />;
  }

  return (
    <span
      className="inline-flex shrink-0 items-center"
      title={label}
      aria-label={label}
    >
      {icon}
    </span>
  );
}

function DeleteIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="m19 6-1 14H6L5 6" />
      <path d="M10 11v5M14 11v5" />
    </svg>
  );
}

export function MessageItem({ message, onDelete }: MessageItemProps) {
  const isOutgoing = message.direction === 'out';
  const isDeleted = Boolean(message.isDeleted);
  const hasMedia = Boolean(message.mediaUrl) && !isDeleted;
  const hasText = Boolean(message.text) && !isDeleted;

  return (
    <div
      className={`group flex min-w-0 w-full ${
        isOutgoing ? 'justify-end' : 'justify-start'
      }`}
    >
      <article
        className={`relative min-w-20 max-w-[88%] overflow-hidden rounded-2xl shadow-sm sm:max-w-[75%] lg:max-w-[65%] ${
          isOutgoing
            ? 'rounded-br-md bg-ga-messageCardOutBg text-ga-text dark:bg-ga-darkMessageCardOutBg dark:text-ga-darkText'
            : 'rounded-bl-md bg-ga-messageCardInBg text-ga-text dark:bg-ga-darkMessageCardInBg dark:text-ga-darkText'
        }`}
      >
        <div className="px-3.5 pt-2.5">
          {!isOutgoing && message.senderName && (
            <div className="mb-1.5 truncate text-xs font-semibold text-ga-primary">
              {message.senderName}
            </div>
          )}
        </div>

        {hasMedia && message.mediaUrl && (
          <div className="px-1.5">
            <img
              src={message.mediaUrl}
              alt={hasText ? message.text : 'Изображение в сообщении'}
              loading="lazy"
              decoding="async"
              className="block h-auto max-h-80 max-w-full rounded-xl object-contain"
            />
          </div>
        )}

        {hasText && (
          <div className="px-3.5 pb-1 pt-1">
            <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-[14px] leading-[1.5rem] sm:text-[15px]">
              {message.text}
            </p>
          </div>
        )}

        {isDeleted && (
          <div className="px-3.5 pb-1 pt-1">
            <p className="text-[14px] italic leading-[1.5rem] text-ga-textSecondary dark:text-ga-darkTextSecondary sm:text-[15px]">
              Сообщение удалено
            </p>
          </div>
        )}

        {!hasText && !hasMedia && !isDeleted && (
          <p className="px-3.5 pb-1 text-sm text-ga-textSecondary dark:text-ga-darkTextSecondary">
            Пустое сообщение
          </p>
        )}

        <footer className="flex min-h-7 items-center justify-end gap-1.5 px-2.5 pb-1.5 pl-3.5 pt-0.5">
          <time
            dateTime={new Date(message.timestamp).toISOString()}
            className="whitespace-nowrap text-[11px] leading-4 text-ga-textSecondary dark:text-ga-darkTextSecondary"
          >
            {formatTime(message.timestamp)}
          </time>

          {isOutgoing && !isDeleted && <MessageStatus status={message.status} />}

          {isOutgoing && onDelete && !isDeleted && (
            <button
              type="button"
              onClick={onDelete}
              aria-label="Удалить сообщение"
              title="Удалить сообщение"
              className="ml-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-ga-danger transition-colors hover:bg-ga-danger/10 hover:text-ga-dangerHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ga-primary dark:text-ga-darkDangerText dark:hover:bg-ga-danger/20 dark:hover:text-ga-darkDangerText"
            >
              <DeleteIcon />
            </button>
          )}
        </footer>
      </article>
    </div>
  );
}
