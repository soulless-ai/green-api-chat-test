import type { GreenApiHttpClient } from '@/shared/api/http/client';
import type { GreenApiNotification, ReceiveNotificationResponse } from '@/shared/api/green-api/types';

export async function receiveNotification(client: GreenApiHttpClient, receiveTimeout: number): Promise<ReceiveNotificationResponse | null> {
  const result = await client.request<ReceiveNotificationResponse>('GET', 'receiveNotification', {}, { receiveTimeout });
  if (!result || typeof (result as ReceiveNotificationResponse).receiptId !== 'number') return null;
  return result as ReceiveNotificationResponse;
}

export async function deleteNotification(client: GreenApiHttpClient, receiptId: number): Promise<void> {
  await client.request('DELETE', 'deleteNotification', {}, {}, String(receiptId));
}
