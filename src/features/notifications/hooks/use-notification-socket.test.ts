import { describe, expect, it } from 'bun:test';
import { useNotificationSocket } from './use-notification-socket';

describe('useNotificationSocket', () => {
  it('is a callable hook function', () => {
    expect(typeof useNotificationSocket).toBe('function');
  });
});
