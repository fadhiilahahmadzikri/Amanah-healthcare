import { describe, expect, it } from 'bun:test';
import { PromotionFormSchema } from '../promotion-form.schema';

describe('PromotionFormSchema', () => {
  const validData = {
    title: 'Paket Medical Check-Up Spesial',
    summary: 'Pemeriksaan kesehatan menyeluruh dengan harga terjangkau.',
    imageType: 'static' as const,
    imageValue: '/promo/pemeriksaan-dokter-umum.webp',
    imageAlt: 'Medical Check-Up',
    ctaType: 'whatsapp' as const,
    ctaLabel: 'Konsultasi WhatsApp',
    ctaUrl: 'https://wa.me/6281234567890',
    showBanner: true,
    showModal: false,
    showSection: true,
    modalFrequency: 'once_per_day' as const,
    modalDelaySec: 3,
    priority: 10,
    isPublished: true,
    startsAt: '2026-11-01T00:00:00.000Z',
    endsAt: '2026-12-31T23:59:59.000Z',
  };

  it('validates a correct promotion payload successfully', () => {
    const result = PromotionFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    const result = PromotionFormSchema.safeParse({
      ...validData,
      title: '   ',
    });
    expect(result.success).toBe(false);
  });

  it('rejects title longer than 80 characters (aligned with backend)', () => {
    const result = PromotionFormSchema.safeParse({
      ...validData,
      title: 'A'.repeat(81),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('maksimal 80 karakter');
    }
  });

  it('rejects summary longer than 160 characters (aligned with backend)', () => {
    const result = PromotionFormSchema.safeParse({
      ...validData,
      summary: 'B'.repeat(161),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('maksimal 160 karakter');
    }
  });

  it('rejects when no placement is selected', () => {
    const result = PromotionFormSchema.safeParse({
      ...validData,
      showBanner: false,
      showModal: false,
      showSection: false,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('Setidaknya satu penempatan');
    }
  });

  it('rejects when endsAt is earlier than startsAt', () => {
    const result = PromotionFormSchema.safeParse({
      ...validData,
      startsAt: '2026-12-31T00:00:00.000Z',
      endsAt: '2026-11-01T00:00:00.000Z',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('tidak boleh lebih awal');
    }
  });

  it('allows ctaType none without ctaLabel or ctaUrl', () => {
    const result = PromotionFormSchema.safeParse({
      ...validData,
      ctaType: 'none',
      ctaLabel: null,
      ctaUrl: null,
    });
    expect(result.success).toBe(true);
  });
});
