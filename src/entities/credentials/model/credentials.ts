import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GreenApiCredentials } from '@/shared/api/green-api/types';
import type { MessengerId } from '@/shared/types/messenger';
import { env } from '@/shared/config/env';

interface CredentialsState {
  credentials: GreenApiCredentials | null;
  rememberMe: boolean;
  setCredentials: (credentials: GreenApiCredentials, rememberMe: boolean) => void;
  clear: () => void;
}

export const useCredentialsStore = create<CredentialsState>()(
  persist(
    (set) => ({
      credentials: null,
      rememberMe: false,
      setCredentials: (credentials, rememberMe) => set({ credentials, rememberMe }),
      clear: () => set({ credentials: null, rememberMe: false }),
    }),
    {
      name: 'green-api-credentials',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? window.localStorage : ({} as Storage))),
      partialize: (state) => (state.rememberMe ? state : { ...state, credentials: null }),
    },
  ),
);

export function getDefaultMessenger(): MessengerId {
  const candidate = env.defaultMessenger as MessengerId;
  return candidate === 'whatsapp' || candidate === 'max' || candidate === 'telegram' ? candidate : 'whatsapp';
}
