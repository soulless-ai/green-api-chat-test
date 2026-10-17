import { createContext, useCallback, useContext, useMemo, useState } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextValue {
  show: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_TYPE_CLASSES: Record<Toast['type'], string> = {
  success: 'bg-ga-primary',
  error: 'bg-ga-danger',
  info: 'bg-ga-darkBorder',
};

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error('ToastProvider is missing');
  return value;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4000);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-full left-0 mb-2 z-[100] flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto max-w-xs rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-lg ${TOAST_TYPE_CLASSES[toast.type]} rounded-xl border border-ga-border bg-ga-bg p-3 shadow-lg dark:border-ga-darkBorder dark:bg-ga-darkPanel`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
