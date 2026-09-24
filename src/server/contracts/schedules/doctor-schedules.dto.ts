import { z } from 'zod';

export const scheduleDayStatusSchema = z.enum(['Buka', 'Terisi', 'Penuh', 'Cuti', 'Tutup']).or(z.string());
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
  ruang: z.string().optional(),
  is_reschedule_eligible: z.boolean().optional(),
  reschedule_ineligibility_reason: z.string().nullable().optional()
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

export const timelineIntervalSchema = z.object({
  intervalIndex: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  status: z.enum(['OPEN', 'OCCUPIED', 'CLOSED']).or(z.string()),
  displayLabel: z.string(),
  isOccupied: z.boolean(),
  appointmentRef: z
    .object({
      appointmentId: z.string(),
      queueNumber: z.union([z.number(), z.string()]),
      status: z.string()
    })
    .nullable()
    .optional(),
  closedReason: z.string().nullable().optional()
});
export type TimelineInterval = z.infer<typeof timelineIntervalSchema>;

export const adminDoctorScheduleDetailResponseSchema = z.object({
  success: z.boolean(),
  data: doctorScheduleItemSchema.extend({
    monthly_schedule: z.array(monthlyScheduleDaySchema).optional(),
    timeline_intervals: z.array(timelineIntervalSchema).optional()
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

export const updateAdminDoctorSessionPayloadSchema = z.object({
  nama_sesi: z.string().optional(),
  jam_mulai: z.string().optional(),
  jam_selesai: z.string().optional(),
  kuota_pasien: z.number().optional(),
  slot_tersedia: z.number().optional(),
  status_sesi: z.string().optional(),
  ruang: z.string().optional()
});
export type UpdateAdminDoctorSessionPayload = z.infer<
  typeof updateAdminDoctorSessionPayloadSchema
>;

/**
 * @deprecated Sesi jadwal dokter dilarang dihapus oleh admin (403 ADMIN_SCHEDULE_DELETION_PROHIBITED).
 * Gunakan ubah status sesi (Tutup/Cuti) atau reschedule.
 */
export const deleteAdminDoctorSessionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z
    .object({
      sessionId: z.string()
    })
    .optional()
});
export type DeleteAdminDoctorSessionResponse = z.infer<
  typeof deleteAdminDoctorSessionResponseSchema
>;

export const rescheduleAdminDoctorSessionPayloadSchema = z.object({
  targetDate: z.string(),
  targetStartTime: z.string(),
  targetScheduleContextId: z.string().optional(),
  targetRoomId: z.string().optional(),
  notes: z.string().optional(),
  reason: z.string().optional(),
  rescheduleActiveAppointments: z.boolean().optional().default(true)
});
export type RescheduleAdminDoctorSessionPayload = z.input<
  typeof rescheduleAdminDoctorSessionPayloadSchema
>;

export const rescheduleAdminDoctorSessionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional()
});
export type RescheduleAdminDoctorSessionResponse = z.infer<
  typeof rescheduleAdminDoctorSessionResponseSchema
>;

export const rescheduleEligibilityResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    isEligible: z.boolean(),
    actionableGuidance: z.string().nullable().optional(),
    targetValidation: z
      .object({
        isTargetEligible: z.boolean().optional(),
        conflictMessage: z.string().nullable().optional(),
        projectedEndTime: z.string().nullable().optional()
      })
      .optional()
  })
});
export type RescheduleEligibilityResponse = z.infer<
  typeof rescheduleEligibilityResponseSchema
>;

export const updateAdminDayByDatePayloadSchema = z.object({
  status: z.enum(['Buka', 'Tutup']).or(z.string()),
  notes: z.string().optional()
});
export type UpdateAdminDayByDatePayload = z.infer<
  typeof updateAdminDayByDatePayloadSchema
>;

