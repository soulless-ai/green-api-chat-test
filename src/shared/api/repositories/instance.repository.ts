import type { GreenApiHttpClient } from '@/shared/api/http/client';
import type { AccountSettings, InstanceState } from '@/shared/api/green-api/types';

export async function getStateInstance(client: GreenApiHttpClient): Promise<InstanceState> {
  const data = await client.request<{ stateInstance?: string }>('GET', 'getStateInstance');
  const state = data?.stateInstance;
  if (state === 'authorized' || state === 'notAuthorized' || state === 'starting' || state === 'blocked' || state === 'sleepMode') {
    return state;
  }
  return 'unknown';
}

export async function setHttpApiSettings(client: GreenApiHttpClient): Promise<void> {
  await client.request('POST', 'setSettings', {
    body: JSON.stringify({
      webhookUrl: '',
      incomingWebhook: 'yes',
      outgoingWebhook: 'yes',
      stateWebhook: 'yes',
    }),
  });
}

export async function getAccountSettings(client: GreenApiHttpClient): Promise<AccountSettings | null> {
  const data = await client.request<AccountSettings>('GET', 'getAccountSettings');
  return data ?? null;
}
