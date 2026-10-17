import { describe, expect, it } from 'vitest';
import { mapHistoryItem, mergeMessages, collectDeletedHistoryIds } from './mapHistory';
import type { Message } from '@/entities/message/model/message';

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

  it('ignores deleted history entries', () => {
    const result = mapHistoryItem({
      type: 'outgoing',
      idMessage: '9',
      timestamp: 1000,
      typeMessage: 'deletedMessage',
      chatId: 'chat',
      deletedMessageData: { stanzaId: 'original' },
    });
    expect(result).toBeNull();
  });
});

describe('collectDeletedHistoryIds', () => {
  it('collects stanza ids from deleted entries', () => {
    const ids = collectDeletedHistoryIds([
      {
        type: 'outgoing',
        idMessage: '9',
        timestamp: 1000,
        typeMessage: 'deletedMessage',
        chatId: 'chat',
        deletedMessageData: { stanzaId: 'original' },
      },
      {
        type: 'incoming',
        idMessage: '10',
        timestamp: 1000,
        typeMessage: 'textMessage',
        chatId: 'chat',
        textMessage: 'hi',
      },
    ]);

    expect(ids).toEqual(['original']);
  });
});

const message = (overrides: Partial<Message>): Message => ({
  id: '1',
  chatId: 'chat',
  direction: 'out',
  text: 'text',
  timestamp: 1000,
  status: 'sent',
  ...overrides,
});

describe('mergeMessages', () => {
  it('adds history items missing locally', () => {
    const result = mergeMessages(
      [message({ id: '1', timestamp: 1000 })],
      [message({ id: '2', timestamp: 2000, status: 'delivered' })],
    );
    expect(result.map((item) => item.id)).toEqual(['1', '2']);
  });

  it('updates the status of an existing message from history', () => {
    const result = mergeMessages(
      [message({ id: '1', status: 'sent', timestamp: 1000 })],
      [message({ id: '1', status: 'read', timestamp: 1000 })],
    );
    expect(result).toHaveLength(1);
    expect(result[0]?.status).toBe('read');
  });

  it('never downgrades an already higher status', () => {
    const result = mergeMessages(
      [message({ id: '1', status: 'read', timestamp: 1000 })],
      [message({ id: '1', status: 'delivered', timestamp: 1000 })],
    );
    expect(result[0]?.status).toBe('read');
  });

  it('sorts the merged result by timestamp', () => {
    const result = mergeMessages(
      [message({ id: '2', timestamp: 2000 })],
      [message({ id: '1', timestamp: 1000 })],
    );
    expect(result.map((item) => item.id)).toEqual(['1', '2']);
  });

  it('never resurrects a message deleted locally', () => {
    const result = mergeMessages(
      [message({ id: '1', isDeleted: true, text: '' })],
      [message({ id: '1', text: 'secret', status: 'read' })],
    );
    expect(result).toHaveLength(1);
    expect(result[0]?.isDeleted).toBe(true);
    expect(result[0]?.text).toBe('');
  });

  it('tombstones a message when history reports it deleted', () => {
    const result = mergeMessages(
      [message({ id: '1', text: 'secret' })],
      [message({ id: '1', isDeleted: true, text: '' })],
    );
    expect(result[0]?.isDeleted).toBe(true);
    expect(result[0]?.text).toBe('');
  });
});
