import { describe, it, expect, mock } from 'bun:test';
import { resolveSlotPatient, buildSlotAppointment } from '@/features/jadwal-dokter/utils/slot-patient-resolver';
import type { BookedPatientItem, OccupancySlot } from '@/server/contracts/schedules/doctor-schedules.dto';
import type { DoctorDailySession, DoctorSchedule } from '@/features/jadwal-dokter/api/types';
import type { QueryClient } from '@tanstack/react-query';

describe('Slot Patient Resolver Utility', () => {
  const mockDoctor: DoctorSchedule = {
    id: 'doc-123',
    nama_dokter: 'dr. Andi Pratama',
    spesialisasi: 'Poli Umum',
    ruang_praktik: 'Ruang 1',
    sesi_harian: []
  };

  const mockSession: DoctorDailySession = {
    id: 'ses-456',
    nama_sesi: 'Pagi',
    jam_mulai: '08:00',
    jam_selesai: '12:00',
    kuota_pasien: 10,
    slot_tersedia: 5,
    status_sesi: 'OPEN'
  };

  const mockPatient: BookedPatientItem = {
    appointmentId: 'apt-789',
    patient: {
      id: 'pat-1',
      fullName: 'Siti Aminah',
      email: 'siti@example.com',
      phoneNumber: '08123456789'
    },
    queueNumber: 'A-01',
    timeSlot: '08:00 - 08:30 WIB',
    status: 'waiting',
    statusBadge: 'MENUNGGU',
    serviceName: 'Konsultasi Dokter Umum',
    roomName: 'Ruang 1'
  };

  const mockSlot: OccupancySlot = {
    slotIndex: 0,
    startTime: '08:00',
    endTime: '08:30',
    status: 'OCCUPIED',
    appointmentRef: {
      appointmentId: 'apt-789',
      queueNumber: 'A-01',
      status: 'MENUNGGU',
      patientName: 'Siti Aminah'
    }
  };

  it('resolves patient from cache when available', async () => {
    const fetchQueryMock = mock();
    const mockQueryClient = {
      getQueryData: mock().mockReturnValue({ patients: [mockPatient] }),
      fetchQuery: fetchQueryMock
    } as unknown as QueryClient;

    const result = await resolveSlotPatient(mockQueryClient, 'doc-123', mockSession, mockSlot);

    expect(result).not.toBeNull();
    expect(result?.appointmentId).toBe('apt-789');
    expect(result?.patient.fullName).toBe('Siti Aminah');
    expect(fetchQueryMock).not.toHaveBeenCalled();
  });

  it('fetches patient from network when not found in cache', async () => {
    const fetchQueryMock = mock().mockResolvedValue({ patients: [mockPatient] });
    const mockQueryClient = {
      getQueryData: mock().mockReturnValue(undefined),
      fetchQuery: fetchQueryMock
    } as unknown as QueryClient;

    const result = await resolveSlotPatient(mockQueryClient, 'doc-123', mockSession, mockSlot);

    expect(result).not.toBeNull();
    expect(result?.appointmentId).toBe('apt-789');
    expect(fetchQueryMock).toHaveBeenCalledTimes(1);
  });

  it('returns null when patient is not found in cache or network', async () => {
    const mockQueryClient = {
      getQueryData: mock().mockReturnValue(undefined),
      fetchQuery: mock().mockResolvedValue({ patients: [] })
    } as unknown as QueryClient;

    const emptySlot: OccupancySlot = {
      slotIndex: 1,
      startTime: '08:30',
      endTime: '09:00',
      status: 'AVAILABLE'
    };

    const result = await resolveSlotPatient(mockQueryClient, 'doc-123', mockSession, emptySlot);

    expect(result).toBeNull();
  });

  it('constructs canonical Appointment correctly via buildSlotAppointment', () => {
    const appointment = buildSlotAppointment(
      mockPatient,
      mockDoctor,
      mockSession,
      '2026-10-06'
    );

    expect(appointment.id).toBe('apt-789');
    expect(appointment.patient_name).toBe('Siti Aminah');
    expect(appointment.doctor_name).toBe('dr. Andi Pratama');
    expect(appointment.doctor_specialty).toBe('Poli Umum');
    expect(appointment.room_name).toBe('Ruang 1');
    expect(appointment.date).toBe('2026-10-06');
    expect(appointment.queue_number).toBe('A-01');
    expect(appointment.status).toBe('Menunggu');
  });
});
