import { describe, expect, it } from 'vitest';
import {
  adminDoctorScheduleFilterOptionsSchema,
  updateAdminDoctorSessionPayloadSchema,
  deleteAdminDoctorSessionResponseSchema,
  adminDoctorScheduleDetailResponseSchema,
  rescheduleEligibilityResponseSchema,
  updateAdminDayByDatePayloadSchema,
  updateAdminDayByDateResponseSchema,
  doctorDailySessionSchema,
  adminSessionPatientsResponseSchema,
  cancelAppointmentPayloadSchema,
  cancelAppointmentResponseSchema,
  updateAppointmentStatusPayloadSchema,
  doctorScheduleItemSchema,
  scheduleReferenceOptionsResponseSchema,
  scheduleContextsResponseSchema,
  scheduleProjectionResponseSchema,
  callAppointmentResponseSchema,
  completeAppointmentResponseSchema,
  scheduleSlotAvailabilityResponseSchema
} from './doctor-schedules.dto';

describe('Admin Doctor Schedules Contract DTOs', () => {
  it('validates doctorScheduleItemSchema with live backend SSOT fields', () => {
    const liveItem = {
      id: '77bbb45a-18df-4311-b2a4-a4b6f22870ca',
      practitioner_id: '77bbb45a-18df-4311-b2a4-a4b6f22870ca',
      nama_dokter: 'Ahmadamikom Zikri',
      spesialisasi: 'Front Desk',
      status_dokter: 'CLOSED',
      email: 'ahmadamikom@amanah.com',
      nomor_telepon: '081234567891',
      ruang_praktik: 'Belum Ditentukan',
      tanggal_praktik: '2026-09-24',
      avatar: '',
      slot_tersedia: 0,
      kapasitas_per_hari: 0,
      jadwal_hari_ini: '-',
      status_jadwal: 'CLOSED',
      bulan_jadwal: 'September 2026',
      is_cuti: false,
      cuti_reason: null,
      cuti_start: null,
      cuti_end: null,
      display_akumulasi_slot: '-',
      jadwal_praktik_mendatang: 'Praktik Ditutup',
      slot_terisi_akumulasi: 0,
      slot_kapasitas_akumulasi: 0
    };

    const parsed = doctorScheduleItemSchema.parse(liveItem);
    expect(parsed.status_dokter).toBe('CLOSED');
    expect(parsed.display_akumulasi_slot).toBe('-');
    expect(parsed.jadwal_praktik_mendatang).toBe('Praktik Ditutup');
  });

  it('validates 200 OK filter options response from backend', () => {
    const rawBackendResponse = {
      success: true,
      data: {
        poliklinik: [
          { id: '42f7d3e2-5c91-4475-b6d9-f538cb3b85db', name: 'Poli Umum', code: 'UMU' },
          { id: 'b3e244b8-e2eb-458f-b98a-5e7c8e2f8fa9', name: 'Poli Gigi & Mulut', code: 'GIG' }
        ],
        spesialisasi: [
          { id: '8c6b73a2-6f29-4789-98fc-9da6b4bb55c1', name: 'Dokter Umum', code: 'dokter_umum' },
          {
            id: 'd1e7c992-0b1a-4f51-b0e2-a7cfb62e49c8',
            name: 'Spesialis Penyakit Dalam',
            code: 'sp_pd'
          }
        ],
        statuses: [
          { id: 'buka', label: 'Buka' },
          { id: 'cuti', label: 'Cuti' },
          { id: 'tutup', label: 'Tutup' },
          { id: 'penuh', label: 'Penuh' }
        ]
      }
    };

    const parsed = adminDoctorScheduleFilterOptionsSchema.parse(rawBackendResponse);
    expect(parsed.success).toBe(true);
    expect(parsed.data.poliklinik).toHaveLength(2);
    expect(parsed.data.spesialisasi).toHaveLength(2);
    expect(parsed.data.statuses).toHaveLength(4);
    expect(parsed.data.poliklinik[0].name).toBe('Poli Umum');
  });

  it('validates update doctor session request payload', () => {
    const payload = {
      nama_sesi: 'Sesi Siang Lanjutan',
      jam_mulai: '13:00',
      jam_selesai: '17:00',
      kuota_pasien: 20,
      slot_tersedia: 15,
      status_sesi: 'Buka',
      ruang: 'Poli Penyakit Dalam, Ruang 202'
    };

    const parsed = updateAdminDoctorSessionPayloadSchema.parse(payload);
    expect(parsed.nama_sesi).toBe('Sesi Siang Lanjutan');
    expect(parsed.kuota_pasien).toBe(20);
    expect(parsed.slot_tersedia).toBe(15);
  });

  it('validates delete doctor session response', () => {
    const response = {
      success: true,
      message: 'Sesi jadwal berhasil dihapus',
      data: {
        sessionId: 'b48cb32f-8973-4557-b12e-1b849503487c'
      }
    };

    const parsed = deleteAdminDoctorSessionResponseSchema.parse(response);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.sessionId).toBe('b48cb32f-8973-4557-b12e-1b849503487c');
  });

  it('validates new doctor with 0 capacity and 0 sessions in detail response', () => {
    const newDoctorDetail = {
      success: true,
      data: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        practitioner_id: '123e4567-e89b-12d3-a456-426614174000',
        nama_dokter: 'dr. Ahmad Pratama',
        spesialisasi: 'Dokter Umum',
        status_dokter: 'Tutup',
        email: 'ahmad.pratama@amanah.com',
        nomor_telepon: '081234567899',
        ruang_praktik: 'Belum Ditentukan',
        avatar: null,
        slot_tersedia: 0,
        kapasitas_per_hari: 0,
        jadwal_hari_ini: '',
        status_jadwal: 'Tutup',
        bulan_jadwal: 'September 2026',
        is_cuti: false,
        cuti_reason: null,
        cuti_start: null,
        cuti_end: null,
        monthly_schedule: [{ day: 1, date: '2026-09-01', status: 'Tutup', notes: null }],
        sesi_harian: []
      }
    };

    const parsed = adminDoctorScheduleDetailResponseSchema.parse(newDoctorDetail);
    expect(parsed.success).toBe(true);
    expect(parsed.data.kapasitas_per_hari).toBe(0);
    expect(parsed.data.slot_tersedia).toBe(0);
    expect(parsed.data.ruang_praktik).toBe('Belum Ditentukan');
    expect(parsed.data.sesi_harian).toHaveLength(0);
  });

  it('validates reschedule eligibility response schema with target validation', () => {
    const rawResponse = {
      success: true,
      data: {
        isEligible: false,
        actionableGuidance: 'Sesi asal dalam status Tutup. Aktifkan sesi terlebih dahulu.',
        targetValidation: {
          isTargetEligible: false,
          conflictMessage:
            'Ruangan Poli KIA 1 sudah terisi oleh dokter lain pada jam 09:00 - 09:30 WIB.',
          projectedEndTime: '09:30'
        }
      }
    };

    const parsed = rescheduleEligibilityResponseSchema.parse(rawResponse);
    expect(parsed.success).toBe(true);
    expect(parsed.data.isEligible).toBe(false);
    expect(parsed.data.targetValidation?.isTargetEligible).toBe(false);
    expect(parsed.data.targetValidation?.conflictMessage).toContain('Poli KIA 1');
    expect(parsed.data.targetValidation?.projectedEndTime).toBe('09:30');
  });

  it('validates binary updateAdminDayByDate payload schema', () => {
    const payloadTutup = { status: 'Tutup', notes: 'Renovasi gedung' };
    const parsedTutup = updateAdminDayByDatePayloadSchema.parse(payloadTutup);
    expect(parsedTutup.status).toBe('Tutup');
    expect(parsedTutup.notes).toBe('Renovasi gedung');

    const payloadBuka = { status: 'Buka' };
    const parsedBuka = updateAdminDayByDatePayloadSchema.parse(payloadBuka);
    expect(parsedBuka.status).toBe('Buka');

    const payloadClosed = { status: 'CLOSED', notes: 'Dokter berhalangan' };
    const parsedClosed = updateAdminDayByDatePayloadSchema.parse(payloadClosed);
    expect(parsedClosed.status).toBe('CLOSED');

    const payloadOpen = { status: 'OPEN' };
    const parsedOpen = updateAdminDayByDatePayloadSchema.parse(payloadOpen);
    expect(parsedOpen.status).toBe('OPEN');
  });

  it('validates doctorDailySessionSchema with reschedule eligibility metadata', () => {
    const session = {
      id: 'session-123',
      nama_sesi: 'Sesi Pagi',
      jam_mulai: '08:00',
      jam_selesai: '08:30',
      kuota_pasien: 10,
      slot_tersedia: 5,
      status_sesi: 'Buka',
      ruang: 'Ruang Poli Umum 1',
      is_reschedule_eligible: true,
      reschedule_ineligibility_reason: null
    };

    const parsed = doctorDailySessionSchema.parse(session);
    expect(parsed.is_reschedule_eligible).toBe(true);
    expect(parsed.reschedule_ineligibility_reason).toBeNull();
  });

  it('validates updateAdminDayByDateResponseSchema for day closure cascading', () => {
    const rawResponse = {
      success: true,
      message:
        'Jadwal tanggal 2026-09-25 berhasil ditutup (4 sesi dinonaktifkan, 2 antrean dibatalkan)',
      data: {
        date: '2026-09-25',
        status: 'Tutup',
        affectedSessionsCount: 4,
        cancelledAppointmentsCount: 2
      }
    };

    const parsed = updateAdminDayByDateResponseSchema.parse(rawResponse);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.status).toBe('Tutup');
    expect(parsed.data?.affectedSessionsCount).toBe(4);
    expect(parsed.data?.cancelledAppointmentsCount).toBe(2);
  });

  it('validates adminSessionPatientsResponseSchema with demographics and capacity metrics', () => {
    const rawResponse = {
      success: true,
      data: {
        sessionId: 'sess-001',
        sessionLabel: 'Sesi Pagi',
        shift: 'morning',
        scheduleDate: '2026-09-24',
        startTime: '08:00',
        endTime: '12:00',
        capacity: 12,
        availableSlots: 10,
        bookedCount: 2,
        clinicRoom: {
          id: 'room-01',
          name: 'Poli Kebidanan, Ruang 102',
          floor: '1'
        },
        patients: [
          {
            appointmentId: 'apt-001',
            queueNumber: 'A-01',
            timeSlot: '08:00 - 08:30 WIB',
            patientName: 'Ny. Siti Aminah',
            chiefComplaint: 'Pemeriksaan Kehamilan Trimester 2',
            clinicRoomName: 'Poli Kebidanan, Ruang 102',
            status: 'waiting',
            statusLabel: 'Menunggu',
            statusBadge: 'Menunggu',
            isCancellable: true,
            patient: {
              id: 'pat-001',
              fullName: 'Ny. Siti Aminah',
              medicalRecordNumber: 'RM-2026-0901',
              nik: '3201123456780001',
              gender: 'Perempuan',
              birthDate: '1995-04-12',
              age: '31 tahun',
              phoneNumber: '081298765432',
              guardianName: 'Ahmad Fauzi (Suami)',
              address: 'Jl. Merdeka No. 45, RT 02/RW 05, Bandung'
            }
          }
        ]
      }
    };

    const parsed = adminSessionPatientsResponseSchema.parse(rawResponse);
    expect(parsed.sessionId).toBe('sess-001');
    expect(parsed.capacity).toBe(12);
    expect(parsed.bookedCount).toBe(2);
    expect(parsed.availableSlots).toBe(10);
    expect(parsed.patients).toHaveLength(1);

    const patient = parsed.patients[0];
    expect(patient.queueNumber).toBe('A-01');
    expect(patient.patient.fullName).toBe('Ny. Siti Aminah');
    expect(patient.patient.age).toBe('31 tahun');
    expect(patient.patient.nik).toBe('3201123456780001');
  });

  it('validates cancelAppointmentPayloadSchema and cancelAppointmentResponseSchema', () => {
    const payload = {
      cancellationReason: 'Pasien meminta pembatalan karena ada kendala transportasi',
      notifyPatient: true
    };
    const parsedPayload = cancelAppointmentPayloadSchema.parse(payload);
    expect(parsedPayload.cancellationReason).toContain('transportasi');
    expect(parsedPayload.notifyPatient).toBe(true);

    const rawResponse = {
      statusCode: 200,
      message: 'Janji temu berhasil dibatalkan dan slot sesi telah dikembalikan.',
      data: {
        appointmentId: 'apt-001',
        status: 'cancelled',
        sessionId: 'sess-001',
        availableSlotsRestored: 1,
        cancelledAt: '2026-09-24T09:40:00Z'
      }
    };
    const parsedResponse = cancelAppointmentResponseSchema.parse(rawResponse);
    expect(parsedResponse.statusCode).toBe(200);
    expect(parsedResponse.message).toContain('dibatalkan');
    expect(parsedResponse.data?.status).toBe('cancelled');
    expect(parsedResponse.data?.availableSlotsRestored).toBe(1);
  });

  it('validates updateAppointmentStatusPayloadSchema for clinical status transitions', () => {
    const statusInService = { status: 'in_service' as const };
    expect(updateAppointmentStatusPayloadSchema.parse(statusInService).status).toBe('in_service');

    const statusCompleted = { status: 'completed' as const, notes: 'Pemeriksaan USG normal' };
    const parsedCompleted = updateAppointmentStatusPayloadSchema.parse(statusCompleted);
    expect(parsedCompleted.status).toBe('completed');
    expect(parsedCompleted.notes).toBe('Pemeriksaan USG normal');
  });

  it('validates live backend reference options payload (Section 1)', () => {
    const liveReferenceOptions = {
      shifts: [
        {
          id: 'EARLY_MORNING',
          label: 'Dini Hari',
          shift: 'early_morning',
          startTime: '00:00',
          endTime: '06:00'
        },
        {
          id: 'MORNING',
          label: 'Pagi',
          shift: 'morning',
          startTime: '06:00',
          endTime: '12:00'
        },
        {
          id: 'AFTERNOON',
          label: 'Siang',
          shift: 'afternoon',
          startTime: '12:00',
          endTime: '18:00'
        },
        {
          id: 'NIGHT',
          label: 'Malam',
          shift: 'night',
          startTime: '18:00',
          endTime: '24:00'
        }
      ],
      statuses: [
        { id: 'OPEN', label: 'Buka' },
        { id: 'CLOSED', label: 'Tutup' }
      ],
      timeSlotIntervals: [30],
      effectiveConsultationDurationMinutes: 30,
      durationSource: 'CLINIC_CONFIG',
      durationScope: 'clinic-default',
      canonicalIntervalStatuses: [
        { id: 'OPEN', label: 'Buka' },
        { id: 'OCCUPIED', label: 'Terisi' },
        { id: 'CLOSED', label: 'Tutup' }
      ]
    };

    const parsed = scheduleReferenceOptionsResponseSchema.parse(liveReferenceOptions);
    expect(parsed.shifts).toHaveLength(4);
    expect(parsed.shifts[1].label).toBe('Pagi');
    expect(parsed.shifts[1].startTime).toBe('06:00');
    expect(parsed.shifts[1].endTime).toBe('12:00');
    expect(parsed.effectiveConsultationDurationMinutes).toBe(30);
    expect(parsed.statuses?.[0].label).toBe('Buka');
  });

  it('validates live backend schedule contexts payload (Section 2)', () => {
    const liveContexts = [
      {
        id: '18090b8f-1f06-444a-9b7e-9769dae131d2',
        name: 'Pagi',
        shift: 'morning',
        startTime: '06:00',
        endTime: '12:00',
        capacity: 12,
        slotIntervalMinutes: 30
      },
      {
        id: 'cf6619df-845b-4351-a968-07e0586e2467',
        name: 'Siang',
        shift: 'afternoon',
        startTime: '12:00',
        endTime: '18:00',
        capacity: 12,
        slotIntervalMinutes: 30
      }
    ];

    const parsed = scheduleContextsResponseSchema.parse(liveContexts);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].id).toBe('18090b8f-1f06-444a-9b7e-9769dae131d2');
    expect(parsed[0].shift).toBe('morning');
    expect(parsed[0].capacity).toBe(12);
  });

  it('validates live backend projection payload (Section 2)', () => {
    const liveProjection = {
      scheduleContextId: '18090b8f-1f06-444a-9b7e-9769dae131d2',
      shiftName: 'Pagi',
      startTime: '10:00',
      projectedEndTime: '12:00',
      slotDurationMinutes: 30,
      slotCount: 4,
      explanation:
        'Kapasitas 4 slot dihitung dari sisa waktu shift 120 menit dibagi durasi per pasien 30 menit.'
    };

    const parsed = scheduleProjectionResponseSchema.parse(liveProjection);
    expect(parsed.scheduleContextId).toBe('18090b8f-1f06-444a-9b7e-9769dae131d2');
    expect(parsed.projectedEndTime).toBe('12:00');
    expect(parsed.capacity).toBe(4);
    expect(parsed.slotCount).toBe(4);
    expect(parsed.slotDurationMinutes).toBe(30);
  });

  it('validates live backend call and complete appointment responses (Section 5)', () => {
    const callResponse = {
      success: true,
      data: {
        id: 'e44141cf-cb21-4fa3-95ee-2d8544d6db53',
        status: 'in_service',
        queueTicket: {
          ticketNumber: 'A-01',
          status: 'CALLED'
        }
      },
      message: 'Pasien Gilang Ramadhan berhasil dipanggil.'
    };
    const parsedCall = callAppointmentResponseSchema.parse(callResponse);
    expect(parsedCall.success).toBe(true);
    expect(parsedCall.data?.status).toBe('in_service');
    expect(parsedCall.message).toContain('berhasil dipanggil');

    const completeResponse = {
      success: true,
      data: {
        id: 'e44141cf-cb21-4fa3-95ee-2d8544d6db53',
        status: 'completed',
        completedAt: '2026-09-24T03:30:00.000Z'
      },
      message: 'Pemeriksaan pasien Gilang Ramadhan telah selesai.'
    };
    const parsedComplete = completeAppointmentResponseSchema.parse(completeResponse);
    expect(parsedComplete.success).toBe(true);
    expect(parsedComplete.data?.status).toBe('completed');
    expect(parsedComplete.message).toContain('telah selesai');
  });

  it('validates live backend reschedule eligibility payload (Section 6)', () => {
    const liveEligibility = {
      isEligible: true,
      sourceSession: {
        id: '99b8adba-b0e3-4015-9ddd-363a1d75d34d',
        date: '2026-09-24',
        shift: 'morning',
        startTime: '06:00',
        endTime: '12:00',
        activeAppointmentsCount: 2
      },
      targetSimulation: {
        targetDate: '2026-09-25',
        targetShift: 'morning',
        targetStartTime: '06:00',
        projectedEndTime: '12:00',
        maxShiftCapacity: 12,
        availableSlotCount: 12,
        willFit: true
      },
      affectedPatients: [
        {
          appointmentId: 'e44141cf-cb21-4fa3-95ee-2d8544d6db53',
          patientName: 'Gilang Ramadhan',
          currentSlot: '06:00 - 06:30',
          projectedNewSlot: '06:00 - 06:30'
        }
      ]
    };

    const parsed = rescheduleEligibilityResponseSchema.parse(liveEligibility);
    expect(parsed.data.isEligible).toBe(true);
    expect(parsed.data.targetValidation?.isTargetEligible).toBe(true);
    expect(parsed.data.targetValidation?.projectedEndTime).toBe('12:00');
    expect(parsed.data.targetSimulation?.availableSlotCount).toBe(12);
    expect(parsed.data.affectedPatients).toHaveLength(1);
  });

  it('validates scheduleSlotAvailabilityResponseSchema with 12 pre-rendered slots', () => {
    const slotPayload = {
      date: '2026-09-25',
      shift: 'malam',
      roomId: 'room-uuid-01',
      slots: [
        {
          slotIndex: 0,
          time: '18:00',
          endTime: '18:30',
          status: 'OCCUPIED_BY_OTHER',
          isAvailable: false,
          displayLabel: '18:00 - 18:30 (Terisi)',
          conflict: {
            type: 'ROOM_OCCUPIED',
            message: 'Ruangan telah digunakan oleh dr. Budi Santoso',
            practitionerName: 'dr. Budi Santoso'
          }
        },
        {
          slotIndex: 1,
          time: '18:30',
          endTime: '19:00',
          status: 'AVAILABLE',
          isAvailable: true,
          displayLabel: '18:30 - 19:00 (Tersedia)',
          conflict: null
        }
      ]
    };

    const parsed = scheduleSlotAvailabilityResponseSchema.parse(slotPayload);
    expect(parsed.date).toBe('2026-09-25');
    expect(parsed.shift).toBe('malam');
    expect(parsed.slots).toHaveLength(2);
    expect(parsed.slots[0].isAvailable).toBe(false);
    expect(parsed.slots[1].isAvailable).toBe(true);
    expect(parsed.slots[0].conflict?.message).toBe('Ruangan telah digunakan oleh dr. Budi Santoso');
  });
});
