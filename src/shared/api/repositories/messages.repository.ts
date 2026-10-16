import type { GreenApiHttpClient } from '@/shared/api/http/client';
import type { SendMessageResponse } from '@/shared/api/green-api/types';

export async function sendMessage(client: GreenApiHttpClient, chatId: string, message: string): Promise<SendMessageResponse> {
  return (await client.request<SendMessageResponse>('POST', 'sendMessage', {
    body: JSON.stringify({ chatId, message }),
  })) as SendMessageResponse;
}
