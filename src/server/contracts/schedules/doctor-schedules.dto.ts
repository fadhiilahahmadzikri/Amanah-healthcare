import { z } from 'zod';

export const scheduleDayStatusSchema = z.enum(['OPEN', 'CLOSED']);
export type ScheduleDayStatus = z.infer<typeof scheduleDayStatusSchema>;

const avatarSchema = z
  .string()
  .nullish()
  .transform((value) => value ?? '');

export const sessionStatusSchema = z.enum(['OPEN', 'CLOSED']);
export type SessionStatus = z.infer<typeof sessionStatusSchema>;

export const doctorDailySessionSchema = z.object({
  id: z.string(),
  nama_sesi: z.string(),
  jam_mulai: z.string(),
  jam_selesai: z.string(),
  waktu: z.string().optional(),
  pasien_terdaftar: z.number().optional().default(0),
  status_sesi: sessionStatusSchema,
  ruang: z.string().optional(),
  roomId: z.string().optional(),
  ruang_id: z.string().optional()
});
export type DoctorDailySession = z.infer<typeof doctorDailySessionSchema>;

export const monthlyScheduleDaySchema = z.object({
  day: z.number(),
  date: z.string(),
  status: scheduleDayStatusSchema.optional(),
  notes: z.string().nullable().optional()
});
export type MonthlyScheduleDay = z.infer<typeof monthlyScheduleDaySchema>;

export const doctorCardPatientPreviewSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  name: z.string(),
  initials: z.string(),
  avatarUrl: z.string().nullable().optional()
});
export type DoctorCardPatientPreviewItem = z.infer<typeof doctorCardPatientPreviewSchema>;

export const doctorScheduleItemSchema = z.object({
  id: z.string(),
  practitioner_id: z.string().optional(),
  nama_dokter: z.string(),
  spesialisasi: z.string(),
  status_dokter: z.string(),
  email: z.string().nullable().optional(),
  nomor_telepon: z.string().nullable().optional(),
  ruang_praktik: z.string().optional().default(''),
  tanggal_praktik: z.string().optional(),
  avatar: avatarSchema,
  jadwal_hari_ini: z.string().optional().default(''),
  status_jadwal: z.string().optional().default('OPEN'),
  bulan_jadwal: z.string().optional(),
  is_on_leave: z.boolean().optional().default(false),
  leave_reason: z.string().nullable().optional(),
  leave_start: z.string().nullable().optional(),
  leave_end: z.string().nullable().optional(),
  sesi_harian: z.array(doctorDailySessionSchema).optional(),
  jadwal_praktik_mendatang: z.string().optional(),
  total_pasien: z.number().optional().default(0),
  pasien_preview: z.array(doctorCardPatientPreviewSchema).optional().default([])
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

export const closureMetadataSchema = z.object({
  category: z.enum(['LEAVE', 'OTHER']).or(z.string()),
  reasonCode: z.string(),
  reasonText: z.string(),
  sourceType: z.string().optional(),
  sourceId: z.string().optional()
});
export type ClosureMetadata = z.infer<typeof closureMetadataSchema>;

export const shiftOperationalStatusSchema = z.enum([
  'ACTIVE',
  'NO_PRACTICE',
  'CLOSED',
  'isOnLeave'
]);
export type ShiftOperationalStatus = z.infer<typeof shiftOperationalStatusSchema>;

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
  is_on_leave: z.boolean().optional(),
  leave_reason: z.string().nullable().optional(),
  leave_start: z.string().nullable().optional(),
  leave_end: z.string().nullable().optional(),
  status_dokter: z.string().optional(),
  status_jadwal: z.string().optional(),
  jadwal_hari_ini: z.string().optional(),
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
  status_sesi: z.string().optional(),
  ruang: z.string().optional(),
  session: z.enum(['DINI_HARI', 'PAGI', 'SIANG', 'MALAM']).or(z.string()).optional(),
  status: sessionStatusSchema.optional(),
  notes: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  roomId: z.string().optional()
});
export type UpdateAdminDoctorSessionPayload = z.infer<typeof updateAdminDoctorSessionPayloadSchema>;

