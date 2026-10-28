import { z } from 'zod';
import { STAFF_TYPES, type StaffType } from '@/constants/staff-types.constant';

export const scheduleOperationalStatusSchema = z.enum(['OPEN', 'CLOSED', 'PENDING', 'ON_LEAVE']);
export type ScheduleOperationalStatus = z.infer<typeof scheduleOperationalStatusSchema>;

export const scheduleClosureReasonSchema = z.enum([
  'CLINIC_CLOSED',
  'NOT_ROSTERED',
  'DOCTOR_LEAVE',
  'ADMIN_OVERRIDE',
  'SHIFT_ENDED'
]);
export type ScheduleClosureReason = z.infer<typeof scheduleClosureReasonSchema>;

export const scheduleDayStatusSchema = z.enum(['OPEN', 'CLOSED', 'ON_LEAVE']);
export type ScheduleDayStatus = z.infer<typeof scheduleDayStatusSchema>;

const avatarSchema = z.string().optional();

export const sessionStatusSchema = z.enum(['OPEN', 'CLOSED', 'ON_LEAVE']);
export type SessionStatus = z.infer<typeof sessionStatusSchema>;

export const doctorDailySessionSchema = z.object({
  id: z.string(),
  sessionName: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  timeRange: z.string().optional(),
  bookedPatients: z.number().optional().default(0),
  sessionStatus: z.enum(['OPEN', 'CLOSED']),
  closureReason: scheduleClosureReasonSchema.nullable().optional(),
  roomName: z.string().optional(),
  roomId: z.string().nullable().optional(),
  isRescheduleEligible: z.boolean().optional(),
  rescheduleIneligibilityReason: z.string().nullable().optional(),
  date: z.string().optional()
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
  practitionerId: z.string().optional(),
  staffProfileId: z.string().nullable().optional(),
  staffId: z.string().nullable().optional(),
  staffCode: z.string().nullable().optional(),
  staffType: z.enum([STAFF_TYPES.DOCTOR, STAFF_TYPES.MIDWIFE, STAFF_TYPES.WORKER]).optional(),
  fullName: z.string(),
  specialty: z.string(),
  doctorStatus: scheduleOperationalStatusSchema,
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  practiceRoom: z.string(),
  practiceDate: z.string().optional(),
  avatar: avatarSchema,
  todaySchedule: z.string().nullable().optional(),
  upcomingSchedule: z.string().nullable().optional(),
  scheduleStatus: scheduleOperationalStatusSchema,
  scheduleMonth: z.string().optional(),
  isOnLeave: z.boolean().optional(),
  leaveReason: z.string().nullable().optional(),
  leaveStart: z.string().nullable().optional(),
  leaveEnd: z.string().nullable().optional(),
  leaveType: z.string().nullable().optional(),
  substituteDoctorName: z.string().nullable().optional(),
  replacementStatus: z.string().nullable().optional(),
  dailySessions: z.array(doctorDailySessionSchema).optional(),
  totalPatients: z.number().optional(),
  patientPreviews: z.array(doctorCardPatientPreviewSchema).optional(),
  isAcceptingAppointments: z.boolean().optional(),
  createdAt: z.string().nullable().optional()
});
export type DoctorScheduleItem = z.infer<typeof doctorScheduleItemSchema>;

export const adminDoctorScheduleListResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    doctors: z.array(doctorScheduleItemSchema),
    meta: z.object({
      page: z.number(),
      limit: z.number(),
      totalDoctors: z.number(),
      totalPages: z.number()
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
  'ON_LEAVE',
  'isOnLeave'
]);
export type ShiftOperationalStatus = z.infer<typeof shiftOperationalStatusSchema>;

