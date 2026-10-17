import type { GreenApiCredentials } from '@/shared/api/green-api/types';
import { env } from '@/shared/config/env';
import { resolveGreenApiBaseUrl } from '@/shared/lib/greenApi';
import { limitMethod } from '@/shared/api/http/rateLimiter';
import { markQuotaExceeded } from '@/shared/api/http/quota';

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 3;
const REQUEST_TIMEOUT_MS = 30000;

export class ApiError extends Error {
  status: number;
  code?: string;
  retryable: boolean;
  raw?: unknown;

  constructor(
    message: string,
    status: number,
    options: { code?: string; retryable?: boolean; raw?: unknown } = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = options.code;
    this.retryable = options.retryable ?? RETRYABLE_STATUSES.has(status);
    this.raw = options.raw;
  }
}

export function isQuotaExceededError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 466;
}

function errorCodeFrom(data: unknown): string | undefined {
  if (typeof data !== 'object' || data === null) return undefined;

  const record = data as Record<string, unknown>;
  const invokeStatus = record.invokeStatus;

  if (typeof invokeStatus === 'object' && invokeStatus !== null) {
    const status = (invokeStatus as Record<string, unknown>).status;
    if (typeof status === 'string') return status;
  }

  const error = record.error;
  if (typeof error === 'string') return error;

  return undefined;
}

function errorMessageFrom(data: unknown, fallback: string): string {
  if (typeof data === 'object' && data !== null) {
    const record = data as Record<string, unknown>;
    const invokeStatus = record.invokeStatus;

    if (typeof invokeStatus === 'object' && invokeStatus !== null) {
      const description = (invokeStatus as Record<string, unknown>).description;
      if (typeof description === 'string' && description.length > 0) {
        return description;
      }
    }
  }

  return fallback;
}

export class GreenApiHttpClient {
  constructor(
    private readonly getCredentials: () => GreenApiCredentials | null,
  ) {}

  credentials(): GreenApiCredentials {
    const credentials = this.getCredentials();
    if (!credentials) throw new ApiError('Укажите данные инстанса', 401);
    return credentials;
  }

  baseUrl(): string {
    const credentials = this.credentials();
    return resolveGreenApiBaseUrl({
      idInstance: credentials.idInstance,
      apiUrl: credentials.apiUrl,
      override: env.greenApiBaseUrlOverride,
    });
  }

  private url(
    method: string,
    query?: Record<string, string | number>,
    trailing?: string,
  ): string {
    const credentials = this.credentials();
    const base = this.baseUrl();
    const pathname = `${base}/waInstance${credentials.idInstance}/${method}/${credentials.apiTokenInstance}${trailing ? `/${trailing}` : ''}`;

    if (!query || Object.keys(query).length === 0) return pathname;

    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) =>
      params.set(key, String(value)),
    );

    return `${pathname}?${params.toString()}`;
  }

  async request<T>(
    method: string,
    apiMethod: string,
    init: RequestInit = {},
    query?: Record<string, string | number>,
    trailing?: string,
    timeoutMs = REQUEST_TIMEOUT_MS,
  ): Promise<T | null> {
    const credentials = this.credentials();
    const url = this.url(apiMethod, query, trailing);
    let lastError: ApiError | null = null;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await limitMethod(apiMethod, credentials.idInstance, () =>
          fetch(url, {
            ...init,
            method,
            headers: {
              'Content-Type': 'application/json',
              ...(init.headers ?? {}),
            },
            signal: controller.signal,
          }),
        );

        if (response.status === 204) return null;

        const text = await response.text();
        const data = text ? (JSON.parse(text) as unknown) : null;

        if (!response.ok) {
          if (response.status === 466) markQuotaExceeded();

          throw new ApiError(errorMessageFrom(data, response.statusText), response.status, {
            code: errorCodeFrom(data),
            raw: data,
          });
        }

        return data as T;
      } catch (error) {
        lastError =
          error instanceof ApiError
            ? error
            : error instanceof DOMException && error.name === 'AbortError'
              ? new ApiError('Превышено время ожидания запроса', 408)
              : new ApiError(
                  error instanceof Error ? error.message : 'Ошибка сети',
                  0,
                );

        if (lastError.retryable && attempt < MAX_ATTEMPTS - 1) {
          await new Promise((resolve) =>
            window.setTimeout(resolve, 1000 * 2 ** attempt),
          );
          continue;
        }

        throw lastError;
      } finally {
        window.clearTimeout(timeout);
      }
    }

    throw lastError;
  }
}
