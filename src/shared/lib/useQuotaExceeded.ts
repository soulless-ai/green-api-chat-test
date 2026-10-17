import { useSyncExternalStore } from 'react';
import { isQuotaExceeded, subscribeQuota } from '@/shared/api/http/quota';

export function useQuotaExceeded(): boolean {
  return useSyncExternalStore(subscribeQuota, isQuotaExceeded, isQuotaExceeded);
}
