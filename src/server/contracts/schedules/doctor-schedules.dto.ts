import { z } from 'zod';

export const scheduleDayStatusSchema = z.enum(['Buka', 'Penuh', 'Cuti', 'Tutup']);
export type ScheduleDayStatus = z.infer<typeof scheduleDayStatusSchema>;

const avatarSchema = z
  .string()
  .nullish()
  .transform((value) => value ?? '');

export const doctorDailySessionSchema = z.object({
  id: z.string(),
  nama_sesi: z.string(),
  jam_mulai: z.string(),
  jam_selesai: z.string(),
  waktu: z.string().optional(),
  kuota_pasien: z.number(),
  slot_tersedia: z.number(),
  status_sesi: z.string(),
  ruang: z.string().optional()
});
export type DoctorDailySession = z.infer<typeof doctorDailySessionSchema>;

export const monthlyScheduleDaySchema = z.object({
  day: z.number(),
  date: z.string(),
  status: scheduleDayStatusSchema,
  notes: z.string().nullable().optional()
});
export type MonthlyScheduleDay = z.infer<typeof monthlyScheduleDaySchema>;

export const doctorScheduleItemSchema = z.object({
  id: z.string(),
  practitioner_id: z.string().optional(),
  nama_dokter: z.string(),
  spesialisasi: z.string(),
  status_dokter: z.string(),
  email: z.string().nullable().optional(),
  nomor_telepon: z.string().nullable().optional(),
  ruang_praktik: z.string(),
  tanggal_praktik: z.string().optional(),
  avatar: avatarSchema,
  slot_tersedia: z.number(),
  kapasitas_per_hari: z.number(),
  jadwal_hari_ini: z.string().optional().default(''),
  status_jadwal: z.string().optional().default('Buka'),
  bulan_jadwal: z.string().optional(),
  is_cuti: z.boolean(),
  cuti_reason: z.string().nullable().optional(),
  cuti_start: z.string().nullable().optional(),
  cuti_end: z.string().nullable().optional(),
  sesi_harian: z.array(doctorDailySessionSchema).optional()
});
export type DoctorScheduleItem = z.infer<typeof doctorScheduleItemSchema>;

export const adminDoctorScheduleListResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    doctors: z.array(doctorScheduleItemSchema),
    meta: z.object({
      page: z.number(),
      limit: z.number(),
      total_doctors: z.number(),
      total_pages: z.number()
    })
  })
});
export type AdminDoctorScheduleListResponse = z.infer<typeof adminDoctorScheduleListResponseSchema>;

export const adminDoctorScheduleDetailResponseSchema = z.object({
  success: z.boolean(),
  data: doctorScheduleItemSchema.extend({
    monthly_schedule: z.array(monthlyScheduleDaySchema).optional()
  })
});
export type AdminDoctorScheduleDetailResponse = z.infer<
  typeof adminDoctorScheduleDetailResponseSchema
>;

export const updateAdminDoctorSchedulePayloadSchema = z.object({
  is_cuti: z.boolean().optional(),
  cuti_reason: z.string().nullable().optional(),
  cuti_start: z.string().nullable().optional(),
  cuti_end: z.string().nullable().optional(),
  status_dokter: z.string().optional(),
  status_jadwal: z.string().optional(),
  jadwal_hari_ini: z.string().optional(),
  slot_tersedia: z.number().optional(),
  kapasitas_per_hari: z.number().optional(),
  ruang_praktik: z.string().optional(),
  date: z.string().optional()
});
export type UpdateAdminDoctorSchedulePayload = z.infer<
  typeof updateAdminDoctorSchedulePayloadSchema
>;

export const updateAdminDayStatusPayloadSchema = z.object({
  date: z.string(),
  status: scheduleDayStatusSchema,
  reason: z.string().optional()
});
export type UpdateAdminDayStatusPayload = z.infer<typeof updateAdminDayStatusPayloadSchema>;

export const createAdminDoctorSessionPayloadSchema = z.object({
  schedule_date: z.string(),
  nama_sesi: z.string(),
  jam_mulai: z.string(),
  jam_selesai: z.string(),
  kuota_pasien: z.number(),
  slot_tersedia: z.number(),
  status_sesi: z.string(),
  ruang: z.string().optional()
});
export type CreateAdminDoctorSessionPayload = z.infer<typeof createAdminDoctorSessionPayloadSchema>;

export const clinicalPractitionerSchema = z.object({
  id: z.string(),
  name: z.string(),
  spec: z.string(),
  avatar: avatarSchema,
  location: z.string(),
  rating: z.string().optional(),
  tags: z.array(z.string()).optional(),
  schedule: z.string(),
  is_available: z.boolean()
});
export type ClinicalPractitioner = z.infer<typeof clinicalPractitionerSchema>;

export const clinicalPractitionersResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(clinicalPractitionerSchema)
});
export type ClinicalPractitionersResponse = z.infer<typeof clinicalPractitionersResponseSchema>;