export const updateAdminDayByDateResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z
    .object({
      date: z.string(),
      status: z.string(),
      notes: z.string().nullable().optional(),
      affectedSessionsCount: z.number().optional(),
      cancelledAppointmentsCount: z.number().optional()
    })
    .optional()
});
export type UpdateAdminDayByDateResponse = z.infer<
  typeof updateAdminDayByDateResponseSchema
>;

export const updateAdminDoctorDurationPayloadSchema = z.object({
  consultationDurationMinutes: z.number().min(5).max(240),
  startPrecisionMinutes: z.number().optional().default(1)
});
export type UpdateAdminDoctorDurationPayload = z.input<
  typeof updateAdminDoctorDurationPayloadSchema
>;

export const adminDoctorScheduleFilterOptionsSchema = z.object({
  success: z.boolean(),
  data: z.object({
    poliklinik: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        code: z.string().optional().nullable()
      })
    ),
    spesialisasi: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        code: z.string().optional().nullable()
      })
    ),
    statuses: z.array(
      z.object({
        id: z.string(),
        label: z.string()
      })
    )
  })
});
export type AdminDoctorScheduleFilterOptionsResponse = z.infer<
  typeof adminDoctorScheduleFilterOptionsSchema
>;

export const clinicRoomSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  location: z.string().optional().nullable(),
  floor: z.number().optional().nullable(),
  isOccupied: z.boolean().optional().default(false),
  occupiedBy: z.string().optional().nullable()
});
export type ClinicRoom = z.infer<typeof clinicRoomSchema>;

export const clinicRoomsResponseSchema = z.union([
  z.array(clinicRoomSchema),
  z.object({
    success: z.boolean().optional(),
    data: z.array(clinicRoomSchema)
  }).transform((val) => val.data)
]);
export type ClinicRoomsResponse = ClinicRoom[];

export const occupancySlotSchema = z.object({
  slotIndex: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  timeRange: z.string().optional(),
  isAvailable: z.boolean(),
  status: z.enum(['AVAILABLE', 'OCCUPIED_BY_SELF', 'OCCUPIED_BY_OTHER', 'CLOSED_LEAVE', 'CLOSED']).or(z.string()),
  displayLabel: z.string().optional().default('Tersedia'),
  conflictInfo: z.any().nullable().optional()
});
export type OccupancySlot = z.infer<typeof occupancySlotSchema>;

export const occupancyShiftSchema = z.object({
  contextId: z.string(),
  contextLabel: z.string(),
  sessionShift: z.string().optional(),
  timeRange: z.string(),
  boundaryStartTime: z.string().optional(),
  boundaryEndTime: z.string().optional(),
  totalSlots: z.number(),
  availableSlotsCount: z.number(),
  occupiedSlotsCount: z.number(),
  slots: z.array(occupancySlotSchema)
});
export type OccupancyShift = z.infer<typeof occupancyShiftSchema>;

export const doctorOccupancyOverviewDataSchema = z.object({
  date: z.string(),
  practitionerId: z.string(),
  practitionerName: z.string().optional(),
  effectiveConsultationDurationMinutes: z.number().optional().default(30),
  roomId: z.string().nullable().optional(),
  roomName: z.string().nullable().optional(),
  isCuti: z.boolean().optional().default(false),
  cutiReason: z.string().nullable().optional(),
  summary: z.object({
    totalShifts: z.number(),
    totalSlots: z.number(),
    availableSlots: z.number(),
    occupiedSlots: z.number()
  }).optional(),
  shifts: z.array(occupancyShiftSchema)
});
export type DoctorOccupancyOverviewData = z.infer<typeof doctorOccupancyOverviewDataSchema>;

export const doctorOccupancyOverviewResponseSchema = z.union([
  z.object({
    success: z.boolean().optional(),
    data: doctorOccupancyOverviewDataSchema
  }).transform((val) => val.data),
  doctorOccupancyOverviewDataSchema
]);
export type DoctorOccupancyOverviewResponse = DoctorOccupancyOverviewData;

