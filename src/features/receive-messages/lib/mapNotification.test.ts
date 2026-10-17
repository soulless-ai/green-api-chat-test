import { describe, expect, it } from 'vitest';
import { mapNotificationToMessage, mapOutgoingStatusNotification } from './mapNotification';

describe('mapNotificationToMessage', () => {
  it('maps incoming text notification', () => {
    const result = mapNotificationToMessage({
      typeWebhook: 'incomingMessageReceived',
      timestamp: 1000,
      idMessage: '1',
      senderData: { chatId: 'chat', senderName: 'Alice' },
      messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: 'hi' } },
    });
    expect(result?.direction).toBe('in');
    expect(result?.text).toBe('hi');
  });

  it('ignores non-text notifications', () => {
    const result = mapNotificationToMessage({
      typeWebhook: 'incomingMessageReceived',
      timestamp: 1000,
      senderData: { chatId: 'chat' },
      messageData: { typeMessage: 'imageMessage' },
    });
    expect(result).toBeNull();
  });
});

describe('mapOutgoingStatusNotification', () => {
  it('reads top-level chatId and status', () => {
    const result = mapOutgoingStatusNotification({
      typeWebhook: 'outgoingMessageStatus',
      chatId: '79991234567@c.us',
      idMessage: 'ABC123',
      status: 'read',
    });
    expect(result).toEqual({
      chatId: '79991234567@c.us',
      idMessage: 'ABC123',
      status: 'read',
    });
  });

  it('maps every GREEN-API status', () => {
    const statuses: Array<[string, string]> = [
      ['sent', 'sent'],
      ['delivered', 'delivered'],
      ['read', 'read'],
      ['failed', 'failed'],
      ['noAccount', 'failed'],
    ];

    statuses.forEach(([raw, expected]) => {
      expect(
        mapOutgoingStatusNotification({
          typeWebhook: 'outgoingMessageStatus',
          chatId: 'chat',
          idMessage: '1',
          status: raw,
        })?.status,
      ).toBe(expected);
    });
  });

  it('ignores notifications without chatId or idMessage', () => {
    expect(
      mapOutgoingStatusNotification({
        typeWebhook: 'outgoingMessageStatus',
        idMessage: '1',
        status: 'read',
      }),
    ).toBeNull();
  });

  it('ignores other webhook types', () => {
    expect(
      mapOutgoingStatusNotification({
        typeWebhook: 'incomingMessageReceived',
        chatId: 'chat',
        idMessage: '1',
        status: 'read',
      }),
    ).toBeNull();
  });
});
