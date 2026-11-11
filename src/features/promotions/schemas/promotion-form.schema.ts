import { z } from 'zod';

export const PromotionFormSchema = z
  .object({
    serviceId: z.string().uuid('ID layanan harus berupa UUID yang valid').nullable().optional(),
    title: z
      .string()
      .trim()
      .min(1, 'Judul promosi wajib diisi')
      .max(80, 'Judul promosi maksimal 80 karakter'),
    summary: z
      .string()
      .trim()
      .min(1, 'Ringkasan promosi wajib diisi')
      .max(160, 'Ringkasan promosi maksimal 160 karakter'),
    body: z
      .string()
      .trim()
      .max(1000, 'Detail promosi maksimal 1000 karakter')
      .nullable()
      .optional(),
    terms: z
      .string()
      .trim()
      .max(500, 'Syarat & ketentuan maksimal 500 karakter')
      .nullable()
      .optional(),
    imageType: z.enum(['static', 'url']),
    imageValue: z
      .string()
      .trim()
      .min(1, 'Gambar promosi wajib dipilih atau diisi')
      .max(2048, 'Nilai gambar maksimal 2048 karakter'),
    imageAlt: z
      .string()
      .trim()
      .min(1, 'Teks alternatif gambar wajib diisi')
      .max(150, 'Teks alternatif maksimal 150 karakter'),
    ctaType: z.enum(['none', 'whatsapp', 'custom']).default('whatsapp'),
    ctaLabel: z
      .string()
      .trim()
      .max(30, 'Label tombol maksimal 30 karakter')
      .nullable()
      .optional(),
    ctaUrl: z
      .string()
      .trim()
      .max(2048, 'URL tujuan maksimal 2048 karakter')
      .nullable()
      .optional(),
    showBanner: z.boolean().default(true),
    showModal: z.boolean().default(false),
    showSection: z.boolean().default(true),
    modalFrequency: z
      .enum(['once_per_session', 'once_per_day', 'once_per_week'])
      .default('once_per_day'),
    modalDelaySec: z.number().int().min(0).max(30).default(3),
    modalMode: z.enum(['card', 'image_only']).default('card'),
    priority: z.number().int().min(0, 'Prioritas minimal 0').default(0),
    isPublished: z.boolean().default(false),
    startsAt: z.string().nullable().optional(),
    endsAt: z.string().nullable().optional(),
    broadcastToUsers: z.boolean().default(false),
    broadcastInApp: z.boolean().default(true),
    broadcastPush: z.boolean().default(true),
  })
  .refine(
    (data) => {
      return data.showBanner || data.showModal || data.showSection;
    },
    {
      message: 'Setidaknya satu penempatan (Banner, Modal, atau Section) wajib diaktifkan',
      path: ['showBanner'],
    }
  )
  .refine(
    (data) => {
      if (data.ctaType === 'none') return true;
      const hasLabel = Boolean(data.ctaLabel && data.ctaLabel.trim());
      const hasUrl = Boolean(data.ctaUrl && data.ctaUrl.trim());
      return hasLabel && hasUrl;
    },
    {
      message: 'Label tombol dan tautan tujuan wajib diisi untuk jenis tombol aktif',
      path: ['ctaUrl'],
    }
  )
  .refine(
    (data) => {
      if (data.startsAt && data.endsAt) {
        return new Date(data.endsAt).getTime() >= new Date(data.startsAt).getTime();
      }
      return true;
    },
    {
      message: 'Tanggal selesai tayang tidak boleh lebih awal dari tanggal mulai',
      path: ['endsAt'],
    }
  );

export type PromotionFormData = z.infer<typeof PromotionFormSchema>;
