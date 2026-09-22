import 'server-only';
import { z } from 'zod';

export const patientAddressDetailDtoSchema = z.object({
  id: z.string().optional(),
  type: z.string().optional(),
  provinceCode: z.string().nullable().optional(),
  provinceName: z.string().nullable().optional(),
  regencyCode: z.string().nullable().optional(),
  regencyName: z.string().nullable().optional(),
  districtCode: z.string().nullable().optional(),
  districtName: z.string().nullable().optional(),
  villageCode: z.string().nullable().optional(),
  villageName: z.string().nullable().optional(),
  line1: z.string().optional(),
  fullAddress: z.string().optional(),
  isPrimary: z.boolean().optional()
});

export const patientEmergencyContactDetailDtoSchema = z.object({
  id: z.string().optional(),
  name: z.string().nullable().optional(),
  phone: z.string().optional(),
  relationship: z.string().nullable().optional(),
  notes: z.string().nullable().optional()
});

export const patientProfileDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  medicalRecordNumber: z.string(),
  nik: z.string(),
  fullName: z.string(),
  gender: z.string(),
  birthPlace: z.string().nullable().optional(),
  birthDate: z.string().nullable().optional(),
  bloodType: z.string().nullable().optional(),
  namaIbuKandung: z.string().nullable().optional(),
  pekerjaan: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  alamatDetail: z.string().nullable().optional(),
  provinsi: z.string().nullable().optional(),
  provinsiId: z.string().nullable().optional(),
  kabupaten: z.string().nullable().optional(),
  kabupatenId: z.string().nullable().optional(),
  kecamatan: z.string().nullable().optional(),
  kecamatanId: z.string().nullable().optional(),
  kelurahan: z.string().nullable().optional(),
  kelurahanId: z.string().nullable().optional(),
  addressDetail: patientAddressDetailDtoSchema.nullable().optional(),
  emergencyContactName: z.string().nullable().optional(),
  emergencyContactPhone: z.string().nullable().optional(),
  emergencyContactRelationship: z.string().nullable().optional(),
  emergencyContactDetail: patientEmergencyContactDetailDtoSchema.nullable().optional(),
  allergies: z.array(z.any()).optional(),
  medicalHistory: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  status: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const updatePatientProfileRequestDtoSchema = z.object({
  fullName: z.string().optional(),
  name: z.string().optional(),
  nik: z.string().optional(),
  namaIbuKandung: z.string().optional(),
  nama_ibu_kandung: z.string().optional(),
  birthPlace: z.string().optional(),
  tempat_lahir: z.string().optional(),
  birthDate: z.string().optional(),
  birth_date: z.string().optional(),
  gender: z.enum(['Laki-laki', 'Perempuan']).optional(),
  bloodType: z.enum(['A', 'B', 'AB', 'O', 'Belum Tahu']).optional(),
  blood_type: z.enum(['A', 'B', 'AB', 'O', 'Belum Tahu']).optional(),
  phoneNumber: z.string().optional(),
  phone: z.string().optional(),
  pekerjaan: z.string().optional(),
  address: z.string().optional(),
  alamatDetail: z.string().optional(),
  alamat_detail: z.string().optional(),
  provinsi: z.string().optional(),
  provinsiId: z.string().optional(),
  provinsi_id: z.string().optional(),
  kabupaten: z.string().optional(),
  kabupatenId: z.string().optional(),
  kabupaten_id: z.string().optional(),
  kecamatan: z.string().optional(),
  kecamatanId: z.string().optional(),
  kecamatan_id: z.string().optional(),
  kelurahan: z.string().optional(),
  kelurahanId: z.string().optional(),
  kelurahan_id: z.string().optional(),
  emergencyContactName: z.string().optional(),
  nama_kontak_darurat: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  nomor_kontak_darurat: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  hubungan_kontak_darurat: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  medicalHistory: z.string().optional(),
  avatarUrl: z.string().optional()
});

export type PatientAddressDetailDto = z.infer<typeof patientAddressDetailDtoSchema>;
export type PatientEmergencyContactDetailDto = z.infer<
  typeof patientEmergencyContactDetailDtoSchema
>;
export type PatientProfileDto = z.infer<typeof patientProfileDtoSchema>;
export type UpdatePatientProfileRequestDto = z.infer<typeof updatePatientProfileRequestDtoSchema>;
