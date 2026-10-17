import { useEffect, useState } from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  delay?: number;
}

function toCssSize(value: string | number): string {
  if (typeof value === 'number') return `${value}px`;

  const trimmed = value.trim();

  return /^\d+(\.\d+)?$/.test(trimmed) ? `${trimmed}px` : trimmed;
}

export function Skeleton({ className, width = '100%', height = '1em', delay = 0 }: SkeletonProps) {
  const [visible, setVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  if (!visible) return null;

  const hasRounded = /(^|\s)rounded(-|\s|$)/.test(className ?? '');

  return (
    <div
      className={[
        'animate-pulse bg-ga-border/50 dark:bg-ga-darkBorder/50',
        hasRounded ? '' : 'rounded-md',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ width: toCssSize(width), height: toCssSize(height) }}
    />
  );
}
