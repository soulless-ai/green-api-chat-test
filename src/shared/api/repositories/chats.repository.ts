import type { GreenApiHttpClient } from '@/shared/api/http/client';
import type { CheckAccountResponse, ChatHistoryItem } from '@/shared/api/green-api/types';

export async function checkAccount(client: GreenApiHttpClient, phoneNumber: string, force = false): Promise<CheckAccountResponse> {
  return (await client.request<CheckAccountResponse>('POST', 'checkAccount', {
    body: JSON.stringify({ phoneNumber: Number(phoneNumber), force }),
  })) as CheckAccountResponse;
}

export async function getChatHistory(client: GreenApiHttpClient, chatId: string, count: number): Promise<ChatHistoryItem[]> {
  const result = await client.request<ChatHistoryItem[]>('POST', 'getChatHistory', {
    body: JSON.stringify({ chatId, count }),
  });
  return Array.isArray(result) ? result : [];
}
