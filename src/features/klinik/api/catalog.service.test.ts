import { describe, expect, it, beforeEach } from 'bun:test';
import { catalogService } from './catalog.service';

describe('catalogService', () => {
  beforeEach(() => {
    catalogService.clearCache();
  });

  it('initializes with clearCache working properly', () => {
    expect(() => catalogService.clearCache()).not.toThrow();
  });
});
