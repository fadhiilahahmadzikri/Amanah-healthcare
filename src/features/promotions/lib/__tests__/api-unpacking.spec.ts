import { describe, expect, it } from 'bun:test';
import { promotionsApi } from '../../api/promotions.api';

describe('promotionsApi envelope unpacking', () => {
  it('correctly unpacks { data: [...] } envelope from NestJS backend', async () => {
    const mockPromos = [
      {
        id: 'test-1',
        version: '123',
        title: 'Promo Spesial',
        summary: 'Deskripsi promo',
        image: { src: '/promo/usg.webp', alt: 'USG' },
        placements: ['banner', 'section'],
      },
    ];

    // Mock global fetch to return standard NestJS REST envelope { data: [...] }
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => ({
      ok: true,
      json: async () => ({ data: mockPromos }),
    })) as unknown as typeof fetch;

    try {
      const result = await promotionsApi.getPublicPromotions();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('test-1');
      expect(result[0].title).toBe('Promo Spesial');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('correctly handles raw array response if server does not wrap in data envelope', async () => {
    const mockPromos = [
      {
        id: 'test-raw',
        version: '456',
        title: 'Raw Array Promo',
        summary: 'Deskripsi raw array',
        image: { src: '/promo/test.webp', alt: 'Test' },
        placements: ['modal'],
      },
    ];

    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => ({
      ok: true,
      json: async () => mockPromos,
    })) as unknown as typeof fetch;

    try {
      const result = await promotionsApi.getPublicPromotions();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('test-raw');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('gracefully returns empty array on HTTP error or failure', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => ({
      ok: false,
      status: 500,
    })) as unknown as typeof fetch;

    try {
      const result = await promotionsApi.getPublicPromotions();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
