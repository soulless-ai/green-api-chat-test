import { describe, expect, it } from 'vitest';
import { limitMethod } from '@/shared/api/http/rateLimiter';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('limitMethod', () => {
  it('runs tasks for the same method sequentially', async () => {
    const order: string[] = [];

    const tasks = ['a', 'b', 'c'].map((label) =>
      limitMethod('getAvatar', '1', async () => {
        order.push(`start:${label}`);
        await delay(5);
        order.push(`end:${label}`);
        return label;
      }),
    );

    const results = await Promise.all(tasks);

    expect(results).toEqual(['a', 'b', 'c']);
    expect(order).toEqual([
      'start:a',
      'end:a',
      'start:b',
      'end:b',
      'start:c',
      'end:c',
    ]);
  });

  it('keeps independent queues per method', async () => {
    const order: string[] = [];

    await Promise.all([
      limitMethod('getAvatar', '1', async () => {
        await delay(30);
        order.push('avatar');
      }),
      limitMethod('sendMessage', '1', async () => {
        order.push('message');
      }),
    ]);

    expect(order).toEqual(['message', 'avatar']);
  });
});
