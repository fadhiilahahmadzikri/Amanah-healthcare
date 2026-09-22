import { describe, expect, it } from 'vitest';
import {
  adminDoctorScheduleFilterOptionsSchema,
  updateAdminDoctorSessionPayloadSchema,
  deleteAdminDoctorSessionResponseSchema,
  adminDoctorScheduleDetailResponseSchema
} from './doctor-schedules.dto';

describe('Admin Doctor Schedules Contract DTOs', () => {
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
          { id: 'd1e7c992-0b1a-4f51-b0e2-a7cfb62e49c8', name: 'Spesialis Penyakit Dalam', code: 'sp_pd' }
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
        monthly_schedule: [
          { day: 1, date: '2026-09-01', status: 'Tutup', notes: null }
        ],
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
});
