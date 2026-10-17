
import { useState } from 'react';

import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { useInstanceUiStore } from '@/entities/instance/model/instance';
import { useIsMobile } from '@/shared/lib/useIsMobile';
import { Avatar } from '@/shared/ui/Avatar';
import { Button } from '@/shared/ui/Button';
import { MobileDrawer } from '@/shared/ui/MobileDrawer';

interface HeaderProps {
  onLogout: () => void;
  onThemeToggle: () => void;
  status: string;
  statusLabel: string;
}

type StatusStyle = {
  text: string;
  dot: string;
};

const DEFAULT_STATUS_STYLE: StatusStyle = {
  text: 'text-ga-text dark:text-ga-darkTextSecondary',
  dot: 'bg-gray-400',
};

const STATUS_STYLES: Record<string, StatusStyle> = {
  authorized: {
    text: 'text-ga-primary dark:text-ga-darkPrimary',
    dot: 'bg-ga-primary',
  },
  notAuthorized: {
    text: 'text-ga-danger dark:text-ga-darkDanger',
    dot: 'bg-ga-danger',
  },
  starting: {
    text: 'text-ga-starting dark:text-ga-darkStarting',
    dot: 'bg-ga-starting',
  },
  blocked: {
    text: 'text-ga-blocked dark:text-ga-darkBlocked',
    dot: 'bg-ga-danger',
  },
  sleepMode: {
    text: 'text-ga-warning dark:text-ga-darkWarning',
    dot: 'bg-ga-warning',
  },
};

function getStatusStyle(status: string): StatusStyle {
  return STATUS_STYLES[status] ?? DEFAULT_STATUS_STYLE;
}

function MenuIcon() {
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
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

function ThemeIcon({ dark }: { dark: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      {dark ? (
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
        <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z" />
      )}
    </svg>
  );
}

export function Header({
  onLogout,
  onThemeToggle,
  status,
  statusLabel,
}: HeaderProps) {
  const credentials = useCredentialsStore((state) => state.credentials);
  const theme = useInstanceUiStore((state) => state.theme);
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const statusStyle = getStatusStyle(status);

  return (
    <>
      <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between gap-3 border-b border-ga-border bg-ga-bg/95 px-3 py-3 backdrop-blur-md dark:border-ga-darkBorder dark:bg-ga-darkBg/95 sm:px-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <img
            src="/assets/green-api.svg"
            alt="GREEN-API"
            className="h-7 w-auto shrink-0"
          />

          <span className="min-w-0 truncate text-base font-bold tracking-tight text-ga-text dark:text-ga-darkText sm:text-lg">
            GREEN-API Chat
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div
            className="hidden items-center gap-2 text-sm md:flex"
            role="status"
            aria-label={`Статус подключения: ${statusLabel}`}
          >
            <span className={`font-medium ${statusStyle.text}`}>
              {statusLabel}
            </span>

            <span
              className={`h-2.5 w-2.5 rounded-full ${statusStyle.dot}`}
              aria-hidden="true"
            />
          </div>

          {credentials && (
            <div className="hidden min-w-0 items-center gap-2 border-l border-ga-border pl-3 dark:border-ga-darkBorder md:flex">
              <div className="min-w-0 text-right">
                <p
                  className="max-w-36 truncate text-sm font-medium text-ga-text dark:text-ga-darkText"
                  title={credentials.idInstance}
                >
                  {credentials.messenger == 'whatsapp' ? 'WhatsApp' : credentials.messenger == 'telegram' ? 'Telegram' : credentials.messenger == 'max' ? 'Max' : credentials.messenger}
                </p>
              </div>

              <Avatar
                src={credentials.avatarUrl ?? undefined}
                name={credentials.idInstance}
                size="md"
              />
            </div>
          )}

          <div className="hidden items-center gap-2 md:flex">
            <Button
              variant="outline"
              size="sm"
              onClick={onThemeToggle}
              aria-label={
                theme === 'light'
                  ? 'Переключить на тёмную тему'
                  : 'Переключить на светлую тему'
              }
              title={
                theme === 'light'
                  ? 'Тёмная тема'
                  : 'Светлая тема'
              }
            >
              <ThemeIcon dark={theme === 'dark'} />
            </Button>

            <Button variant="danger" size="sm" onClick={onLogout}>
              Выйти
            </Button>
          </div>

          {isMobile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDrawerOpen(true)}
              aria-label="Открыть меню"
              aria-expanded={drawerOpen}
            >
              <MenuIcon />
            </Button>
          )}
        </div>
      </header>

      {isMobile && (
        <MobileDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          onThemeToggle={onThemeToggle}
          onLogout={onLogout}
        />
      )}
    </>
  );
}
