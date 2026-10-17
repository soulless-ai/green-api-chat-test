const COOLDOWN_MS = 120000;

let exceeded = false;
let cooldownTimer: number | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

export function markQuotaExceeded(): void {
  if (!exceeded) {
    exceeded = true;
    emit();
  }

  if (cooldownTimer !== null) window.clearTimeout(cooldownTimer);

  cooldownTimer = window.setTimeout(() => {
    exceeded = false;
    cooldownTimer = null;
    emit();
  }, COOLDOWN_MS);
}

export function isQuotaExceeded(): boolean {
  return exceeded;
}

export function subscribeQuota(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
