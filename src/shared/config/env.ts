const asNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  greenApiBaseUrl: (import.meta.env.VITE_GREEN_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? 'https://api.green-api.com',
  defaultMessenger: (import.meta.env.VITE_DEFAULT_MESSENGER as string | undefined) ?? 'whatsapp',
  pollReceiveTimeoutSec: asNumber(import.meta.env.VITE_POLL_RECEIVE_TIMEOUT_SEC, 20),
  pollIdleDelayMs: asNumber(import.meta.env.VITE_POLL_IDLE_DELAY_MS, 1000),
  pollBackoffBaseMs: asNumber(import.meta.env.VITE_POLL_BACKOFF_BASE_MS, 2000),
  pollBackoffMaxMs: asNumber(import.meta.env.VITE_POLL_BACKOFF_MAX_MS, 30000),
  historyPageSize: asNumber(import.meta.env.VITE_HISTORY_PAGE_SIZE, 100),
} as const;
