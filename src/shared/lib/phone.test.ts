import { describe, expect, it } from 'vitest';
import {
  isValidPhone,
  isPhoneLikeTitle,
  maskPhone,
  normalizePhone,
  formatPhone,
} from './phone';

describe('phone helpers', () => {
  it('normalizes phone numbers', () => {
    expect(normalizePhone('+7 (999) 123-45-67')).toBe('79991234567');
  });

  it('validates 11-12 digit phones only', () => {
    expect(isValidPhone('79991234567')).toBe(true);
    expect(isValidPhone('123')).toBe(false);
  });

  it('validates international 12-digit phone (e.g. Turkey +90)', () => {
    expect(isValidPhone('+905338298328')).toBe(true);
    expect(isValidPhone('+905338298')).toBe(false);
  });

  it('formats Russian phone with mask', () => {
    expect(formatPhone('79991234567')).toBe('+7 (999) 123-45-67');
  });

  it('formats international phone with plus', () => {
    expect(formatPhone('905338298328')).toBe('+905338298328');
  });

  it('detects phone-like titles only', () => {
    expect(isPhoneLikeTitle('+79991234567')).toBe(true);
    expect(isPhoneLikeTitle('+7 (999) 123-45-67')).toBe(true);
    expect(isPhoneLikeTitle('Иван')).toBe(false);
    expect(isPhoneLikeTitle('79991234567@c.us')).toBe(false);
    expect(isPhoneLikeTitle('12345')).toBe(false);
  });

  it('masks phone numbers', () => {
    expect(maskPhone('79991234567')).toBe('+7 (•••) •••-••-67');
    expect(maskPhone('905338298328')).toBe('+••••••••••28');
  });
});
