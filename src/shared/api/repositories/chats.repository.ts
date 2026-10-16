import type { GreenApiHttpClient } from '@/shared/api/http/client';
import type { CheckAccountResponse, ChatHistoryItem, ChatSummary, GetAvatarResponse } from '@/shared/api/green-api/types';

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

export async function getChats(client: GreenApiHttpClient): Promise<ChatSummary[]> {
  const result = await client.request<ChatSummary[]>('GET', 'getChats');
  return Array.isArray(result) ? result : [];
}

export async function getAvatar(client: GreenApiHttpClient, chatId: string): Promise<GetAvatarResponse | null> {
  const result = await client.request<GetAvatarResponse>('GET', 'getAvatar', {}, { chatId });
  return result ?? null;
}

export async function sendTyping(client: GreenApiHttpClient, chatId: string): Promise<boolean> {
  await client.request('POST', 'sendTyping', { body: JSON.stringify({ chatId }) });
  return true;
}

export async function readChat(client: GreenApiHttpClient, chatId: string): Promise<boolean> {
  await client.request('POST', 'readChat', { body: JSON.stringify({ chatId }) });
  return true;
}

export async function deleteMessage(client: GreenApiHttpClient, chatId: string, idMessage: string): Promise<boolean> {
  await client.request('POST', 'deleteMessage', { body: JSON.stringify({ chatId, idMessage }) });
  return true;
}
