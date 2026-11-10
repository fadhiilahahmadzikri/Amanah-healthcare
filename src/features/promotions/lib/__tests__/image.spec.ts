import { describe, expect, it } from 'bun:test';
import { isAllowedPromoHost, normalizeImageInput } from '../image';

describe('normalizeImageInput', () => {
  it('normalizes Google Drive /file/d/<ID>/view links to thumbnail endpoint', () => {
    const input = 'https://drive.google.com/file/d/1a2b3c4d5e6f/view?usp=sharing';
    const result = normalizeImageInput(input);
    expect(result.value).toBe(
      'https://drive.google.com/thumbnail?id=1a2b3c4d5e6f&sz=w1600',
    );
    expect(result.isDiscord).toBe(false);
    expect(result.error).toBeUndefined();
  });

  it('normalizes Google Drive open?id=<ID> links', () => {
    const input = 'https://drive.google.com/open?id=1a2b3c4d5e6f';
    const result = normalizeImageInput(input);
    expect(result.value).toBe(
      'https://drive.google.com/thumbnail?id=1a2b3c4d5e6f&sz=w1600',
    );
  });

  it('normalizes Google Drive uc?export=view&id=<ID> links', () => {
    const input = 'https://drive.google.com/uc?export=view&id=1a2b3c4d5e6f';
    const result = normalizeImageInput(input);
    expect(result.value).toBe(
      'https://drive.google.com/thumbnail?id=1a2b3c4d5e6f&sz=w1600',
    );
  });

  it('detects Discord attachment URLs and parses ex timestamp', () => {
    // ex=6731e840 is 1731323968 in seconds
    const input =
      'https://cdn.discordapp.com/attachments/123/456/banner.webp?ex=6731e840&is=673096c0&hm=abcdef';
    const result = normalizeImageInput(input);
    expect(result.isDiscord).toBe(true);
    expect(result.discordExpiresAt).toBeInstanceOf(Date);
    expect(result.discordExpiresAt?.getTime()).toBe(0x6731e840 * 1000);
  });

  it('preserves static paths starting with /promo/', () => {
    const input = '/promo/dental-nov-2026.webp';
    const result = normalizeImageInput(input);
    expect(result.value).toBe('/promo/dental-nov-2026.webp');
    expect(result.isDiscord).toBe(false);
  });

  it('rejects http:, data:, javascript:, and blob: schemes with error message', () => {
    expect(normalizeImageInput('http://example.com/banner.png').error).toBeTruthy();
    expect(normalizeImageInput('data:image/png;base64,...').error).toBeTruthy();
    expect(normalizeImageInput('javascript:alert(1)').error).toBeTruthy();
    expect(normalizeImageInput('blob:http://localhost/123').error).toBeTruthy();
  });
});

describe('isAllowedPromoHost', () => {
  it('allows drive.google.com and googleusercontent', () => {
    expect(isAllowedPromoHost('drive.google.com')).toBe(true);
    expect(isAllowedPromoHost('lh3.googleusercontent.com')).toBe(true);
  });

  it('allows discord hosts', () => {
    expect(isAllowedPromoHost('cdn.discordapp.com')).toBe(true);
    expect(isAllowedPromoHost('media.discordapp.net')).toBe(true);
  });

  it('rejects unknown third-party hosts', () => {
    expect(isAllowedPromoHost('evil-site.com')).toBe(false);
  });
});
