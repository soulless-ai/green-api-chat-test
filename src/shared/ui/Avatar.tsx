import { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-12 h-12',
};

const FALLBACK_COLORS = [
  'bg-ga-primary',
  'bg-brand-600',
  'bg-blue-600',
  'bg-purple-600',
  'bg-pink-600',
  'bg-indigo-600',
];

function fallbackColorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length] as string;
}

export function Avatar({ src, name = 'Пользователь', size = 'md', className }: AvatarProps) {
  const [error, setError] = useState(false);
  const showFallback = !src || error;

  const trimmed = name.trim();
  const isPhone = /^\+?\d{7,}$/.test(trimmed);
  const initials = isPhone
    ? trimmed.slice(-2)
    : trimmed
        .split(' ')
        .map((part) => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('') || trimmed.slice(0, 2).toUpperCase() || '?';

  const textClass = initials.length > 2 ? 'text-[9px] leading-tight' : 'text-xs font-semibold leading-none';

  const wrapperClass = `relative flex-shrink-0 ${SIZE_CLASSES[size]} ${className ?? ''}`;

  return (
    <div className={wrapperClass} aria-label={name}>
      {showFallback ? (
        <div className="w-full h-full flex items-center justify-center rounded-full overflow-hidden">
          <div className={`w-full h-full flex items-center justify-center rounded-full ${fallbackColorFor(trimmed)} text-white ${textClass} line-height-none`}>
            {initials}
          </div>
        </div>
      ) : (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover rounded-full"
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}
