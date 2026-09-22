import { describe, expect, mock, test } from 'bun:test';

mock.module('server-only', () => ({}));

const { patientRegistrationRequestDtoSchema, patientRegistrationResponseDtoSchema } =
  await import('./patient-registration.dto');

const validRequest = {
  name: 'Budi Santoso',
  nik: '3201234567890001',
  nama_ibu_kandung: 'Siti Aminah',
  tempat_lahir: 'Bogor',
  birth_date: '1995-08-17',
  gender: 'Laki-laki',
  blood_type: 'O',
  provinsi: 'Jawa Barat',
  provinsi_id: '32',
  kabupaten: 'Bogor',
  kabupaten_id: '3201',
  kecamatan: 'Cibinong',
  kecamatan_id: '320101',
  kelurahan: 'Pakansari',
  kelurahan_id: '3201011001',
  alamat_detail: 'Jl. Raya Stadion Pakansari No. 12 RT 03/RW 05',
  pekerjaan: 'Karyawan Swasta',
  phone: '081234567890'
} as const;

const validResponse = {
  id: '5a1cc677-8fa3-451d-bf11-cf416e3a3bf6',
  userId: '56d3dcb6-4dae-4653-9884-88d45758f51a',
  medicalRecordNumber: 'RM-202609-0002',
  nik: '3201234567890001',
  fullName: 'Budi Santoso',
  gender: 'Laki-laki',
  birthPlace: 'Bogor',
  birthDate: '1995-08-17',
  bloodType: 'O',
  namaIbuKandung: 'Siti Aminah',
  pekerjaan: 'Karyawan Swasta',
  phoneNumber: '081234567890',
  address:
    'Jl. Raya Stadion Pakansari No. 12 RT 03/RW 05, Kel. Pakansari, Kec. Cibinong, Bogor, Prov. Jawa Barat',
  createdAt: '2026-09-19T15:28:27.234Z',
  updatedAt: '2026-09-19T15:28:27.234Z'
};

describe('Patient Registration Contracts', () => {
  test('validates correct patient registration request payload', () => {
    const result = patientRegistrationRequestDtoSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  test('rejects registration request when NIK is not 16 digits', () => {
    const result = patientRegistrationRequestDtoSchema.safeParse({
      ...validRequest,
      nik: '12345'
    });
    expect(result.success).toBe(false);
  });

  test('validates 201 Created patient registration response DTO', () => {
    const result = patientRegistrationResponseDtoSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.medicalRecordNumber).toBe('RM-202609-0002');
      expect(result.data.nik).toBe('3201234567890001');
    }
  });
});
