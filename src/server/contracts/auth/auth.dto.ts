import 'server-only';
import { z } from 'zod';

export const staffProfileDtoSchema = z.object({
  id: z.string(),
  practitionerId: z.string().nullable().optional(),
  userId: z.string(),
  poliklinikId: z.string().nullable().optional(),
  fullName: z.string(),
  profession: z.string().nullable().optional(),
  idCardNumber: z.string().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  isActive: z.boolean()
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
  phoneNumber: z.string().nullable().optional(),
  status: z.string().optional()
});

export const roleDtoSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string().optional(),
  code: z.string().optional()
});

export const authenticatedUserDtoSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().nullable().optional(),
  systemRole: z.enum(['ADMIN', 'STAF', 'PATIENT']).optional(),
  role: roleDtoSchema.optional(),
  userRoles_userId: z
    .array(
      z.object({
        id: z.string().optional(),
        userId: z.string().optional(),
        roleId: z.string().optional(),
        role: z
          .object({
            id: z.union([z.string(), z.number()]),
            code: z.string().optional(),
            name: z.string().optional()
          })
          .optional()
      })
    )
    .optional(),
  staff: staffProfileDtoSchema.nullable().optional(),
  staffProfiles: z.array(z.any()).optional(),
  patient: patientProfileDtoSchema.nullable().optional(),
  patientProfiles: z.array(z.any()).optional()
});

export const loginResponseDtoSchema = z.object({
  token: z.string(),
  refreshToken: z.string(),
  tokenExpires: z.number(),
  user: authenticatedUserDtoSchema
});

export const refreshResponseDtoSchema = z.object({
  token: z.string(),
  refreshToken: z.string(),
  tokenExpires: z.number()
});

export const noContentDtoSchema = z.void().or(z.null()).or(z.undefined());

export type StaffProfileDto = z.infer<typeof staffProfileDtoSchema>;
export type PatientProfileDto = z.infer<typeof patientProfileDtoSchema>;
export type AuthenticatedUserDto = z.infer<typeof authenticatedUserDtoSchema>;
export type LoginResponseDto = z.infer<typeof loginResponseDtoSchema>;
export type RefreshResponseDto = z.infer<typeof refreshResponseDtoSchema>;
