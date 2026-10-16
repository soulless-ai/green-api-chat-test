import { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
};

export function Avatar({ src, name = 'User', size = 'md', className }: AvatarProps) {
  const [error, setError] = useState(false);
  const showFallback = !src || error;

  const initials = (name ?? 'User')
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  const bgColor = 'bg-ga-primary';
  const textColor = 'text-white';

  return (
    <div
      className={`relative flex-shrink-0 ${SIZE_CLASSES[size]} ${className}`}
      aria-label={name}
    >
      {showFallback ? (
        <div className="flex items-center justify-center rounded-full overflow-hidden">
          <div className={`w-full h-full flex items-center justify-center rounded-full ${bgColor} ${textColor} text-xs font-semibold leading-none`}>
            {initials || '?'}
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
