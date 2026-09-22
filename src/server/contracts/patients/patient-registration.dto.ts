import 'server-only';
import { z } from 'zod';

export const patientRegistrationRequestDtoSchema = z.object({
  name: z.string().trim().min(3),
  nik: z
    .string()
    .trim()
    .regex(/^\d{16}$/),
  nama_ibu_kandung: z.string().trim().min(3),
  tempat_lahir: z.string().trim().min(2),
  birth_date: z.string().trim().min(1),
  gender: z.enum(['Laki-laki', 'Perempuan']),
  blood_type: z.enum(['A', 'B', 'AB', 'O', 'Belum Tahu']),
  provinsi: z.string().trim().min(1),
  provinsi_id: z.string().trim().min(1),
  kabupaten: z.string().trim().min(1),
  kabupaten_id: z.string().trim().min(1),
  kecamatan: z.string().trim().min(1),
  kecamatan_id: z.string().trim().min(1),
  kelurahan: z.string().trim().min(1),
  kelurahan_id: z.string().trim().min(1),
  alamat_detail: z.string().trim().min(5),
  pekerjaan: z.string().trim().min(2),
  phone: z.string().optional()
});

export const patientRegistrationResponseDtoSchema = z.object({
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
  emergencyContactName: z.string().nullable().optional(),
  emergencyContactPhone: z.string().nullable().optional(),
  allergies: z.array(z.string()).optional(),
  medicalHistory: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export type PatientRegistrationRequestDto = z.infer<typeof patientRegistrationRequestDtoSchema>;
export type PatientRegistrationResponseDto = z.infer<typeof patientRegistrationResponseDtoSchema>;
