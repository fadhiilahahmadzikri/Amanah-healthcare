import { describe, it, expect, mock } from 'bun:test';

mock.module('server-only', () => ({}));

const { deleteAccountResponseDtoSchema } = await import('./auth.dto');

describe('Delete Account Response Contract', () => {
  it('validates 200 OK delete account response with full details', () => {
    const payload = {
      success: true,
      message:
        'Akun dan seluruh data pengguna terkait telah berhasil dihapus secara permanen dari sistem.',
      purgedAt: '2026-09-19T16:49:55.692Z',
      details: {
        userId: '558ffd6a-fc0b-49d2-8b03-021e5606b708',
        email: 'pasien@amanah.health'
      }
    };

    const parsed = deleteAccountResponseDtoSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.success).toBe(true);
      expect(parsed.data.purgedAt).toBe('2026-09-19T16:49:55.692Z');
      expect(parsed.data.details?.userId).toBe('558ffd6a-fc0b-49d2-8b03-021e5606b708');
      expect(parsed.data.details?.email).toBe('pasien@amanah.health');
    }
  });

  it('validates 200 OK delete account response without optional details', () => {
    const payload = {
      success: true,
      message: 'Akun berhasil dihapus.',
      purgedAt: '2026-09-19T17:00:00.000Z'
    };

    const parsed = deleteAccountResponseDtoSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.success).toBe(true);
      expect(parsed.data.details).toBeUndefined();
    }
  });

  it('rejects invalid payload missing required fields', () => {
    const payload = {
      success: true
      // missing message and purgedAt
    };

    const parsed = deleteAccountResponseDtoSchema.safeParse(payload);
    expect(parsed.success).toBe(false);
  });
});
