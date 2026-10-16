export function createTempId(): string {
  return `temp-${crypto.randomUUID()}`;
}
