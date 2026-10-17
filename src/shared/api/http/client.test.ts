import { describe, expect, it } from 'vitest';
import { ApiError, isQuotaExceededError } from '@/shared/api/http/client';

describe('ApiError retry classification', () => {
  it('marks rate limits and server errors as retryable', () => {
    expect(new ApiError('rate limited', 429).retryable).toBe(true);
    expect(new ApiError('server error', 500).retryable).toBe(true);
    expect(new ApiError('bad gateway', 502).retryable).toBe(true);
  });

  it('does not retry client errors and quota limits', () => {
    expect(new ApiError('bad request', 400).retryable).toBe(false);
    expect(new ApiError('unauthorized', 401).retryable).toBe(false);
    expect(new ApiError('not found', 404).retryable).toBe(false);
    expect(new ApiError('quota', 466).retryable).toBe(false);
  });

  it('detects the developer tariff quota error', () => {
    expect(isQuotaExceededError(new ApiError('quota', 466))).toBe(true);
    expect(isQuotaExceededError(new ApiError('rate limited', 429))).toBe(false);
    expect(isQuotaExceededError(new Error('other'))).toBe(false);
  });
});
