import { useState } from 'react';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { useInstanceUiStore } from '@/entities/instance/model/instance';
import { useIsMobile } from '@/shared/lib/useIsMobile';
import { Avatar } from '@/shared/ui/Avatar';

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
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  const statusColors: Record<string, { text: string; bg: string }> = {
    authorized: { text: 'text-ga-dark-primary', bg: 'bg-ga-dark-authorized-bg' },
    notAuthorized: { text: 'text-ga-dark-danger', bg: 'bg-ga-dark-not-authorized-bg' },
    starting: { text: 'text-ga-dark-starting', bg: 'bg-ga-dark-starting' },
    blocked: { text: 'text-ga-dark-blocked', bg: 'bg-ga-dark-blocked' },
    sleepMode: { text: 'text-ga-dark-warning', bg: 'bg-ga-dark-warning' },
    unknown: { text: 'text-ga-dark-text-secondary', bg: 'bg-ga-dark-border' },
  };

  const statusColor = statusColors[status] ?? statusColors.unknown ?? { text: 'text-ga-dark-text-secondary', bg: 'bg-ga-dark-border' };

  return (
    <header className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border-b border-ga-dark-border px-4 py-2.5 flex items-center justify-between z-20 sticky top-0">
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-ga-dark-text hover:bg-ga-dark-border rounded-lg"
          aria-label="Открыть меню"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {isMobile ? (
          <img
            src="/assets/green-api.svg"
            alt="GREEN-API"
            className="h-8 w-auto"
          />
        ) : (
          <span className="font-semibold tracking-tight text-ga-dark-text">GREEN-API Chat</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 text-xs">
          <span className={`font-medium ${statusColor.text}`}>{statusLabel}</span>
          <span className={`px-1.5 py-0.5 rounded ${statusColor.bg}`}>●</span>
        </div>

        <div className="hidden md:flex flex-col items-end">
          {credentials ? (
            <div className="text-right">
              <div className="text-xs font-medium">{credentials.idInstance}</div>
              <Avatar
                src={credentials.avatarUrl ?? undefined}
                name={credentials.idInstance}
                size="sm"
                className="mt-1"
              />
            </div>
          ) : null}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onThemeToggle}
            className="p-2 text-ga-dark-text hover:bg-ga-dark-border rounded-lg transition-colors"
            aria-label={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
            title={theme === 'light' ? 'Переключить на тёмную тему' : 'Переключить на светлую тему'}
          >
            {theme === 'light' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 3c4.981 0 9.046 4.057 9.046 9.046s-4.065 9.046-9.046 9.046c-2.117 0-4.085-0.758-5.546-1.917" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
          <button
            onClick={onLogout}
            className="text-xs font-medium text-ga-dark-danger hover:text-ga-dark-danger/80 underline"
            aria-label="Выйти"
          >
            Выйти
          </button>
        </div>

        {isMobile ? (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-ga-dark-text hover:bg-ga-dark-border rounded-lg"
              aria-label="Ещё"
              aria-expanded={menuOpen}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1f2223] border border-ga-dark-border rounded-lg shadow-lg py-1 z-50">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onThemeToggle();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-ga-dark-text hover:bg-ga-dark-border"
                >
                  {theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-ga-dark-danger hover:bg-ga-dark-border/50"
                >
                  Выйти
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}
