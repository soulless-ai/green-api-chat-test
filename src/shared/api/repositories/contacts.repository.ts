import type { GreenApiHttpClient } from '@/shared/api/http/client';
import type { Contact, GetContactInfoResponse } from '@/shared/api/green-api/types';

interface RawContact {
  id?: string | number;
  chatId?: string | number;
  name?: string;
  contactName?: string;
  type?: string;
  newChatId?: string | number;
  number?: string | number;
  phone?: string | number;
  phoneNumber?: number;
}

const CHAT_ID_SUFFIXES = ['@c.us', '@g.us', '@lid', '@s.whatsapp.net'];

function asString(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

function looksLikeChatId(value: string): boolean {
  return CHAT_ID_SUFFIXES.some((suffix) => value.endsWith(suffix));
}

function pickChatId(raw: RawContact): string {
  const direct = asString(raw.chatId) || asString(raw.id) || asString(raw.newChatId);
  if (direct) return direct;

  const alias = asString(raw.number) || asString(raw.phone);
  if (alias) return alias;

  for (const value of Object.values(raw)) {
    const candidate = asString(value);
    if (candidate && looksLikeChatId(candidate)) return candidate;
  }

  return '';
}

function isPhoneChatId(chatId: string): boolean {
  if (chatId.endsWith('@lid') || chatId.endsWith('@g.us')) return false;
  const local = chatId.split('@')[0] ?? '';
  return /^\d+$/.test(local);
}

function normalizeContact(raw: RawContact): Contact | null {
  const chatId = pickChatId(raw);
  if (!chatId) return null;

  const local = chatId.split('@')[0] ?? '';
  const phoneNumber = isPhoneChatId(chatId) ? Number(local) : undefined;

  return {
    chatId,
    id: asString(raw.id) || chatId,
    name: raw.name || undefined,
    contactName: raw.contactName || undefined,
    type: raw.type,
    newChatId: asString(raw.newChatId) || undefined,
    phoneNumber: raw.phoneNumber ?? phoneNumber,
  };
}

export async function getContacts(client: GreenApiHttpClient, count?: number): Promise<Contact[]> {
  const result = await client.request<RawContact[]>('GET', 'getContacts', {}, count ? { count } : undefined);
  if (!Array.isArray(result)) return [];

  const byChatId = new Map<string, Contact>();

  for (const raw of result) {
    const contact = normalizeContact(raw);
    if (!contact) continue;

    const existing = byChatId.get(contact.chatId);

    if (!existing) {
      byChatId.set(contact.chatId, contact);
      continue;
    }

    byChatId.set(contact.chatId, {
      ...existing,
      name: existing.name || contact.name,
      contactName: existing.contactName || contact.contactName,
      phoneNumber: existing.phoneNumber ?? contact.phoneNumber,
      newChatId: existing.newChatId || contact.newChatId,
    });
  }

  return [...byChatId.values()];
}

export async function getContactInfo(client: GreenApiHttpClient, chatId: string): Promise<GetContactInfoResponse | null> {
  const result = await client.request<GetContactInfoResponse>('POST', 'getContactInfo', {
    body: JSON.stringify({ chatId }),
  });
  return result ?? null;
}
