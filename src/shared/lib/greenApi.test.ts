import { describe, expect, it } from 'vitest';
import {
  GREEN_API_LEGACY_BASE_URL,
  deriveGreenApiBaseUrl,
  resolveGreenApiBaseUrl,
} from './greenApi';

describe('greenApi url helpers', () => {
  it('derives sharded host from the instance id prefix', () => {
    expect(deriveGreenApiBaseUrl('710722770785')).toBe(
      'https://7107.api.greenapi.com',
    );
  });

  it('falls back to the legacy host for short instance ids', () => {
    expect(deriveGreenApiBaseUrl('123')).toBe(GREEN_API_LEGACY_BASE_URL);
  });

  it('prefers an explicit api url', () => {
    expect(
      resolveGreenApiBaseUrl({
        idInstance: '710722770785',
        apiUrl: 'https://custom.example.com/',
      }),
    ).toBe('https://custom.example.com');
  });

  it('prefers the configured override over the derived host', () => {
    expect(
      resolveGreenApiBaseUrl({
        idInstance: '710722770785',
        override: 'https://override.example.com/',
      }),
    ).toBe('https://override.example.com');
  });

  it('derives the host when no override is configured', () => {
    expect(resolveGreenApiBaseUrl({ idInstance: '710722770785' })).toBe(
      'https://7107.api.greenapi.com',
    );
  });
});
