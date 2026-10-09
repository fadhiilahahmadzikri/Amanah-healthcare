import { describe, expect, it } from 'bun:test';
import { normalizeFilters } from '@/features/appointment-pasien/api/types';
import { appointmentKeys } from '@/features/appointment-pasien/api/query-keys';
import { appointmentQueryOptions } from '@/features/appointment-pasien/api/queries';
import {
  mapToAdminAppointment,
  computeSummary,
  emptyAppointmentSummary
} from '@/features/appointment-pasien/api/mapper';
import type { BackendAppointmentRecord } from '@/features/appointment-pasien/api/types';

describe('AppointmentDataFetchingArchitecture', () => {
  it('should normalize filters deterministically for identical query keys', () => {
    const rawA = {
      page: 1,
      limit: 10,
      search: '  ahmad  ',
      status: ['WAITING', 'IN_SERVICE'],
      poli: 'Umum'
    };

    const rawB = {
      page: 1,
      limit: 10,
      search: 'ahmad',
      status: ['IN_SERVICE', 'WAITING'],
      poli: ['Umum']
    };

    const normalizedA = normalizeFilters(rawA);
    const normalizedB = normalizeFilters(rawB);

    expect(normalizedA).toEqual(normalizedB);
    expect(appointmentKeys.list(rawA)).toEqual(appointmentKeys.list(rawB));
  });

  it('should fallback invalid page or limit to defaults in normalizeFilters', () => {
    const normalized = normalizeFilters({ page: -5, limit: 0, search: '' });

    expect(normalized.page).toBe(1);
    expect(normalized.limit).toBe(10);
    expect(normalized.search).toBeUndefined();
  });

  it('should configure appointmentQueryOptions with 30s staleTime', () => {
    const options = appointmentQueryOptions({ page: 1, limit: 10 });

    expect(options.queryKey).toEqual(['admin-appointments', 'list', { page: 1, limit: 10 }]);
    expect(options.staleTime).toBe(30000);
  });

  it('should correctly map BackendAppointmentRecord to AdminAppointment DTO', () => {
    const record: BackendAppointmentRecord = {
      id: 'apt-101',
      status: 'waiting',
      patientName: 'Fadhiilah Ahmad Zikri',
      doctorName: 'dr. Budi Santoso',
      poliklinikName: 'Poli Umum',
      queueNumber: 'A-01',
      appointmentDate: '2026-10-06',
      scheduledStartTime: '08:00',
      patientId: 'pat-1',
      gender: 'male',
      phone: '08123456789',
      complaint: 'Demam dan flu'
    };

    const mapped = mapToAdminAppointment(record);

    expect(mapped.id).toBe('apt-101');
    expect(mapped.status).toBe('WAITING');
    expect(mapped.patientName).toBe('Fadhiilah Ahmad Zikri');
    expect(mapped.doctorName).toBe('dr. Budi Santoso');
    expect(mapped.poliklinikName).toBe('Poli Umum');
    expect(mapped.queueNumber).toBe('A-01');
    expect(mapped.gender).toBe('Laki-laki');
    expect(mapped.allowedActions).toEqual(['CALL', 'START_SERVICE', 'CANCEL']);
  });

  it('should preserve formatted queue number with prefix from backend record', () => {
    const recordUmum = mapToAdminAppointment({
      id: 'apt-um',
      status: 'waiting',
      queueNumber: 'UM-001'
    });
    expect(recordUmum.queueNumber).toBe('UM-001');

    const recordKia = mapToAdminAppointment({
      id: 'apt-kia',
      status: 'waiting',
      queueNumber: 'BD-001'
    });
    expect(recordKia.queueNumber).toBe('BD-001');
  });

  it('should compute summary accurately from mapped appointments', () => {
    expect(computeSummary([])).toEqual(emptyAppointmentSummary);

    const recordA = mapToAdminAppointment({ id: '1', status: 'WAITING' });
    const recordB = mapToAdminAppointment({ id: '2', status: 'IN_SERVICE' });
    const recordC = mapToAdminAppointment({ id: '3', status: 'COMPLETED' });

    const summary = computeSummary([recordA, recordB, recordC]);

    expect(summary.total).toBe(3);
    expect(summary.waiting).toBe(1);
    expect(summary.inService).toBe(1);
    expect(summary.completed).toBe(1);
    expect(summary.cancelled).toBe(0);
    expect(summary.late).toBe(0);
  });

  it('should map unassigned doctor and room to null without fake fallbacks', () => {
    const unassignedRecord: BackendAppointmentRecord = {
      id: 'apt-unassigned-1',
      status: 'waiting',
      patientName: 'Siti Aminah',
      queueNumber: 'A-02',
      appointmentDate: '2026-10-10',
      scheduledStartTime: '09:00'
    };

    const mapped = mapToAdminAppointment(unassignedRecord);

    expect(mapped.doctorName).toBeNull();
    expect(mapped.roomName).toBeNull();
    expect(mapped.doctorSpecialty).toBeNull();
  });

  it('should normalize doctorName, roomName, and date filters deterministically', () => {
    const raw = {
      page: 1,
      limit: 10,
      doctorName: ['dr. Siti Rahma', 'dr. Budi Santoso'],
      roomName: ['Ruang 102', 'Ruang 101'],
      date: '2026-10-10',
      session: 'pagi'
    };

    const normalized = normalizeFilters(raw);

    expect(normalized.doctorName).toEqual(['dr. Budi Santoso', 'dr. Siti Rahma']);
    expect(normalized.roomName).toEqual(['Ruang 101', 'Ruang 102']);
    expect(normalized.date).toBe('2026-10-10');
    expect(normalized.session).toBe('pagi');
  });

  it('should map actualStartedAt, actualCompletedAt, and consultationDurationFormatted', () => {
    const record: BackendAppointmentRecord = {
      id: 'apt-duration-1',
      status: 'completed',
      actualStartedAt: '2026-10-10T10:00:00.000Z',
      actualCompletedAt: '2026-10-10T10:15:30.000Z',
      consultationElapsedSeconds: 930,
      consultationDurationFormatted: '15 Menit 30 Dtk'
    };

    const mapped = mapToAdminAppointment(record);

    expect(mapped.actualStartedAt).toBe('2026-10-10T10:00:00.000Z');
    expect(mapped.actualCompletedAt).toBe('2026-10-10T10:15:30.000Z');
    expect(mapped.consultationDurationFormatted).toBe('15 Menit 30 Dtk');
    expect(mapped.consultationElapsedSeconds).toBe(930);
  });
});