export const updateAdminDayByDatePayloadSchema = z.object({
  status: sessionStatusSchema,
  notes: z.string().optional()
});
export type UpdateAdminDayByDatePayload = z.infer<typeof updateAdminDayByDatePayloadSchema>;

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
export type UpdateAdminDayByDateResponse = z.infer<typeof updateAdminDayByDateResponseSchema>;

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

export const clinicRoomOccupantDetailsSchema = z.object({
  practitionerId: z.string().optional().nullable(),
  staffProfileId: z.string().optional().nullable(),
  practitionerName: z.string(),
  specialty: z.string().optional().nullable(),
  unitName: z.string().optional().nullable(),
  startTime: z.string(),
  endTime: z.string(),
  roomName: z.string()
});
export type ClinicRoomOccupantDetails = z.infer<typeof clinicRoomOccupantDetailsSchema>;

export const clinicRoomSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  location: z.string().optional().nullable(),
  floor: z.number().optional().nullable(),
  occupantDetails: clinicRoomOccupantDetailsSchema.optional().nullable()
});
export type ClinicRoom = z.infer<typeof clinicRoomSchema>;

export const clinicRoomsResponseSchema = z.union([
  z.array(clinicRoomSchema),
  z
    .object({
      success: z.boolean().optional(),
      data: z.array(clinicRoomSchema)
    })
    .transform((val) => val.data)
]);
export type ClinicRoomsResponse = ClinicRoom[];

// Booked Patient & Session Patients Schemas
export const bookedPatientDemographicsSchema = z.object({
  id: z.string(),
  fullName: z
    .string()
    .nullish()
    .transform((v) => v || 'Pasien'),
  medicalRecordNumber: z
    .string()
    .nullish()
    .transform((v) => v || 'RM-UNKNOWN'),
  nik: z
    .string()
    .nullish()
    .transform((v) => v || ''),
  gender: z
    .string()
    .nullish()
    .transform((v) => v || 'Laki-laki'),
  birthDate: z
    .string()
    .nullish()
    .transform((v) => v || ''),
  age: z
    .string()
    .nullish()
    .transform((v) => v || '-'),
  phoneNumber: z.string().nullish(),
  email: z.string().nullish(),
  address: z.string().nullish(),
  guardianName: z.string().nullish(),
  avatarUrl: z.string().nullish()
});
export type BookedPatientDemographics = z.infer<typeof bookedPatientDemographicsSchema>;

export const bookedPatientBookingMetadataSchema = z.object({
  bookedAt: z.string().nullish(),
  checkedInAt: z.string().nullish(),
  startedAt: z.string().nullish(),
  completedAt: z.string().nullish(),
  cancelledAt: z.string().nullish(),
  cancelReason: z.string().nullish()
});
export type BookedPatientBookingMetadata = z.infer<typeof bookedPatientBookingMetadataSchema>;

export const bookedPatientItemSchema = z.object({
  appointmentId: z.string(),
  appointmentDate: z.string().nullish(),
  queueTicketId: z.string().nullish(),
  queueNumber: z
    .union([z.string(), z.number()])
    .nullish()
    .transform((v) => (v != null ? String(v) : '-')),
  sessionTitle: z.string().nullish(),
  status: z
    .string()
    .nullish()
    .transform((v) => v || 'waiting'),
  statusBadge: z
    .string()
    .nullish()
    .transform((v) => v || 'Menunggu'),
  chiefComplaint: z.string().nullish(),
  clinicRoomName: z
    .string()
    .nullish()
    .transform((v) => v || null),
  roomName: z.string().nullish(),
  roomLocation: z.string().nullish(),
  poliklinikName: z.string().nullish(),
  visitType: z.string().nullish(),
  serviceName: z.string().nullish(),
  isCancellable: z
    .boolean()
    .nullish()
    .transform((v) => v ?? true),
  etaRange: z.string().nullish(),
  estimatedStartAt: z.string().nullish(),
  estimatedEndAt: z.string().nullish(),
  consultationDurationFormatted: z.string().nullish(),
  estimatedDurationMinutes: z.number().nullish(),
  consultationElapsedSeconds: z.number().nullish(),
  patient: bookedPatientDemographicsSchema,
  bookingMetadata: bookedPatientBookingMetadataSchema.optional()
});
export type BookedPatientItem = z.infer<typeof bookedPatientItemSchema>;

