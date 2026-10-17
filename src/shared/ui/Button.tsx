import { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: 'primary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-ga-primary text-white hover:bg-brand-600 active:bg-brand-700 disabled:opacity-60 disabled:pointer-events-none',
  danger:
    'bg-ga-danger dark:bg-ga-darkDanger text-white hover:bg-d1242f/90 active:bg-d1242f disabled:opacity-60 disabled:pointer-events-none',
  ghost:
    'bg-transparent text-ga-text dark:text-ga-darkText hover:bg-ga-border/50 dark:hover:bg-ga-darkBorder/50 active:bg-ga-border dark:active:bg-ga-darkBorder disabled:opacity-60 disabled:pointer-events-none',
  outline:
    'border border-ga-border dark:border-ga-darkBorder text-ga-text dark:text-ga-darkText bg-transparent hover:bg-ga-border/50 dark:hover:bg-ga-darkBorder/50 disabled:opacity-60 disabled:pointer-events-none',
};

const SIZE_CLASSES: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-3 text-base font-medium',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  loading,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`inline-flex items-center rounded-xl font-medium transition-colors ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className ?? ''}`}
      {...props}
    >
      {loading ? (
        <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : null}
      {children}
    </button>
  );
}
