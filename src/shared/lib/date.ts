export function formatTime(timestamp: number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp < 10_000_000_000 ? timestamp * 1000 : timestamp);
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(timestamp: number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp < 10_000_000_000 ? timestamp * 1000 : timestamp);
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatRelativeDate(timestamp: number, now: Date = new Date()): string {
  if (!timestamp) return '';

  const date = new Date(timestamp < 10_000_000_000 ? timestamp * 1000 : timestamp);
  const diffDays = Math.round(
    (startOfDay(now).getTime() - startOfDay(date).getTime()) / 86_400_000,
  );

  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return 'Вчера';
  if (diffDays === 2) return 'Позавчера';

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const WEEKDAY_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export function formatChatListTimestamp(timestamp: number, now: Date = new Date()): string {
  if (!timestamp) return '';

  const date = new Date(timestamp < 10_000_000_000 ? timestamp * 1000 : timestamp);
  const diffDays = Math.round(
    (startOfDay(now).getTime() - startOfDay(date).getTime()) / 86_400_000,
  );

  if (diffDays === 0) {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Вчера';
  if (diffDays > 1 && diffDays < 7) return WEEKDAY_SHORT[date.getDay()] ?? '';

  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}
