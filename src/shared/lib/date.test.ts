import { describe, expect, it } from 'vitest';
import { formatRelativeDate, formatTime } from './date';

describe('formatTime', () => {
  it('returns empty string for falsy timestamp', () => {
    expect(formatTime(0)).toBe('');
  });

  it('formats timestamp in seconds', () => {
    expect(formatTime(1_700_000_000)).toMatch(/\d{1,2}:\d{2}/);
  });
});

describe('formatRelativeDate', () => {
  const now = new Date(2026, 0, 15, 12, 0, 0);
  const atNoon = (year: number, month: number, day: number) =>
    Math.floor(new Date(year, month, day, 12, 0, 0).getTime() / 1000);

  it('returns empty string for falsy timestamp', () => {
    expect(formatRelativeDate(0, now)).toBe('');
  });

  it('labels today as Сегодня', () => {
    expect(formatRelativeDate(atNoon(2026, 0, 15), now)).toBe('Сегодня');
  });

  it('labels yesterday as Вчера', () => {
    expect(formatRelativeDate(atNoon(2026, 0, 14), now)).toBe('Вчера');
  });

  it('labels the day before yesterday as Позавчера', () => {
    expect(formatRelativeDate(atNoon(2026, 0, 13), now)).toBe('Позавчера');
  });

  it('uses a numeric date for older messages', () => {
    const label = formatRelativeDate(atNoon(2026, 0, 10), now);
    expect(label).not.toBe('Сегодня');
    expect(label).not.toBe('Вчера');
    expect(label).not.toBe('Позавчера');
    expect(label).toContain('2026');
  });

  it('supports millisecond timestamps', () => {
    const ms = new Date(2026, 0, 15, 12, 0, 0).getTime();
    expect(formatRelativeDate(ms, now)).toBe('Сегодня');
  });
});
