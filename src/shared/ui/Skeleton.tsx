import { useEffect, useState } from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  delay?: number;
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

  return (
    <div
      className={`animate-pulse rounded-md bg-ga-dark-border/50 dark:bg-ga-dark-border/30 ${className ?? ''}`}
      style={{ width: typeof width === 'number' ? `${width}px` : width, height: typeof height === 'number' ? `${height}px` : height }}
    />
  );
}
