
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { useInstanceUiStore } from '@/entities/instance/model/instance';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';

interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onThemeToggle: () => void;
  onLogout: () => void;
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0 text-ga-primary"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10.5L12 3l9 7.5M5 9v11h14V9M9 20v-6h6v6"
      />
    </svg>
  );
}

function ContactsIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0 text-ga-primary"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 20H7m10 0v-2a5 5 0 00-10 0v2m10 0h5v-2a3 3 0 00-5.36-1.86M7 20H2v-2a3 3 0 015.36-1.86M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function ThemeIcon({ dark }: { dark: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0 text-ga-primary"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
    >
      {dark ? (
        // Солнце — переключение на светлую тему
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.42 1.42" />
          <path d="m17.65 17.65 1.42 1.42" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.35 17.65-1.42 1.42" />
          <path d="m19.07 4.93-1.42 1.42" />
        </>
      ) : (
        // Луна — переключение на тёмную тему
        <path
          d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z"
        />
      )}
    </svg>
  );
}

export function MobileDrawer({
  open,
  onOpenChange,
  onThemeToggle,
  onLogout,
}: MobileDrawerProps) {
  const navigate = useNavigate();
  const theme = useInstanceUiStore((state) => state.theme);
  const setSidebarOpen = useInstanceUiStore((state) => state.setSidebarOpen);
  const credentials = useCredentialsStore((state) => state.credentials);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onOpenChange]);

  const close = () => onOpenChange(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    close();
  };

  if (!open) return null;

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="fixed inset-0 z-50 cursor-default bg-black/50 backdrop-blur-sm"
        onClick={close}
        aria-label="Закрыть меню"
        tabIndex={-1}
      />

      <aside
        className="fixed inset-y-0 right-0 z-[60] flex w-[min(88vw,24rem)] flex-col border-l border-ga-border bg-ga-bg shadow-2xl dark:border-ga-darkBorder dark:bg-ga-darkPanel motion-safe:animate-in motion-safe:slide-in-from-right motion-safe:duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="Мобильное меню"
      >
        <div className="flex min-h-16 items-center justify-between border-b border-ga-border px-5 py-4 dark:border-ga-darkBorder">
          <h2 className="text-lg font-bold text-ga-text dark:text-ga-darkText">
            Меню
          </h2>

          <button
            type="button"
            onClick={close}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-ga-text transition-colors hover:bg-ga-border/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ga-primary dark:text-ga-darkText dark:hover:bg-ga-darkBorder/50"
            aria-label="Закрыть меню"
            autoFocus
          >
            <CloseIcon />
          </button>
        </div>

        {credentials && (
          <div className="border-b border-ga-border p-5 dark:border-ga-darkBorder">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar
                src={credentials.avatarUrl ?? undefined}
                name={credentials.idInstance}
                size="lg"
              />

              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-base font-semibold text-ga-text dark:text-ga-darkText"
                  title={credentials.idInstance}
                >
                  {credentials.idInstance}
                </p>

                <p className="mt-1 truncate text-xs text-ga-textSecondary dark:text-ga-darkTextSecondary">
                  {credentials.messenger}
                </p>
              </div>
            </div>
          </div>
        )}

        <nav
          className="flex-1 space-y-1 overflow-y-auto p-4"
          aria-label="Меню приложения"
        >
          <Button
            variant="ghost"
            size="md"
            onClick={() => {
              setSidebarOpen(true);
              navigate('/chats');
              close();
            }}
            className="w-full justify-start gap-3 px-4 py-3 text-left"
          >
            <HomeIcon />
            Чаты
          </Button>

          <Button
            variant="ghost"
            size="md"
            onClick={() => handleNavigation('/contacts')}
            className="w-full justify-start gap-3 px-4 py-3 text-left"
          >
            <ContactsIcon />
            Контакты
          </Button>

          <div className="my-3 border-t border-ga-border dark:border-ga-darkBorder" />

          <Button
            variant="ghost"
            size="md"
            onClick={() => {
              close();
              onThemeToggle();
            }}
            className="w-full justify-start gap-3 px-4 py-3 text-left"
          >
            <ThemeIcon dark={theme === 'dark'} />
            {theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
          </Button>

          <Button
            variant="danger"
            size="md"
            onClick={() => {
              close();
              onLogout();
            }}
            className="w-full justify-start gap-3 px-4 py-3 text-left"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Выйти
          </Button>
        </nav>

        <footer className="border-t border-ga-border px-5 py-4 dark:border-ga-darkBorder">
          <div className="flex items-center gap-2">
            <img
              src="/assets/green-api.svg"
              alt=""
              className="h-5 w-auto"
            />
            <span className="text-sm font-medium text-ga-textSecondary dark:text-ga-darkTextSecondary">
              GREEN-API Chat
            </span>
          </div>
        </footer>
      </aside>
    </div>
  );
}
