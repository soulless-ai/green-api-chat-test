export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function formatPhone(phone: string): string {
  const digits = normalizePhone(phone);
  if (!digits) return '';
  if (digits.startsWith('7') && digits.length === 11) {
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  }
  return `+${digits}`;
}

export function isPhoneLikeTitle(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return /^\+?[\d\s()-]+$/.test(trimmed) && normalizePhone(trimmed).length >= 7;
}

export function maskPhone(phone: string): string {
  const digits = normalizePhone(phone);
  if (digits.startsWith('7') && digits.length === 11) {
    return `+7 (•••) •••-••-${digits.slice(-2)}`;
  }
  if (digits.length <= 2) return '+••••••••••';
  return `+${'•'.repeat(digits.length - 2)}${digits.slice(-2)}`;
}

export function isValidPhone(phone: string, minDigits = 11, maxDigits = 12): boolean {
  const digits = normalizePhone(phone);
  return digits.length >= minDigits && digits.length <= maxDigits;
}
