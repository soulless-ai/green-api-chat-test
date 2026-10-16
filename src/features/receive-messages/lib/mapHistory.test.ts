import { describe, expect, it } from 'vitest';
import { mapHistoryItem } from './mapHistory';

describe('mapHistoryItem', () => {
  it('maps history text item', () => {
    const result = mapHistoryItem({
      type: 'outgoing',
      idMessage: '1',
      timestamp: 1000,
      typeMessage: 'textMessage',
      chatId: 'chat',
      textMessage: 'hello',
      statusMessage: 'delivered',
    });
    expect(result?.direction).toBe('out');
    expect(result?.status).toBe('delivered');
  });
});
