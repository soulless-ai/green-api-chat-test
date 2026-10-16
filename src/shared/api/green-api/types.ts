import type { MessengerId } from '@/shared/types/messenger';

export interface GreenApiCredentials {
  idInstance: string;
  apiTokenInstance: string;
  apiUrl?: string;
  messenger: MessengerId;
}

export type InstanceState = 'authorized' | 'notAuthorized' | 'starting' | 'blocked' | 'sleepMode' | 'unknown';

export interface CheckAccountResponse {
  exist: boolean;
  chatId: string;
  fromCache: boolean;
  status?: boolean;
  reason?: string;
}

export interface SendMessageResponse {
  idMessage: string;
}

export interface ChatHistoryItem {
  type: 'incoming' | 'outgoing';
  idMessage: string;
  timestamp: number;
  typeMessage: string;
  chatId: string;
  textMessage?: string;
  extendedTextMessage?: { text?: string };
  senderName?: string;
  senderContactName?: string;
  statusMessage?: string;
  sendByApi?: boolean;
}

export interface ReceiveNotificationResponse {
  receiptId: number;
  body: GreenApiNotification;
}

export interface GreenApiNotification {
  typeWebhook: string;
  instanceData?: { idInstance?: number; wid?: string };
  timestamp?: number;
  idMessage?: string;
  senderData?: {
    chatId?: string;
    chatName?: string;
    sender?: string;
    senderName?: string;
    senderContactName?: string;
    senderPhoneNumber?: number;
  };
  messageData?: {
    typeMessage?: string;
    textMessageData?: { textMessage?: string };
    extendedTextMessageData?: { text?: string };
  };
}

export interface ApiError extends Error {
  status: number;
  code?: string;
}
