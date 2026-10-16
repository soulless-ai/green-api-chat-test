import type { GreenApiHttpClient } from '@/shared/api/http/client';
import type { Contact, GetContactInfoResponse } from '@/shared/api/green-api/types';

export async function getContacts(client: GreenApiHttpClient): Promise<Contact[]> {
  const result = await client.request<Contact[]>('GET', 'getContacts');
  return Array.isArray(result) ? result : [];
}

export async function getContactInfo(client: GreenApiHttpClient, chatId: string): Promise<GetContactInfoResponse | null> {
  const result = await client.request<GetContactInfoResponse>('POST', 'getContactInfo', {
    body: JSON.stringify({ chatId }),
  });
  return result ?? null;
}
