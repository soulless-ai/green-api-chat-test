import { ApiError, type GreenApiHttpClient } from '@/shared/api/http/client';
import type { ReceiveNotificationResponse } from '@/shared/api/green-api/types';

const LONG_POLL_EXTRA_TIMEOUT_MS = 15000;

export async function receiveNotification(
  client: GreenApiHttpClient,
  receiveTimeout: number,
): Promise<ReceiveNotificationResponse | null> {
  try {
    const result = await client.request<ReceiveNotificationResponse>(
      'GET',
      'receiveNotification',
      {},
      { receiveTimeout },
      undefined,
      receiveTimeout * 1000 + LONG_POLL_EXTRA_TIMEOUT_MS,
    );

    if (!result || typeof (result as ReceiveNotificationResponse).receiptId !== 'number') {
      return null;
    }

    return result as ReceiveNotificationResponse;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 408 || error.status === 504)) {
      return null;
    }

    throw error;
  }
}

export async function deleteNotification(client: GreenApiHttpClient, receiptId: number): Promise<void> {
  await client.request('DELETE', 'deleteNotification', {}, {}, String(receiptId));
}
