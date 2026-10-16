export type MessengerId = 'whatsapp' | 'max' | 'telegram';

export interface MessengerProfile {
  id: MessengerId;
  label: string;
  messageMaxLength: number;
  phoneLengths: number[];
  normalizePhone(phone: string): string;
}
