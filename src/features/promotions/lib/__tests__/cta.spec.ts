import { describe, expect, it } from 'bun:test';
import { buildPromoWhatsAppUrl, isSafeHref } from '../cta';

describe('isSafeHref', () => {
  it('allows safe relative paths', () => {
    expect(isSafeHref('/booking')).toBe(true);
    expect(isSafeHref('/layanan/usg')).toBe(true);
  });

  it('allows safe HTTPS URLs', () => {
    expect(isSafeHref('https://wa.me/6281392456664')).toBe(true);
    expect(isSafeHref('https://example.com/promo')).toBe(true);
  });

  it('allows safe telephone links', () => {
    expect(isSafeHref('tel:+6281392456664')).toBe(true);
  });

  it('rejects dangerous protocols', () => {
    expect(isSafeHref('javascript:alert(1)')).toBe(false);
    expect(isSafeHref('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isSafeHref('//evil.com')).toBe(false);
    expect(isSafeHref('')).toBe(false);
    expect(isSafeHref(null)).toBe(false);
  });
});

describe('buildPromoWhatsAppUrl', () => {
  it('constructs wa.me URL with phone and message payload', () => {
    const url = buildPromoWhatsAppUrl('081392456664', 'Halo saya mau tanya promo');
    expect(url).toContain('https://wa.me/081392456664');
    expect(url).toContain('text=Halo%20saya%20mau%20tanya%20promo');
  });
});
