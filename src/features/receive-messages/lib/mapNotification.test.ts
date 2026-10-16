import { describe, expect, it } from 'vitest';
import { mapNotificationToMessage } from './mapNotification';

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
