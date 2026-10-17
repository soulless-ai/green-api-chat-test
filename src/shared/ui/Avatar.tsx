
import { useEffect, useState } from 'react';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-7 w-7',
  md: 'h-9 w-9',
  lg: 'h-12 w-12',
};

const FALLBACK_COLORS = [
  'bg-ga-primary',
  'bg-brand-600',
  'bg-blue-600',
  'bg-purple-600',
  'bg-pink-600',
  'bg-indigo-600',
];

function fallbackColorFor(value: string): string {
  let hash = 0;

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }

  const index = (hash >>> 0) % FALLBACK_COLORS.length;

  return FALLBACK_COLORS[index] ?? FALLBACK_COLORS[0];
}

function getInitials(name: string): string {
  const normalized = name.trim();

  if (!normalized) return '?';

  const phone = normalized.replace(/[\s()-]/g, '');

  if (/^\+?\d{7,}$/.test(phone)) {
    return phone.slice(-2);
  }

  const parts = normalized.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return Array.from(parts[0] ?? '')
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?';
  }

  return parts
    .slice(0, 2)
    .map((part) => Array.from(part)[0] ?? '')
    .join('')
    .toUpperCase() || '?';
}

export function Avatar({
  src,
  name = 'Пользователь',
  size = 'md',
  className,
}: AvatarProps) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  const normalizedName = name.trim() || 'Пользователь';
  const showFallback = !src || error;
  const initials = getInitials(normalizedName);
  const background = fallbackColorFor(normalizedName);

  return (
    <div
      className={[
        'relative inline-flex shrink-0 overflow-hidden rounded-full',
        SIZE_CLASSES[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      role="img"
      aria-label={normalizedName}
    >
      {showFallback ? (
        <div
          className={[
            'flex h-full w-full items-center justify-center rounded-full',
            'text-xs font-semibold leading-none text-white',
            background,
          ].join(' ')}
          aria-hidden="true"
        >
          {initials}
        </div>
      ) : (
        <img
          src={src}
          alt=""
          className="h-full w-full rounded-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}
