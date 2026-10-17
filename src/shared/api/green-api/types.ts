import type { MessengerId } from '@/shared/types/messenger';

export interface GreenApiCredentials {
  idInstance: string;
  apiTokenInstance: string;
  apiUrl?: string;
  messenger: MessengerId;
  avatarUrl?: string | null;
}

export type InstanceState = 'authorized' | 'notAuthorized' | 'starting' | 'blocked' | 'sleepMode' | 'unknown';

export interface CheckAccountResponse {
  exist: boolean;
  chatId: string;
  fromCache: boolean;
  status?: boolean;
  reason?: string;
}

export interface CheckWhatsappResponse {
  existsWhatsapp: boolean;
  chatId?: string;
  username?: string;
  phoneNumber?: string;
  fromCache?: boolean;
  status?: boolean;
  reason?: string;
}

export interface SendMessageResponse {
  idMessage: string;
}

export interface ChatSummary {
  id: string;
  name?: string;
  type?: string;
  unreadCount?: number;
  archive?: boolean;
  newChatId?: string;
  ephemeralExpiration?: number;
  ephemeralSettingTimestamp?: number;
}

export interface GetAvatarResponse {
  urlAvatar?: string;
}

export interface Contact {
  chatId: string;
  id?: string;
  name?: string;
  contactName?: string;
  type?: string;
  newChatId?: string;
  phoneNumber?: number;
}

export interface GetContactInfoResponse {
  chatId: string;
  name?: string;
  contactName?: string;
  email?: string;
  chatType?: string;
  avatar?: string;
  base64Avatar?: string;
  lastSeen?: number | null;
  phoneNumber?: string | number;
  isArchive?: boolean;
  isDisappearing?: boolean;
  isMute?: boolean;
  isBusiness?: boolean;
  description?: string;
  category?: string;
}

export interface SendTypingResponse {
  success?: boolean;
}

export interface ReadChatResponse {
  success?: boolean;
}

export interface DeleteMessageResponse {
  success?: boolean;
}

export interface SendFileByUploadResponse {
  idMessage: string;
}

export interface AccountSettings {
  idInstance?: string;
  wid?: string;
  stateInstance?: string;
  chatId?: string;
  phoneNumber?: string;
  name?: string;
  avatar?: string;
  about?: string;
  isBusiness?: boolean;
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
  stanzaId?: string;
  deletedMessageData?: { stanzaId?: string };
  editedMessageData?: { stanzaId?: string; textMessage?: string };
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
  chatId?: string;
  status?: string;
  statusData?: { status?: string; idMessage?: string };
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
    deletedMessageData?: { stanzaId?: string };
    editedMessageData?: { stanzaId?: string; textMessage?: string };
  };
  deletedMessageData?: { stanzaId?: string };
  editedMessageData?: { stanzaId?: string; textMessage?: string };
}

export interface ApiError extends Error {
  status: number;
  code?: string;
}
