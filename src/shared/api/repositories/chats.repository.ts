import type { GreenApiHttpClient } from '@/shared/api/http/client';
import type { CheckAccountResponse, ChatHistoryItem, ChatSummary, GetAvatarResponse, SendFileByUploadResponse } from '@/shared/api/green-api/types';

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

export async function getChats(client: GreenApiHttpClient, count?: number): Promise<ChatSummary[]> {
  const result = await client.request<ChatSummary[]>('GET', 'getChats', {}, count ? { count } : undefined);
  return Array.isArray(result) ? result : [];
}

export async function getAvatar(client: GreenApiHttpClient, chatId: string): Promise<GetAvatarResponse | null> {
  const result = await client.request<GetAvatarResponse>('POST', 'getAvatar', {
    body: JSON.stringify({ chatId }),
  });
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

export async function sendFileByUpload(
  client: GreenApiHttpClient,
  chatId: string,
  file: File,
  caption?: string,
): Promise<SendFileByUploadResponse> {
  const credentials = client.credentials();
  const formData = new FormData();
  formData.append('chatId', chatId);
  formData.append('file', file);
  if (caption) formData.append('caption', caption);
  if (file.name) formData.append('fileName', file.name);

  const url = `${client.baseUrl()}/waInstance${credentials.idInstance}/sendFileByUpload/${credentials.apiTokenInstance}`;
  const response = await fetch(url, { method: 'POST', body: formData });
  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : null;
  if (!response.ok) {
    const code = typeof data === 'object' && data !== null ? String((data as Record<string, unknown>).error ?? '') : undefined;
    throw new Error(response.statusText || 'Request failed', { cause: { status: response.status, code, raw: data } });
  }
  return (data as SendFileByUploadResponse) ?? { idMessage: '' };
}
