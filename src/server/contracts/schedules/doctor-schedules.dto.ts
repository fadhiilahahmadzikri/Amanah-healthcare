import { z } from 'zod';

export const scheduleDayStatusSchema = z
  .enum(['Buka', 'Terisi', 'Penuh', 'Cuti', 'Tutup'])
  .or(z.string());
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
  pasien_terdaftar: z.number().optional().default(0),
  display_slot: z.string().optional(),
  status_sesi: z.string(),
  ruang: z.string().optional(),
  is_reschedule_eligible: z.boolean().optional(),
  reschedule_ineligibility_reason: z.string().nullable().optional()
});
export type DoctorDailySession = z.infer<typeof doctorDailySessionSchema>;

export const monthlyScheduleDaySchema = z.object({
  day: z.number(),
  date: z.string(),
  status: scheduleDayStatusSchema.optional(),
  notes: z.string().nullable().optional(),
  dayStatus: z.enum(['OPEN', 'CLOSED', 'CUTI', 'EMPTY']).or(z.string()).optional(),
  statusLabel: z.string().optional(),
  badgeVariant: z.enum(['success', 'danger', 'warning', 'neutral']).or(z.string()).optional(),
  activeSessions: z.number().optional(),
  totalCapacity: z.number().optional(),
  bookedPatients: z.number().optional(),
  isClickable: z.boolean().optional()
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
  sesi_harian: z.array(doctorDailySessionSchema).optional(),
  display_akumulasi_slot: z.string().optional(),
  jadwal_praktik_mendatang: z.string().optional(),
  slot_terisi_akumulasi: z.number().optional(),
  slot_kapasitas_akumulasi: z.number().optional()
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

export const rescheduleMetadataSchema = z.object({
  isRescheduled: z.boolean(),
  sourceDate: z.string().optional(),
  sourceStartTime: z.string().optional(),
  reasonText: z.string().optional()
});
export type RescheduleMetadata = z.infer<typeof rescheduleMetadataSchema>;

export const slotOccupancyMetricSchema = z.object({
  occupied: z.number(),
  capacity: z.number(),
  percentage: z.number(),
  displayText: z.string().optional()
});
export type SlotOccupancyMetric = z.infer<typeof slotOccupancyMetricSchema>;

export const slotScheduleCoverageMetricSchema = z.object({
  scheduled: z.number(),
  total: z.number(),
  percentage: z.number(),
  displayText: z.string().optional()
});
export type SlotScheduleCoverageMetric = z.infer<typeof slotScheduleCoverageMetricSchema>;

export const slotProjectionMetricsSchema = z.object({
  totalSlots: z.number().optional(),
  totalDaySlots: z.number().optional(),
  scheduledSlots: z.number(),
  unscheduledSlots: z.number(),
  availableSlots: z.number(),
  completedSlots: z.number().optional(),
  occupiedSlots: z.number(),
  closedSlots: z.number(),
  activeBookableSlots: z.number(),
  occupancy: slotOccupancyMetricSchema.optional(),
  patientOccupancy: slotOccupancyMetricSchema.optional(),
  scheduleCoverage: slotScheduleCoverageMetricSchema,
  unscheduledNotice: z.string().optional()
});
export type SlotProjectionMetrics = z.infer<typeof slotProjectionMetricsSchema>;

export const timelineIntervalSchema = z.object({
  intervalIndex: z.number().optional(),
  slotIndex: z.number().optional(),
  slotId: z.string().optional(),
  intervalId: z.string().optional(),
  timeStart: z.string().optional(),
  timeEnd: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
  timeRange: z.string().optional(),
  status: z
    .enum(['OPEN', 'OCCUPIED', 'CLOSED', 'UNSCHEDULED', 'EXPIRED'])
    .or(z.string())
    .optional(),
  displayLabel: z.string().optional(),
  isOccupied: z.boolean().optional(),
  temporalState: z.enum(['PAST', 'CURRENT', 'FUTURE']).or(z.string()).optional(),
  availabilityState: z
    .enum(['UNSCHEDULED', 'AVAILABLE', 'OCCUPIED', 'CLOSED'])
    .or(z.string())
    .optional(),
  effectiveStatus: z
    .enum(['AVAILABLE', 'OCCUPIED', 'CLOSED', 'UNSCHEDULED', 'EXPIRED'])
    .or(z.string())
    .optional(),
  isSelectable: z.boolean().optional(),
  appointmentRef: z
    .object({
      appointmentId: z.string(),
      queueNumber: z.union([z.number(), z.string()]),
      status: z.string(),
      patientName: z.string().optional()
    })
    .nullable()
    .optional(),
  closure: closureMetadataSchema.nullable().optional(),
  reschedule: rescheduleMetadataSchema.nullable().optional(),
  closedReason: z.string().nullable().optional(),
  // UI-Ready fields
  uiStatus: z
    .enum([
      'UNSCHEDULED_PAST',
      'UNSCHEDULED',
      'COMPLETED',
      'AVAILABLE',
      'OCCUPIED',
      'OCCUPIED_BY_OTHER',
      'CLOSED_LEAVE',
      'CLOSED_CLINIC'
    ])
    .or(z.string())
    .optional(),
  uiLabel: z.string().optional(),
  uiSubLabel: z.string().optional(),
  uiVariant: z
    .enum([
      'neutral_disabled',
      'dashed_border',
      'muted_gray',
      'success_green',
      'info_blue',
      'purple_other',
      'sky_badge',
      'danger_red'
    ])
    .or(z.string())
    .optional(),
  isClickable: z.boolean().optional(),
  actionType: z
    .enum(['NONE', 'ADD_SESSION', 'VIEW_SESSION', 'VIEW_PATIENTS', 'VIEW_OCCUPANCY_CONFLICT'])
    .or(z.string())
    .optional(),
  sessionId: z.string().nullable().optional(),
  conflictInfo: z.any().nullable().optional()
});
export type TimelineInterval = z.infer<typeof timelineIntervalSchema>;

export const occupancySlotSchema = z
  .object({
    slotIndex: z.number(),
    intervalIndex: z.number().optional(),
    intervalId: z.string().optional(),
    slotId: z.string().optional(),
    timeStart: z.string().optional(),
    timeEnd: z.string().optional(),
    startTime: z.string(),
    endTime: z.string(),
    startMinutes: z.number().optional(),
    endMinutes: z.number().optional(),
    timeRange: z.string().optional(),
    isAvailable: z.boolean().optional(),
    status: z
      .enum([
        'AVAILABLE',
        'OCCUPIED_BY_SELF',
        'OCCUPIED_BY_OTHER',
        'CLOSED_LEAVE',
        'CLOSED',
        'UNSCHEDULED',
        'EXPIRED',
        'OCCUPIED'
      ])
      .or(z.string())
      .optional(),
    displayLabel: z.string().optional(),
    temporalState: z.enum(['PAST', 'CURRENT', 'FUTURE']).or(z.string()).optional(),
    availabilityState: z
      .enum(['UNSCHEDULED', 'AVAILABLE', 'OCCUPIED', 'CLOSED'])
      .or(z.string())
      .optional(),
    effectiveStatus: z
      .enum(['AVAILABLE', 'OCCUPIED', 'CLOSED', 'UNSCHEDULED', 'EXPIRED'])
      .or(z.string())
      .optional(),
    isSelectable: z.boolean().optional().default(false),
    closure: closureMetadataSchema.nullable().optional(),
    reschedule: rescheduleMetadataSchema.nullable().optional(),
    appointmentRef: z
      .object({
        appointmentId: z.string(),
        queueNumber: z.union([z.number(), z.string()]),
        status: z.string(),
        patientName: z.string().optional()
      })
      .nullable()
      .optional(),
    conflictInfo: z.any().nullable().optional(),
    // Backend UI-Ready Contract (Zero Over-Engineering)
    uiStatus: z
      .enum([
        'UNSCHEDULED_PAST',
        'UNSCHEDULED',
        'COMPLETED',
        'AVAILABLE',
        'OCCUPIED',
        'OCCUPIED_BY_OTHER',
        'CLOSED_LEAVE',
        'CLOSED_CLINIC'
      ])
      .or(z.string())
      .optional(),
    uiLabel: z.string().optional(),
    uiSubLabel: z.string().optional(),
    uiVariant: z
      .enum([
        'neutral_disabled',
        'dashed_border',
        'muted_gray',
        'success_green',
        'info_blue',
        'purple_other',
        'sky_badge',
        'danger_red'
      ])
      .or(z.string())
      .optional(),
    isClickable: z.boolean().optional(),
    actionType: z
      .enum(['NONE', 'ADD_SESSION', 'VIEW_SESSION', 'VIEW_PATIENTS', 'VIEW_OCCUPANCY_CONFLICT'])
      .or(z.string())
      .optional(),
    sessionId: z.string().nullable().optional(),
    patientInfo: z.any().nullable().optional(),
    rescheduleInfo: z.any().nullable().optional(),
    closureInfo: z.any().nullable().optional()
  })
  .transform((slot) => {
    const availabilityState = slot.availabilityState || 'CLOSED';
    const effectiveStatus = slot.effectiveStatus || slot.status || availabilityState;
    const isAvailable =
      slot.isAvailable ?? (effectiveStatus === 'AVAILABLE' || availabilityState === 'AVAILABLE');
    const status =
      slot.status || (slot.closure?.category === 'LEAVE' ? 'CLOSED_LEAVE' : availabilityState);
    const displayLabel =
      slot.uiLabel ||
      slot.displayLabel ||
      (availabilityState === 'AVAILABLE'
        ? 'Tersedia'
        : availabilityState === 'UNSCHEDULED'
          ? 'Belum Terjadwal'
          : availabilityState === 'OCCUPIED'
            ? slot.appointmentRef?.patientName
              ? `Terisi: ${slot.appointmentRef.patientName}`
              : 'Terisi'
            : slot.closure?.reasonText || 'Ditutup');

    return {
      ...slot,
      isAvailable,
      status,
      displayLabel,
      effectiveStatus,
      availabilityState
    };
  });
export type OccupancySlot = z.infer<typeof occupancySlotSchema>;

export const shiftOperationalStatusSchema = z.enum(['ACTIVE', 'NO_PRACTICE', 'CLOSED', 'CUTI']);
export type ShiftOperationalStatus = z.infer<typeof shiftOperationalStatusSchema>;

export const occupancyShiftSchema = z
  .object({
    contextId: z.string().optional(),
    contextLabel: z.string().optional(),
    shiftId: z.string().optional(),
    shiftName: z.string().optional(),
    shift: z.string().optional(),
    label: z.string().optional(),
    operationalStatus: shiftOperationalStatusSchema.or(z.string()).optional(),
    operationalLabel: z.string().optional(),
    activeSessionsCount: z.number().optional(),
    registeredPatientsCount: z.number().optional(),
    totalShiftSlots: z.number().optional(),
    sessionShift: z.string().optional(),
    timeRange: z.string().optional(),
    boundaryStartTime: z.string().optional(),
    boundaryEndTime: z.string().optional(),
    intervalMinutes: z.number().optional().default(30),
    totalSlots: z.number().optional(),
    availableSlotsCount: z.number().optional(),
    occupiedSlotsCount: z.number().optional(),
    counts: z
      .object({
        total: z.number(),
        unscheduled: z.number().optional().default(0),
        available: z.number().optional().default(0),
        occupied: z.number().optional().default(0),
        closed: z.number().optional().default(0),
        scheduled: z.number().optional().default(0),
        activeBookable: z.number().optional().default(0),
        past: z.number().optional().default(0),
        current: z.number().optional().default(0),
        future: z.number().optional().default(0)
      })
      .optional(),
    metrics: slotProjectionMetricsSchema.optional(),
    summary: slotProjectionMetricsSchema.optional(),
    slots: z.array(occupancySlotSchema)
  })
  .transform((shift) => {
    const boundaryStartTime = shift.boundaryStartTime || '00:00';
    const boundaryEndTime = shift.boundaryEndTime || '24:00';
    const timeRange = shift.timeRange || `${boundaryStartTime} - ${boundaryEndTime} WIB`;
    const contextId = shift.contextId || shift.shiftId || shift.shift || 'shift';
    const contextLabel = shift.contextLabel || shift.shiftName || shift.label || 'Shift';
    const totalSlots =
      shift.totalSlots ?? shift.totalShiftSlots ?? shift.counts?.total ?? shift.slots.length;
    const availableSlotsCount =
      shift.availableSlotsCount ?? shift.counts?.available ?? shift.metrics?.availableSlots ?? 0;
    const occupiedSlotsCount =
      shift.occupiedSlotsCount ?? shift.counts?.occupied ?? shift.metrics?.occupiedSlots ?? 0;

    return {
      ...shift,
      contextId,
      contextLabel,
      boundaryStartTime,
      boundaryEndTime,
      timeRange,
      totalSlots,
      availableSlotsCount,
      occupiedSlotsCount
    };
  });
export type OccupancyShift = z.infer<typeof occupancyShiftSchema>;

export const adminDoctorScheduleDetailResponseSchema = z.object({
  success: z.boolean(),
  data: doctorScheduleItemSchema.extend({
    monthly_schedule: z.array(monthlyScheduleDaySchema).optional(),
    timeline_intervals: z.array(timelineIntervalSchema).optional(),
    shifts: z.array(occupancyShiftSchema).optional(),
    context_projections: z.array(occupancyShiftSchema).optional(),
    metrics: slotProjectionMetricsSchema.optional(),
    summary: slotProjectionMetricsSchema.optional()
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
  ruang: z.string().optional(),
  session: z.enum(['DINI_HARI', 'PAGI', 'SIANG', 'MALAM']).or(z.string()).optional(),
  status: z.enum(['OPEN', 'CLOSED', 'Buka', 'Tutup']).or(z.string()).optional(),
  notes: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  capacity: z.number().optional(),
  roomId: z.string().optional()
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
  ruang: z.string().optional(),
  session: z.enum(['DINI_HARI', 'PAGI', 'SIANG', 'MALAM']).or(z.string()).optional(),
  status: z.enum(['OPEN', 'CLOSED', 'Buka', 'Tutup']).or(z.string()).optional(),
  notes: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  capacity: z.number().optional(),
  roomId: z.string().optional()
});
export type UpdateAdminDoctorSessionPayload = z.infer<typeof updateAdminDoctorSessionPayloadSchema>;

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
  sourceStartTime: z.string().optional(),
  targetShift: z.string().optional(),
  targetScheduleContextId: z.string().optional(),
  targetRoomId: z.string().optional(),
  notes: z.string().optional(),
  reason: z.string().optional(),
  rescheduleActiveAppointments: z.boolean().optional().default(true),
  unscheduleSourceSlot: z.boolean().optional().default(false)
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

export const rescheduleEligibilityDataSchema = z
  .object({
    isEligible: z.boolean(),
    actionableGuidance: z.string().nullable().optional(),
    targetValidation: z
      .object({
        isTargetEligible: z.boolean().optional(),
        conflictMessage: z.string().nullable().optional(),
        projectedEndTime: z.string().nullable().optional()
      })
      .optional(),
    sourceSession: z
      .object({
        id: z.string().optional(),
        sessionId: z.string().optional(),
        doctorName: z.string().optional(),
        date: z.string().optional(),
        shift: z.string().optional(),
        timeRange: z.string().optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        activeAppointmentsCount: z.number().optional()
      })
      .optional(),
    targetSimulation: z
      .object({
        targetDate: z.string().optional(),
        targetShift: z.string().optional(),
        targetStartTime: z.string().optional(),
        projectedEndTime: z.string().nullable().optional(),
        quotaCapacity: z.number().optional(),
        maxShiftCapacity: z.number().optional(),
        availableSlots: z.number().optional(),
        availableSlotCount: z.number().optional(),
        isRoomAvailable: z.boolean().optional(),
        assignedRoomName: z.string().optional(),
        conflictMessage: z.string().nullable().optional(),
        willFit: z.boolean().optional()
      })
      .optional(),
    affectedPatients: z
      .array(
        z.object({
          appointmentId: z.string(),
          patientName: z.string(),
          originalTimeSlot: z.string().optional(),
          currentSlot: z.string().optional(),
          projectedTimeSlot: z.string().optional(),
          projectedNewSlot: z.string().optional(),
          status: z.string().optional()
        })
      )
      .optional()
  })
  .transform((val) => {
    const isEligible = val.isEligible;
    const targetValidation =
      val.targetValidation ||
      (val.targetSimulation
        ? {
            isTargetEligible:
              val.targetSimulation.willFit !== undefined
                ? val.targetSimulation.willFit
                : val.targetSimulation.isRoomAvailable !== false &&
                  (val.targetSimulation.availableSlots ?? 1) > 0,
            conflictMessage:
              val.targetSimulation.conflictMessage ??
              (val.targetSimulation.willFit === false
                ? 'Kapasitas shift tujuan tidak mencukupi'
                : null),
            projectedEndTime: val.targetSimulation.projectedEndTime
          }
        : undefined);

    const sourceSession = val.sourceSession
      ? {
          ...val.sourceSession,
          id: val.sourceSession.id || val.sourceSession.sessionId || '',
          sessionId: val.sourceSession.sessionId || val.sourceSession.id || ''
        }
      : undefined;

    return {
      ...val,
      isEligible,
      targetValidation,
      sourceSession
    };
  });
export type RescheduleEligibilityData = z.infer<typeof rescheduleEligibilityDataSchema>;

export const rescheduleEligibilityResponseSchema = z.union([
  z.object({
    success: z.boolean(),
    data: rescheduleEligibilityDataSchema
  }),
  rescheduleEligibilityDataSchema.transform((val) => ({
    success: true,
    data: val
  }))
]);
export type RescheduleEligibilityResponse = z.infer<typeof rescheduleEligibilityResponseSchema>;

export const updateAdminDayByDatePayloadSchema = z.object({
  status: z.enum(['OPEN', 'CLOSED', 'Buka', 'Tutup']).or(z.string()),
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
  isOccupied: z.boolean().optional().default(false),
  occupiedBy: z.string().optional().nullable(),
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

export const doctorOccupancyOverviewDataSchema = z.object({
  date: z.string(),
  practitionerId: z.string(),
  practitionerName: z.string().optional(),
  effectiveConsultationDurationMinutes: z.number().optional().default(30),
  roomId: z.string().nullable().optional(),
  roomName: z.string().nullable().optional(),
  isCuti: z.boolean().optional().default(false),
  cutiReason: z.string().nullable().optional(),
  summary: z
    .object({
      totalShifts: z.number(),
      totalSlots: z.number(),
      availableSlots: z.number(),
      occupiedSlots: z.number()
    })
    .optional(),
  shifts: z.array(occupancyShiftSchema)
});
export type DoctorOccupancyOverviewData = z.infer<typeof doctorOccupancyOverviewDataSchema>;

export const doctorOccupancyOverviewResponseSchema = z.union([
  z
    .object({
      success: z.boolean().optional(),
      data: doctorOccupancyOverviewDataSchema
    })
    .transform((val) => val.data),
  doctorOccupancyOverviewDataSchema
]);
export type DoctorOccupancyOverviewResponse = DoctorOccupancyOverviewData;

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
  timeSlot: z
    .string()
    .nullish()
    .transform((v) => v || ''),
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
    .transform((v) => v || 'Ruang Praktik'),
  roomName: z.string().nullish(),
  roomLocation: z.string().nullish(),
  poliklinikName: z.string().nullish(),
  visitType: z.string().nullish(),
  serviceName: z.string().nullish(),
  isCancellable: z
    .boolean()
    .nullish()
    .transform((v) => v ?? true),
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
  availableSlots: z
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

export const callAppointmentResponseSchema = z.object({
  success: z.boolean().optional(),
  data: z
    .object({
      id: z.string(),
      status: z.string(),
      queueTicket: z.any().optional()
    })
    .optional(),
  message: z.string().optional()
});
export type CallAppointmentResponse = z.infer<typeof callAppointmentResponseSchema>;

export const completeAppointmentResponseSchema = z.object({
  success: z.boolean().optional(),
  data: z
    .object({
      id: z.string(),
      status: z.string(),
      completedAt: z.string().optional()
    })
    .optional(),
  message: z.string().optional()
});
export type CompleteAppointmentResponse = z.infer<typeof completeAppointmentResponseSchema>;

export const updateAppointmentStatusPayloadSchema = z.object({
  status: z.enum(['waiting', 'in_service', 'completed', 'no_show', 'cancelled']),
  notes: z.string().optional()
});
export type UpdateAppointmentStatusPayload = z.infer<typeof updateAppointmentStatusPayloadSchema>;

export const scheduleContextSchema = z.object({
  id: z.string(),
  name: z.string(),
  shift: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  capacity: z.number().optional(),
  slotIntervalMinutes: z.number().optional().default(30)
});
export type ScheduleContext = z.infer<typeof scheduleContextSchema>;

export const scheduleContextsResponseSchema = z.union([
  z.array(scheduleContextSchema),
  z
    .object({
      success: z.boolean().optional(),
      data: z.array(scheduleContextSchema)
    })
    .transform((val) => val.data)
]);
export type ScheduleContextsResponse = ScheduleContext[];

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

export const scheduleProjectionSlotSchema = z.object({
  slotNumber: z.number().optional(),
  startTime: z.string(),
  endTime: z.string()
});
export type ScheduleProjectionSlot = z.infer<typeof scheduleProjectionSlotSchema>;

export const scheduleProjectionDataSchema = z
  .object({
    scheduleContextId: z.string().optional(),
    shift: z.string().optional(),
    shiftCode: z.string().optional(),
    shiftLabel: z.string().optional(),
    shiftName: z.string().optional(),
    startTime: z.string(),
    projectedEndTime: z.string(),
    capacity: z.number().optional(),
    slotCount: z.number().optional(),
    slotDurationMinutes: z.number().optional(),
    shiftBoundary: z
      .object({
        start: z.string(),
        end: z.string()
      })
      .optional(),
    slots: z.array(scheduleProjectionSlotSchema).optional().default([]),
    remainingShiftSlots: z.number().optional(),
    explanation: z.string().optional()
  })
  .transform((val) => {
    const capacity = val.capacity ?? val.slotCount ?? 0;
    const slotCount = val.slotCount ?? val.capacity ?? 0;
    return {
      ...val,
      capacity,
      slotCount
    };
  });
export type ScheduleProjectionData = z.infer<typeof scheduleProjectionDataSchema>;

export const scheduleProjectionResponseSchema = z.union([
  z
    .object({
      success: z.boolean().optional(),
      data: scheduleProjectionDataSchema
    })
    .transform((val) => val.data),
  scheduleProjectionDataSchema
]);
export type ScheduleProjectionResponse = ScheduleProjectionData;

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
    default_quota: z.number().optional()
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
      default_quota: val.default_quota ?? 12
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
    timeSlotIntervals: z.array(z.number()).optional(),
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
      val.effectiveConsultationDurationMinutes ?? val.default_consultation_duration_minutes ?? 30;
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

// Slot Availability Matrix DTO (Deterministic 12-slot Pre-Rendered Dropdown)
export const scheduleSlotConflictSchema = z.object({
  type: z.string(),
  message: z.string().optional(),
  reason: z.string().optional(),
  practitionerName: z.string().optional(),
  occupantName: z.string().optional(),
  practitionerId: z.string().nullable().optional(),
  staffId: z.string().nullable().optional()
});
export type ScheduleSlotConflict = z.infer<typeof scheduleSlotConflictSchema>;

export const scheduleSlotAvailabilityItemSchema = z
  .object({
    slotIndex: z.number(),
    time: z.string(),
    endTime: z.string(),
    status: z.string(),
    isAvailable: z.boolean(),
    displayLabel: z.string(),
    conflict: scheduleSlotConflictSchema.nullable().optional(),
    conflictInfo: scheduleSlotConflictSchema.nullable().optional()
  })
  .transform((item) => ({
    ...item,
    conflict: item.conflict ?? item.conflictInfo ?? null
  }));
export type ScheduleSlotAvailabilityItem = z.infer<typeof scheduleSlotAvailabilityItemSchema>;

export const scheduleSlotAvailabilityDataSchema = z.object({
  date: z.string(),
  shift: z.string(),
  roomId: z.string(),
  roomName: z.string().optional(),
  summary: z
    .object({
      totalSlots: z.number(),
      availableSlots: z.number(),
      occupiedSlots: z.number()
    })
    .optional(),
  slots: z.array(scheduleSlotAvailabilityItemSchema)
});
export type ScheduleSlotAvailabilityData = z.infer<typeof scheduleSlotAvailabilityDataSchema>;

export const scheduleSlotAvailabilityResponseSchema = z.union([
  z
    .object({
      success: z.boolean().optional(),
      data: scheduleSlotAvailabilityDataSchema
    })
    .transform((val) => val.data),
  scheduleSlotAvailabilityDataSchema
]);
export type ScheduleSlotAvailabilityResponse = ScheduleSlotAvailabilityData;