export const adminSessionPatientsDataSchema = z.object({
  sessionId: z.string(),
  sessionLabel: z
    .string()
    .nullish()
    .transform((v) => v || ''),
  shift: z
    .string()
    .nullish()
    .transform((v) => v || ''),
  scheduleDate: z
    .string()
    .nullish()
    .transform((v) => v || ''),
  startTime: z
    .string()
    .nullish()
    .transform((v) => v || ''),
  endTime: z
    .string()
    .nullish()
    .transform((v) => v || ''),
  time: z.string().nullish(),
  capacity: z
    .number()
    .nullish()
    .transform((v) => v ?? 0),
  bookedCount: z
    .number()
    .nullish()
    .transform((v) => v ?? 0),
  clinicRoom: z
    .object({
      id: z.string(),
      name: z.string(),
      floor: z
        .union([z.string(), z.number()])
        .nullish()
        .transform((v) => (v != null ? String(v) : null))
    })
    .nullish(),
  patients: z
    .array(bookedPatientItemSchema)
    .nullish()
    .transform((v) => v || [])
});
export type AdminSessionPatientsData = z.infer<typeof adminSessionPatientsDataSchema>;

export const adminSessionPatientsResponseSchema = z.union([
  z
    .object({
      success: z.boolean().optional(),
      data: adminSessionPatientsDataSchema
    })
    .transform((val) => val.data),
  adminSessionPatientsDataSchema
]);
export type AdminSessionPatientsResponse = AdminSessionPatientsData;

export const cancelAppointmentPayloadSchema = z
  .object({
    reason: z.string().optional(),
    cancellationReason: z.string().optional(),
    notifyPatient: z.boolean().optional().default(true)
  })
  .refine(
    (data) => {
      const r = (data.reason || data.cancellationReason || '').trim();
      return r.length >= 5;
    },
    { message: 'Alasan pembatalan minimal 5 karakter' }
  )
  .transform((val) => {
    const finalReason = (val.reason || val.cancellationReason || '').trim();
    return {
      reason: finalReason,
      cancellationReason: finalReason,
      notifyPatient: val.notifyPatient ?? true
    };
  });
export type CancelAppointmentPayload = z.input<typeof cancelAppointmentPayloadSchema>;

export const cancelAppointmentResponseSchema = z.object({
  success: z.boolean().optional(),
  statusCode: z.number().optional(),
  message: z.string().optional(),
  data: z.any().optional()
});
export type CancelAppointmentResponse = z.infer<typeof cancelAppointmentResponseSchema>;

export const callAppointmentResponseSchema = z
  .object({
    success: z.boolean().optional(),
    attemptNumber: z.number().optional(),
    maxAttempts: z.number().optional(),
    status: z.string().optional(),
    id: z.string().optional(),
    data: z
      .object({
        id: z.string().optional(),
        status: z.string().optional(),
        attemptNumber: z.number().optional(),
        maxAttempts: z.number().optional(),
        queueTicket: z.any().optional()
      })
      .passthrough()
      .optional(),
    message: z.string().optional()
  })
  .passthrough();
export type CallAppointmentResponse = z.infer<typeof callAppointmentResponseSchema>;

export const completeAppointmentResponseSchema = z
  .object({
    success: z.boolean().optional(),
    id: z.string().optional(),
    status: z.string().optional(),
    completedAt: z.string().optional(),
    actualCompletedAt: z.string().optional(),
    data: z
      .object({
        id: z.string().optional(),
        status: z.string().optional(),
        completedAt: z.string().optional(),
        actualCompletedAt: z.string().optional()
      })
      .passthrough()
      .optional(),
    message: z.string().optional()
  })
  .passthrough();
