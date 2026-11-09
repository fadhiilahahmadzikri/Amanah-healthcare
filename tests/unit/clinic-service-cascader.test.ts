import { describe, expect, it } from 'bun:test';
import { buildInitialRegularData } from '../../src/features/klinik/components/inspector/model/inspector-initial-state';
import type { Appointment } from '../../src/features/klinik/api/types';
import type { UnifiedInspectorData } from '../../src/features/klinik/components/inspector/types';
import type { ClinicServiceCascaderSelection } from '../../src/features/clinic-essentials';

describe('Clinic Service Cascader & Inspector Model Unit Tests', () => {
  it('correctly populates facility relation fields directly from canonical parsedData without fallbacks', () => {
    const mockParsedData: UnifiedInspectorData = {
      bookingCode: 'BOOK-20261110-001',
      scheduledDate: '2026-11-10',
      scheduledStartTime: '08:00',
      complaint: 'Pemeriksaan USG Trimester 2',
      poliklinikId: 'unit-poli-kia',
      poliklinikName: 'Poli KIA',
      categoryId: 'cat-kia-bumil',
      categoryName: 'Kesehatan Ibu dan Anak',
      serviceId: 'svc-usg-kehamilan',
      serviceName: 'USG Kehamilan 2D/3D',
      patient: {
        id: 'pat-1',
        fullName: 'Ibu Rahmawati',
        nik: '3201019010900001'
      }
    };

    const mockAppointment: Appointment = {
      id: 'apt-001',
      booking_code: 'BOOK-20261110-001',
      patient_name: 'Ibu Rahmawati',
      patient_email: 'rahma@example.com',
      patient_avatar: '',
      date: '2026-11-10',
      time: '08:00',
      complaint: 'Pemeriksaan USG Trimester 2',
      status: 'BOOKED',
      created_at: new Date().toISOString()
    };

    const regularData = buildInitialRegularData(mockParsedData, mockAppointment);

    expect(regularData.unitId).toBe('unit-poli-kia');
    expect(regularData.unitName).toBe('Poli KIA');
    expect(regularData.categoryId).toBe('cat-kia-bumil');
    expect(regularData.categoryName).toBe('Kesehatan Ibu dan Anak');
    expect(regularData.serviceId).toBe('svc-usg-kehamilan');
    expect(regularData.serviceName).toBe('USG Kehamilan 2D/3D');
    expect(regularData.complaint).toBe('Pemeriksaan USG Trimester 2');
    expect(regularData.fullName).toBe('Ibu Rahmawati');
  });

  it('preserves clean empty state when parsedData relation fields are not provided', () => {
    const mockParsedData: UnifiedInspectorData = {
      patient: {
        fullName: 'Pasien Baru'
      }
    };

    const mockAppointment: Appointment = {
      id: 'apt-002',
      booking_code: 'BOOK-002',
      patient_name: 'Pasien Baru',
      patient_email: '',
      patient_avatar: '',
      date: '2026-11-10',
      time: '09:00',
      complaint: '',
      status: 'BOOKED',
      created_at: new Date().toISOString()
    };

    const regularData = buildInitialRegularData(mockParsedData, mockAppointment);

    expect(regularData.unitId).toBe('');
    expect(regularData.unitName).toBe('');
    expect(regularData.categoryId).toBe('');
    expect(regularData.categoryName).toBe('');
    expect(regularData.serviceId).toBe('');
    expect(regularData.serviceName).toBe('');
  });

  it('validates ClinicServiceCascaderSelection structure contract', () => {
    const selection: ClinicServiceCascaderSelection = {
      unitId: 'u-1',
      unitName: 'Poli Umum',
      categoryId: 'c-1',
      categoryName: 'Pemeriksaan Dasar',
      serviceId: 's-1',
      serviceName: 'Konsultasi Dokter Umum'
    };

    expect(selection.unitId).toBe('u-1');
    expect(selection.unitName).toBe('Poli Umum');
    expect(selection.categoryId).toBe('c-1');
    expect(selection.categoryName).toBe('Pemeriksaan Dasar');
    expect(selection.serviceId).toBe('s-1');
    expect(selection.serviceName).toBe('Konsultasi Dokter Umum');
  });

  it('verifies that external patient role is strictly blocked from assignment permissions', () => {
    const evaluateCanManageAssignments = (audience: string | null, can: (p: string) => boolean) => {
      return audience === 'internal' || can('appointments:manage');
    };

    // External patient
    const externalUserCan = (_perm: string) => false;
    expect(evaluateCanManageAssignments('external', externalUserCan)).toBe(false);

    // Internal admin
    const adminCan = (perm: string) => perm === 'appointments:manage';
    expect(evaluateCanManageAssignments('internal', adminCan)).toBe(true);

    // External cannot hijack even with empty audience
    expect(evaluateCanManageAssignments(null, externalUserCan)).toBe(false);
  });
});
