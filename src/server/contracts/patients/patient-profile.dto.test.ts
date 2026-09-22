import { describe, it, expect, mock } from 'bun:test';

mock.module('server-only', () => ({}));

const { patientProfileDtoSchema, updatePatientProfileRequestDtoSchema } = await import(
  './patient-profile.dto'
);

const validPatientProfile = {
  id: '564aa704-3fbb-4cc7-a6ef-70fb155f2fa9',
  userId: 'a376b0aa-6ff3-48d4-a970-ade3d1923a59',
  medicalRecordNumber: 'RM-202609-0006',
  nik: '3201789838515153',
  fullName: 'Ahmad Dahlan',
  gender: 'Laki-laki',
  birthPlace: 'Bandung',
  birthDate: '1992-08-17',
  bloodType: 'O',
  namaIbuKandung: 'Maryam',
  pekerjaan: 'Software Engineer',
  phoneNumber: '081234567890',
  address:
    'Jl. Dipati Ukur No. 45 RT 03 RW 02, Kel. Dago, Kec. Coblong, Kota Bandung, Prov. Jawa Barat',
  alamatDetail: 'Jl. Dipati Ukur No. 45 RT 03 RW 02',
  provinsi: 'Jawa Barat',
  provinsiId: '32',
  kabupaten: 'Kota Bandung',
  kabupatenId: '3273',
  kecamatan: 'Coblong',
  kecamatanId: '327301',
  kelurahan: 'Dago',
  kelurahanId: '3273011001',
  addressDetail: {
    id: '31b1c3bb-ff11-4ca0-98fe-dcf176211822',
    type: 'domicile',
    provinceCode: '32',
    provinceName: 'Jawa Barat',
    regencyCode: '3273',
    regencyName: 'Kota Bandung',
    districtCode: '327301',
    districtName: 'Coblong',
    villageCode: '3273011001',
    villageName: 'Dago',
    line1: 'Jl. Dipati Ukur No. 45 RT 03 RW 02',
    fullAddress:
      'Jl. Dipati Ukur No. 45 RT 03 RW 02, Kel. Dago, Kec. Coblong, Kota Bandung, Prov. Jawa Barat',
    isPrimary: true
  },
  emergencyContactName: 'Fatimah Azzahra',
  emergencyContactPhone: '081987654321',
  emergencyContactRelationship: 'Istri',
  emergencyContactDetail: {
    id: 'e81d77a2-11a5-423f-b631-fef123456789',
    name: 'Fatimah Azzahra',
    phone: '081987654321',
    relationship: 'Istri',
    notes: null
  },
  allergies: [],
  medicalHistory: null,
  avatarUrl: null,
  status: 'active',
  createdAt: '2026-09-19T17:21:55.123Z',
  updatedAt: '2026-09-19T17:21:55.123Z'
};

describe('Patient Profile DTO Contracts', () => {
  it('validates 200 OK patient profile response with full 17 attributes', () => {
    const result = patientProfileDtoSchema.safeParse(validPatientProfile);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.medicalRecordNumber).toBe('RM-202609-0006');
      expect(result.data.nik).toBe('3201789838515153');
      expect(result.data.namaIbuKandung).toBe('Maryam');
      expect(result.data.emergencyContactName).toBe('Fatimah Azzahra');
      expect(result.data.emergencyContactRelationship).toBe('Istri');
      expect(result.data.addressDetail?.villageName).toBe('Dago');
    }
  });

  it('validates update patient profile request with partial fields', () => {
    const updatePayload = {
      fullName: 'Ahmad Dahlan M.T.',
      pekerjaan: 'Principal Software Architect',
      emergencyContactName: 'Fatimah Azzahra',
      emergencyContactRelationship: 'Istri',
      alamatDetail: 'Jl. Ir. H. Juanda No. 99 RT 01 RW 01',
      bloodType: 'O' as const
    };

    const result = updatePatientProfileRequestDtoSchema.safeParse(updatePayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.fullName).toBe('Ahmad Dahlan M.T.');
      expect(result.data.pekerjaan).toBe('Principal Software Architect');
      expect(result.data.bloodType).toBe('O');
    }
  });
});
