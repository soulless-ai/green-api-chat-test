import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface InstanceUiState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useInstanceUiStore = create<InstanceUiState>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => {
        set({ theme });
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('green-api-ui-theme', theme);
        }
      },
    }),
    { name: 'green-api-ui', storage: createJSONStorage(() => localStorage) },
  ),
);
