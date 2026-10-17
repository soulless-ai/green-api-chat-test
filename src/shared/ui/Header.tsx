import { useState } from 'react';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { useInstanceUiStore } from '@/entities/instance/model/instance';
import { useIsMobile } from '@/shared/lib/useIsMobile';
import { Avatar } from '@/shared/ui/Avatar';
import { MobileDrawer } from '@/shared/ui/MobileDrawer';
import { Button } from '@/shared/ui/Button';


interface HeaderProps {
  onToggleSidebar: () => void;
  onLogout: () => void;
  onThemeToggle: () => void;
  status: string;
  statusLabel: string;
}

export function Header({ onToggleSidebar, onLogout, onThemeToggle, status, statusLabel }: HeaderProps) {
  const credentials = useCredentialsStore((state) => state.credentials);
  const theme = useInstanceUiStore((state) => state.theme);
  const setTheme = useInstanceUiStore((state) => state.setTheme);
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const statusColors: Record<string, { text: string; bg: string }> = {
    authorized: { text: 'text-ga-primary dark:text-ga-darkPrimary', bg: 'bg-ga-authorizedBg dark:bg-ga-darkAuthorizedBg' },
    notAuthorized: { text: 'text-ga-danger dark:text-ga-darkDanger', bg: 'bg-ga-notAuthorizedBg dark:bg-ga-darkNotAuthorizedBg' },
    starting: { text: 'text-ga-starting dark:text-ga-darkStarting', bg: 'bg-ga-starting dark:bg-ga-darkStarting' },
    blocked: { text: 'text-ga-blocked dark:text-ga-darkBlocked', bg: 'bg-ga-blocked dark:bg-ga-darkBlocked' },
    sleepMode: { text: 'text-ga-warning dark:text-ga-darkWarning', bg: 'bg-ga-warning dark:bg-ga-darkWarning' },
    unknown: { text: 'text-ga-text dark:text-ga-darkText-secondary', bg: 'bg-ga-dark-border' },
  };

  const statusColor = statusColors[status] ?? statusColors.unknown ?? { text: 'text-ga-text dark:text-ga-darkText-secondary', bg: 'bg-ga-dark-border' };

  return (
    <nav className="bg-white/95 dark:bg-ga-darkBg/95 backdrop-blur-md border-b border-ga-border dark:border-ga-darkBorder px-4 py-3.5 flex items-center justify-between z-40 sticky top-0" aria-label="Основная навигация">
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleSidebar}
          className="p-2.5 text-ga-text dark:text-ga-darkText hover:bg-ga-border/50 dark:hover:bg-ga-darkBorder/50 rounded-lg transition-colors"
          aria-label="Открыть навигацию"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2 cursor-pointer select-none">
          {isMobile ? (
            <img src="/assets/green-api.svg" alt="GREEN-API" className="h-8 w-auto" />
          ) : null}
          <span className="text-lg font-bold tracking-tight text-ga-text dark:text-ga-darkText select-none">
            GREEN-API Chat
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2.5 text-sm">
          <span className={`font-medium ${statusColor.text}`}>{statusLabel}</span>
          <span className={`px-2 py-0.5 rounded ${statusColor.bg}`}>●</span>
        </div>

        {credentials ? (
          <div className="hidden md:flex flex-col items-end">
            <div className="text-right">
              <div className="text-sm font-medium text-ga-text dark:text-ga-darkText">{credentials.idInstance}</div>
              <Avatar
                src={credentials.avatarUrl ?? undefined}
                name={credentials.idInstance}
                size="md"
                className="mt-1 cursor-pointer"
              />
            </div>
          </div>
        ) : null}

        {isMobile ? (
          <div className="relative z-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDrawerOpen(true)}
              aria-label="Навигация"
              aria-expanded={drawerOpen}
              className="z-50"
            >
              <svg className="w-6 h-6 z-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Button>
            <MobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} onToggleSidebar={onToggleSidebar} />
          </div>
        ) : null}

        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onThemeToggle}
            aria-label={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
            title={theme === 'light' ? 'Переключить на тёмную тему' : 'Переключить на светлую тему'}
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 3c4.981 0 9.046 4.057 9.046 9.046s-4.065 9.046-9.046 9.046" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </Button>
          <Button variant="danger" size="sm" onClick={onLogout}>
            Выйти
          </Button>
        </div>
      </div>
    </nav>
  );
}
