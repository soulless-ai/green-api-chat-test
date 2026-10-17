import React, { useMemo } from 'react';
import type { Message } from '@/entities/message/model/message';
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

const LOADING_BUBBLES: Array<{ outgoing: boolean; lines: string[] }> = [
  { outgoing: false, lines: ['72%', '48%'] },
  { outgoing: true, lines: ['64%'] },
  { outgoing: true, lines: ['58%', '36%'] },
  { outgoing: false, lines: ['80%'] },
  { outgoing: false, lines: ['66%', '42%'] },
  { outgoing: true, lines: ['52%'] },
];

function MessageBubbleSkeleton({
  outgoing,
  lines,
}: {
  outgoing: boolean;
  lines: string[];
}) {
  return (
    <div className={`flex ${outgoing ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`w-56 max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
          outgoing
            ? 'bg-ga-messageCardBg dark:bg-ga-darkMessageCardBg'
            : 'bg-white dark:bg-ga-darkMessageCardBg border border-ga-border dark:border-ga-darkBorder'
        }`}
      >
        {lines.map((width, index) => (
          <Skeleton
            key={index}
            width={width}
            height="0.875rem"
            className={index > 0 ? 'mt-2' : ''}
          />
        ))}
        <Skeleton width="2.5rem" height="0.5rem" className="mt-2.5 ml-auto" />
      </div>
    </div>
  );
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
      <div className="flex flex-col gap-3 py-2">
        {LOADING_BUBBLES.map((bubble, index) => (
          <MessageBubbleSkeleton
            key={index}
            outgoing={bubble.outgoing}
            lines={bubble.lines}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
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
    </div>
  );
}