export type CompleteAppointmentResponse = z.infer<typeof completeAppointmentResponseSchema>;

export const updateAppointmentStatusPayloadSchema = z.object({
  status: z.enum(['waiting', 'in_service', 'completed', 'no_show', 'cancelled']),
  notes: z.string().optional()
});
export type UpdateAppointmentStatusPayload = z.infer<typeof updateAppointmentStatusPayloadSchema>;

export const scheduleDaySettingsPayloadSchema = z.object({
  date: z.string(),
  isLeave: z.boolean().optional().default(false),
  note: z.string().optional()
});
export type ScheduleDaySettingsPayload = z.infer<typeof scheduleDaySettingsPayloadSchema>;

export const scheduleDaySettingsResponseSchema = z.object({
  success: z.boolean().optional(),
  data: z.any().optional(),
  message: z.string().optional()
});
export type ScheduleDaySettingsResponse = z.infer<typeof scheduleDaySettingsResponseSchema>;

export const scheduleReferenceShiftOptionSchema = z
  .object({
    id: z.string().optional(),
    label: z.string().optional(),
    shift: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    code: z.string().optional(),
    name: z.string().optional(),
    canonical_status: z.string().optional(),
    default_start_time: z.string().optional(),
    default_end_time: z.string().optional(),
    timeRange: z.string().optional(),
    startHour: z.number().optional(),
    endHour: z.number().optional(),
    durationMinutes: z.number().optional(),
    precisionMinutes: z.number().optional()
  })
  .transform((val) => {
    const code = val.code || val.shift || val.id || '';
    const name = val.name || val.label || val.shift || '';
    const default_start_time = val.default_start_time || val.startTime || '00:00';
    const default_end_time = val.default_end_time || val.endTime || '24:00';
    const id = val.id || val.code || val.shift || '';
    const label = val.label || val.name || '';
    const shift = val.shift || val.code || '';
    const startTime = val.startTime || val.default_start_time || '00:00';
    const endTime = val.endTime || val.default_end_time || '24:00';
    const timeRange = val.timeRange || `${startTime} - ${endTime}`;
    const startHour = val.startHour ?? Number.parseInt(startTime.split(':')[0] || '0', 10);
    const endHour = val.endHour ?? Number.parseInt(endTime.split(':')[0] || '24', 10);

    return {
      ...val,
      id,
      label,
      shift,
      startTime,
      endTime,
      code,
      name,
      default_start_time,
      default_end_time,
      timeRange,
      startHour,
      endHour
    };
  });
export type ScheduleReferenceShiftOption = z.infer<typeof scheduleReferenceShiftOptionSchema>;

export const scheduleReferenceOptionsDataSchema = z
  .object({
    shifts: z.array(scheduleReferenceShiftOptionSchema),
    statuses: z
      .array(
        z.object({
          id: z.string(),
          label: z.string()
        })
      )
      .optional(),
    effectiveConsultationDurationMinutes: z.number().optional(),
    durationSource: z.string().optional(),
    durationScope: z.string().optional(),
    canonicalIntervalStatuses: z
      .array(
        z.object({
          id: z.string(),
          label: z.string()
        })
      )
      .optional(),
    default_consultation_duration_minutes: z.number().optional(),
    start_precision_minutes: z.number().optional().default(1)
  })
  .transform((val) => {
    const defaultDuration =
      val.effectiveConsultationDurationMinutes ?? val.default_consultation_duration_minutes;
    return {
      ...val,
      effectiveConsultationDurationMinutes: defaultDuration,
      default_consultation_duration_minutes: defaultDuration
    };
  });
export type ScheduleReferenceOptionsData = z.infer<typeof scheduleReferenceOptionsDataSchema>;

export const scheduleReferenceOptionsResponseSchema = z.union([
  z
    .object({
      success: z.boolean().optional(),
      data: scheduleReferenceOptionsDataSchema
    })
    .transform((val) => val.data),
  scheduleReferenceOptionsDataSchema
]);
export type ScheduleReferenceOptionsResponse = ScheduleReferenceOptionsData;