export const adminDoctorScheduleDetailResponseSchema = z.object({
  success: z.boolean(),
  data: doctorScheduleItemSchema.extend({
    monthlySchedule: z.array(monthlyScheduleDaySchema).optional(),
    dailySessions: z.array(doctorDailySessionSchema).optional(),
    timelineIntervals: z.array(z.any()).optional(),
    shifts: z.array(z.any()).optional(),
    contextProjections: z.array(z.any()).optional(),
    metrics: z.any().optional(),
    summary: z.any().optional()
  })
});
export type AdminDoctorScheduleDetailResponse = z.infer<
  typeof adminDoctorScheduleDetailResponseSchema
>;

export const updateAdminDoctorSchedulePayloadSchema = z.object({
  isOnLeave: z.boolean().optional(),
  leaveReason: z.string().nullable().optional(),
  leaveStart: z.string().nullable().optional(),
  leaveEnd: z.string().nullable().optional(),
  doctorStatus: scheduleOperationalStatusSchema.optional(),
  scheduleStatus: scheduleOperationalStatusSchema.optional(),
  todaySchedule: z.string().nullable().optional(),
  practiceRoom: z.string().optional(),
  roomId: z.string().optional(),
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
  is_available: z.boolean(),
  is_on_leave: z.boolean().optional(),
  leave_reason: z.string().nullable().optional(),
  is_replacement: z.boolean().optional(),
  replacing_practitioner_name: z.string().nullable().optional(),
  attendance_status: z
    .enum(['checked_in', 'not_checked_in', 'late', 'on_leave', 'absent'])
    .optional(),
  check_in_at: z.string().nullable().optional(),
  attendance_warning: z.string().nullable().optional()
});
export type ClinicalPractitioner = z.infer<typeof clinicalPractitionerSchema>;

export const clinicalPractitionersResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(clinicalPractitionerSchema)
});
export type ClinicalPractitionersResponse = z.infer<typeof clinicalPractitionersResponseSchema>;

export const updateAdminDoctorSessionPayloadSchema = z.object({
  sessionName: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  sessionStatus: z.enum(['OPEN', 'CLOSED']).optional(),
  roomName: z.string().optional(),
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
    ),
    sessions: z
      .array(
        z.object({
          id: z.string(),
          code: z.string(),
          name: z.string(),
          label: z.string(),
          startsAt: z.string().optional().nullable(),
          endsAt: z.string().optional().nullable()
        })
      )
      .optional()
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

export const clinicRoomsResponseSchema = z.preprocess(
  (val: any) => (val && typeof val === 'object' && 'data' in val ? val.data : val),
  z.array(clinicRoomSchema)
);
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
    .transform((v) => v || ''),
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

export const adminSessionPatientsResponseSchema = z.preprocess(
  (val: any) => (val && typeof val === 'object' && 'data' in val ? val.data : val),
  adminSessionPatientsDataSchema
);
export type AdminSessionPatientsResponse = AdminSessionPatientsData;

export const cancelAppointmentPayloadSchema = z.object({
  reason: z.string().optional(),
  notifyPatient: z.boolean().optional()
});
export type CancelAppointmentPayload = z.infer<typeof cancelAppointmentPayloadSchema>;

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

export const scheduleReferenceShiftOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  shift: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  code: z.string().optional(),
  name: z.string().optional(),
  canonical_status: z.string().optional(),
  timeRange: z.string().optional(),
  startHour: z.number().optional(),
  endHour: z.number().optional(),
  durationMinutes: z.number().optional(),
  precisionMinutes: z.number().optional()
});
export type ScheduleReferenceShiftOption = z.infer<typeof scheduleReferenceShiftOptionSchema>;

export const scheduleReferenceOptionsDataSchema = z.object({
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
  start_precision_minutes: z.number().optional()
});
export type ScheduleReferenceOptionsData = z.infer<typeof scheduleReferenceOptionsDataSchema>;

export const scheduleReferenceOptionsResponseSchema = z.preprocess(
  (val: any) => (val && typeof val === 'object' && 'data' in val ? val.data : val),
  scheduleReferenceOptionsDataSchema
);
export type ScheduleReferenceOptionsResponse = ScheduleReferenceOptionsData;
