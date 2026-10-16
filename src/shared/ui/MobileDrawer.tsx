import { useNavigate } from 'react-router-dom';
import { useInstanceUiStore } from '@/entities/instance/model/instance';
import { useCredentialsStore } from '@/entities/credentials/model/credentials';
import { Button } from '@/shared/ui/Button';
import { Avatar } from '@/shared/ui/Avatar';

interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleSidebar: () => void;
}

export function MobileDrawer({ open, onOpenChange, onToggleSidebar }: MobileDrawerProps) {
  const navigate = useNavigate();
  const theme = useInstanceUiStore((state) => state.theme);
  const setTheme = useInstanceUiStore((state) => state.setTheme);
  const clearCredentials = useCredentialsStore((state) => state.clear);
  const credentials = useCredentialsStore((state) => state.credentials);

  const handleThemeToggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    onOpenChange(false);
  };

  const handleLogout = () => {
    clearCredentials();
    onOpenChange(false);
  };

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-40 flex flex-col"
          aria-modal="true"
          role="dialog"
          aria-label="Меню"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
          <aside className="relative z-50 w-full md:w-80 bg-white dark:bg-[#1f2223] border-r border-ga-dark-border shadow-2xl flex flex-col transform transition-transform duration-200 -translate-x-full md:translate-x-0 open:translate-x-0">
            <div className="p-5 border-b border-ga-dark-border flex items-center justify-between">
              <h3 className="text-lg font-bold text-ga-dark-text">Меню</h3>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 text-ga-dark-text-secondary hover:text-ga-dark-text rounded hover:bg-ga-dark-border/50"
                aria-label="Закрыть меню"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {credentials ? (
              <div className="p-4 border-b border-ga-dark-border">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar
                    src={credentials.avatarUrl ?? undefined}
                    name={credentials.idInstance}
                    size="md"
                    className="mt-1 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-medium text-ga-dark-text truncate">
                      {credentials.idInstance}
                    </div>
                    <div className="text-xs text-ga-dark-text-secondary">
                      {credentials.messenger}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              <Button
                variant="ghost"
                size="md"
                onClick={() => {
                  onToggleSidebar();
                  onOpenChange(false);
                }}
                className="w-full text-left justify-start"
              >
                <svg className="w-5 h-5 mr-3 text-ga-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Чаты
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={() => {
                  navigate('/contacts');
                  onOpenChange(false);
                }}
                className="w-full text-left justify-start"
              >
                <svg className="w-5 h-5 mr-3 text-ga-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Контакты
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={handleThemeToggle}
                className="w-full text-left justify-start"
              >
                <svg className="w-5 h-5 mr-3 text-ga-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={theme === 'light' ? 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 3c4.981 0 9.046 4.057 9.046 9.046s-4.065 9.046-9.046 9.046' : 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'} />
                </svg>
                {theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleLogout}
                className="w-full text-left justify-start"
              >
                <svg className="w-5 h-5 mr-3 text-ga-dark-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Выйти
              </Button>
            </nav>
            <div className="p-5 border-t border-ga-dark-border text-sm text-ga-dark-text-secondary">
              GREEN-API Chat
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
