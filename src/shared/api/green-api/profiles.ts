import type { MessengerId, MessengerProfile } from '@/shared/types/messenger';

const normalizePhone = (phone: string) => phone.replace(/\D/g, '');

export const messengerProfiles: Record<MessengerId, MessengerProfile> = {
  whatsapp: {
    id: 'whatsapp',
    label: 'WhatsApp',
    messageMaxLength: 4096,
    phoneLengths: [11, 12],
    normalizePhone,
  },
  max: {
    id: 'max',
    label: 'MAX',
    messageMaxLength: 4000,
    phoneLengths: [11, 12],
    normalizePhone,
  },
  telegram: {
    id: 'telegram',
    label: 'Telegram',
    messageMaxLength: 4096,
    phoneLengths: [11, 12],
    normalizePhone,
  },
};
