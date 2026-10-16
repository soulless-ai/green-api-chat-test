import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface InstanceUiState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useInstanceUiStore = create<InstanceUiState>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
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
