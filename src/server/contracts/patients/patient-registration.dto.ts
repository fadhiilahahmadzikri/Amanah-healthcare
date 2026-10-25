import 'server-only';
import { z } from 'zod';

export const patientRegistrationRequestDtoSchema = z.object({
  name: z.string().trim().min(3),
  nik: z
    .string()
    .trim()
    .regex(/^\d{16}$/),
  motherName: z.string().trim().min(3),
  birthPlace: z.string().trim().min(2),
  birthDate: z.string().trim().min(1),
  gender: z.enum(['male', 'female']),
  bloodType: z.string().trim().min(1),
  provinceName: z.string().trim().min(1),
  provinceCode: z.string().trim().min(1),
  regencyName: z.string().trim().min(1),
  regencyCode: z.string().trim().min(1),
  districtName: z.string().trim().min(1),
  districtCode: z.string().trim().min(1),
  villageName: z.string().trim().min(1),
  villageCode: z.string().trim().min(1),
  line1: z.string().trim().min(5),
  occupation: z.string().trim().min(2),
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
  motherName: z.string().nullable().optional(),
  occupation: z.string().nullable().optional(),
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
