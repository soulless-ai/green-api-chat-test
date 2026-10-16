import { describe, expect, it } from 'vitest';
import { isValidPhone, normalizePhone } from './phone';

describe('phone helpers', () => {
  it('normalizes phone numbers', () => {
    expect(normalizePhone('+7 (999) 123-45-67')).toBe('79991234567');
  });

  it('validates 11-12 digit phones only', () => {
    expect(isValidPhone('79991234567')).toBe(true);
    expect(isValidPhone('123')).toBe(false);
  });
});
