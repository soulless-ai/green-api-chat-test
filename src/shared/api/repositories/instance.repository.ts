import type { GreenApiHttpClient } from '@/shared/api/http/client';
import type {
  AccountSettings,
  InstanceState,
} from '@/shared/api/green-api/types';

export async function getStateInstance(
  client: GreenApiHttpClient,
): Promise<InstanceState> {
  const data = await client.request<{ stateInstance?: string }>(
    'GET',
    'getStateInstance',
  );

  const state = data?.stateInstance;

  if (
    state === 'authorized' ||
    state === 'notAuthorized' ||
    state === 'starting' ||
    state === 'blocked' ||
    state === 'sleepMode'
  ) {
    return state;
  }

  return 'unknown';
}

export async function setHttpApiSettings(
  client: GreenApiHttpClient,
): Promise<void> {
  await client.request('POST', 'setSettings', {
    body: JSON.stringify({
      webhookUrl: '',
      incomingWebhook: 'yes',
      outgoingWebhook: 'yes',
      stateWebhook: 'yes',
    }),
  });
}

export async function getAccountSettings(
  client: GreenApiHttpClient,
): Promise<AccountSettings | null> {
  const data = await client.request<AccountSettings>(
    'GET',
    'getAccountSettings',
  );

  return data ?? null;
}

export async function getWaSettings(
  client: GreenApiHttpClient,
): Promise<AccountSettings | null> {
  const data = await client.request<AccountSettings>('GET', 'getWaSettings');
  return data ?? null;
}

export async function getTgSettings(
  client: GreenApiHttpClient,
): Promise<AccountSettings | null> {
  const data = await client.request<AccountSettings>('GET', 'getTgSettings');
  return data ?? null;
}

export async function getMaxSettings(
  client: GreenApiHttpClient,
): Promise<AccountSettings | null> {
  const data = await client.request<AccountSettings>('GET', 'getMaxSettings');
  return data ?? null;
}

function isNotFoundError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const value = error as {
    status?: number;
    statusCode?: number;
    response?: { status?: number };
  };

  return (
    value.status === 404 ||
    value.statusCode === 404 ||
    value.response?.status === 404
  );
}

type Messenger = 'whatsapp' | 'telegram' | 'max';

export async function getMessengerSettings(
  client: GreenApiHttpClient,
  messenger: Messenger | string,
): Promise<AccountSettings | null> {
  const getSettings =
    messenger === 'telegram'
      ? getTgSettings
      : messenger === 'max'
        ? getMaxSettings
        : getWaSettings;

  try {
    return await getSettings(client);
  } catch (error) {
    if (!isNotFoundError(error)) {
      throw error;
    }

    return getAccountSettings(client);
  }
}