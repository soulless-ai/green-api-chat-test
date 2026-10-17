
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextValue {
  toasts: Toast[];
  show: (message: string, type?: Toast['type']) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const TOAST_STYLES: Record<Toast['type'], string> = {
  success:
    'border-emerald-500/20 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-200',
  error:
    'border-red-500/20 bg-red-50 text-red-800 dark:bg-red-950/90 dark:text-red-200',
  info:
    'border-ga-border bg-ga-bg text-ga-text dark:border-ga-darkBorder dark:bg-ga-darkPanel dark:text-ga-darkText',
};

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}

export function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef(
    new Map<string, ReturnType<typeof setTimeout>>(),
  );

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);

    if (timer !== undefined) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts((current) =>
      current.filter((toast) => toast.id !== id),
    );
  }, []);

  const show = useCallback(
    (message: string, type: Toast['type'] = 'info') => {
      const id = crypto.randomUUID();

      setToasts((current) => [
        ...current.slice(-3),
        { id, message, type },
      ]);

      const timer = setTimeout(() => {
        dismiss(id);
      }, 4000);

      timersRef.current.set(id, timer);
    },
    [dismiss],
  );

  useEffect(() => {
    const timers = timersRef.current;

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const value = useMemo(
    () => ({ toasts, show, dismiss }),
    [toasts, show, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}
