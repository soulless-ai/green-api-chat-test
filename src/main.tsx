import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App';
import { ToastProvider } from '@/shared/ui/toast/ToastProvider';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, staleTime: 10000, refetchOnWindowFocus: false },
  },
});

const savedTheme = localStorage.getItem('green-api-ui-theme');
const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
if (isDark) {
  document.documentElement.setAttribute('data-theme', 'dark');
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.setAttribute('data-theme', 'light');
  document.documentElement.classList.remove('dark');
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          <App />
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
