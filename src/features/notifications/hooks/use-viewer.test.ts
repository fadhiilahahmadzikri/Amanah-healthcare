import { describe, expect, it } from 'bun:test';
import { useViewer } from './use-viewer';

describe('useViewer', () => {
  it('is a callable hook function', () => {
    expect(typeof useViewer).toBe('function');
  });
});
