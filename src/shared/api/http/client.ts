import type { GreenApiCredentials } from '@/shared/api/green-api/types';
import { env } from '@/shared/config/env';

export class ApiError extends Error {
  status: number;
  code?: string;
  raw?: unknown;

  constructor(message: string, status: number, code?: string, raw?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.raw = raw;
  }
}

export class GreenApiHttpClient {
  constructor(private readonly getCredentials: () => GreenApiCredentials | null) {}

  credentials(): GreenApiCredentials {
    const credentials = this.getCredentials();
    if (!credentials) throw new ApiError('Credentials are not configured', 401);
    return credentials;
  }

  baseUrl(): string {
    const credentials = this.credentials();
    return (credentials.apiUrl ?? env.greenApiBaseUrl).replace(/\/$/, '');
  }

  private url(method: string, query?: Record<string, string | number>, trailing?: string): string {
    const credentials = this.credentials();
    const base = this.baseUrl();
    const pathname = `${base}/waInstance${credentials.idInstance}/${method}/${credentials.apiTokenInstance}${trailing ? `/${trailing}` : ''}`;
    if (!query || Object.keys(query).length === 0) return pathname;
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => params.set(key, String(value)));
    return `${pathname}?${params.toString()}`;
  }

  async request<T>(method: string, apiMethod: string, init: RequestInit = {}, query?: Record<string, string | number>, trailing?: string): Promise<T | null> {
    const url = this.url(apiMethod, query, trailing);
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 30000);
      try {
        const response = await fetch(url, {
          ...init,
          method,
          headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
          signal: controller.signal,
        });

        if (response.status === 204) return null;

        const text = await response.text();
        const data = text ? (JSON.parse(text) as unknown) : null;

        if (!response.ok) {
          const code = typeof data === 'object' && data !== null ? String((data as Record<string, unknown>).error ?? '') : undefined;
          const shouldRetry =
            (response.status >= 500 || response.status === 429) && attempt < 2;
          if (shouldRetry) {
            await new Promise((resolve) => window.setTimeout(resolve, 500 * 2 ** attempt));
            continue;
          }
          throw new ApiError(response.statusText || 'Request failed', response.status, code, data);
        }

        return data as T;
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.status >= 500 && attempt < 2) {
            lastError = error;
            await new Promise((resolve) => window.setTimeout(resolve, 500 * 2 ** attempt));
            continue;
          }
          throw error;
        }
        lastError = error instanceof DOMException && error.name === 'AbortError'
          ? new ApiError('Request timed out', 408)
          : new ApiError(error instanceof Error ? error.message : 'Network error', 0);
        if (attempt < 2) {
          await new Promise((resolve) => window.setTimeout(resolve, 500 * 2 ** attempt));
          continue;
        }
      } finally {
        window.clearTimeout(timeout);
      }
    }

    throw lastError ?? new ApiError('Request failed', 0);
  }
}
