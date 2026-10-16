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
