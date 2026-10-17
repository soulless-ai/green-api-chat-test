import React, { useMemo } from 'react';
import type { Message } from '@/entities/message/model/message';
import { formatTime } from '@/shared/lib/date';
import { Skeleton } from '@/shared/ui/Skeleton';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onDelete?: (messageId: string) => void;
}

interface MessageWithDate extends Message {
  dateLabel?: string;
}

export function MessageList({ messages, isLoading, onDelete }: MessageListProps) {
  const sorted = useMemo(() => [...messages].sort((a, b) => a.timestamp - b.timestamp), [messages]);

  const messagesWithDates = useMemo(() => {
    const result: MessageWithDate[] = [];
    let prevDate: string | null = null;
    sorted.forEach((message) => {
      const date = new Date(message.timestamp * 1000).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
      if (date !== prevDate) {
        result.push({ ...message, dateLabel: date } as MessageWithDate);
        prevDate = date;
      } else {
        result.push(message);
      }
    });
    return result;
  }, [sorted]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 py-10">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-end gap-4 px-5 py-4 border-b border-ga-border dark:border-ga-darkBorder/50">
            <Skeleton width="60" height="60" className="rounded-full" />
            <div className="flex-1 min-w-0">
              <Skeleton width="100" height="1.25em" />
              <Skeleton width="180" height="1em" className="mt-1" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {messagesWithDates.map((message, index) => (
        <React.Fragment key={`${message.dateLabel ?? message.id}-${index}`}>
          {message.dateLabel ? (
            <div key="date" className="my-3 flex items-center text-center">
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold text-ga-text dark:text-ga-darkText-secondary bg-white dark:bg-ga-darkPanel border border-ga-border dark:border-ga-darkBorder">
                {message.dateLabel}
              </span>
            </div>
          ) : null}
          <MessageItem key={message.id} message={message} onDelete={() => { onDelete?.(message.id); }} />
        </React.Fragment>
      ))}
    </>
  );
}
