import { describe, expect, it } from 'vitest';
import {
  mapToAdminAppointment,
  adminAppointmentToAppointment
} from '@/features/appointment-pasien/api/mapper';
import type { BackendAppointmentRecord } from '@/features/appointment-pasien/api/types';

describe('Appointment Mappers Contract Parity', () => {
  const mockBackendRecord: BackendAppointmentRecord = {
    id: 'test-apt-123',
    patientName: 'Ahmad Fauzi',
    poliklinikId: 'poli-123',
    poliklinikName: 'Poli Umum',
    categoryId: 'cat-456',
    categoryName: 'Pelayanan Dokter Umum',
    layananId: 'svc-789',
    layananName: 'Pemeriksaan Dokter Umum',
    status: 'BOOKED',
    scheduledStartTime: '08:00:00',
    doctorName: 'dr. Zikri',
    doctorId: 'doc-1',
    staffId: 'staff-1',
    medicalFlow: null
  };

  it('maps backend record to AdminAppointment preserving categoryId and categoryName', () => {
    const adminApt = mapToAdminAppointment(mockBackendRecord);
    expect(adminApt.poliklinikId).toBe('poli-123');
    expect(adminApt.poliklinikName).toBe('Poli Umum');
    expect(adminApt.categoryId).toBe('cat-456');
    expect(adminApt.categoryName).toBe('Pelayanan Dokter Umum');
    expect(adminApt.layananId).toBe('svc-789');
    expect(adminApt.layananName).toBe('Pemeriksaan Dokter Umum');
  });

  it('adapts AdminAppointment to Appointment preserving all relational fields', () => {
    const adminApt = mapToAdminAppointment(mockBackendRecord);
    const appointment = adminAppointmentToAppointment(adminApt);
    expect(appointment.poliklinik_id).toBe('poli-123');
    expect(appointment.poliklinik_name).toBe('Poli Umum');
    expect(appointment.category_id).toBe('cat-456');
    expect(appointment.category_name).toBe('Pelayanan Dokter Umum');
    expect(appointment.layanan_id).toBe('svc-789');
    expect(appointment.service).toBe('Pemeriksaan Dokter Umum');
    expect(appointment.doctor_id).toBe('doc-1');
    expect(appointment.staff_id).toBe('staff-1');
  });
});
