import { describe, expect, it } from 'bun:test';
import { formatWibPeriod, getPromoStatus } from '../schedule';

describe('getPromoStatus', () => {
  const baseNow = new Date('2026-11-10T12:00:00Z');

  it('returns archived if deletedAt is present', () => {
    const status = getPromoStatus(
      {
        isPublished: true,
        deletedAt: '2026-11-09T00:00:00Z',
      },
      baseNow,
    );
    expect(status).toBe('archived');
  });

  it('returns draft if not published', () => {
    const status = getPromoStatus(
      {
        isPublished: false,
      },
      baseNow,
    );
    expect(status).toBe('draft');
  });

  it('returns scheduled if startsAt is in the future', () => {
    const status = getPromoStatus(
      {
        isPublished: true,
        startsAt: '2026-11-11T00:00:00Z',
      },
      baseNow,
    );
    expect(status).toBe('scheduled');
  });

  it('returns expired if endsAt is in the past', () => {
    const status = getPromoStatus(
      {
        isPublished: true,
        startsAt: '2026-11-01T00:00:00Z',
        endsAt: '2026-11-09T00:00:00Z',
      },
      baseNow,
    );
    expect(status).toBe('expired');
  });

  it('returns live when within active window', () => {
    const status = getPromoStatus(
      {
        isPublished: true,
        startsAt: '2026-11-01T00:00:00Z',
        endsAt: '2026-11-20T00:00:00Z',
      },
      baseNow,
    );
    expect(status).toBe('live');
  });

  it('returns live when startsAt and endsAt are null', () => {
    const status = getPromoStatus(
      {
        isPublished: true,
      },
      baseNow,
    );
    expect(status).toBe('live');
  });
});

describe('formatWibPeriod', () => {
  it('formats period with WIB indicator', () => {
    const text = formatWibPeriod(
      '2026-11-01T00:00:00Z',
      '2026-11-30T23:59:59Z',
    );
    expect(text).toContain('WIB');
  });

  it('formats open-ended promos cleanly', () => {
    expect(formatWibPeriod(null, null)).toBe(
      'Tanpa batas waktu (Selalu Tayang)',
    );
  });
});
