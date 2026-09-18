import 'server-only';
import { asUserId, asTokenString, asEmailAddress } from '@/core/types/branded';
import type {
  AuthenticatedUserDto,
  StaffProfileDto,
  PatientProfileDto,
  LoginResponseDto,
  RefreshResponseDto
} from '../contracts/auth/auth.dto';
import type {
  User,
  MedicalStaffProfile,
  PatientProfile,
  AuthTokens,
  AuthSession
} from '../domain/auth/auth.model';

export function toStaffProfileDomain(dto?: StaffProfileDto | null): MedicalStaffProfile | null {
  if (!dto) return null;
  return {
    id: dto.id,
    userId: asUserId(dto.userId),
    practitionerId: dto.practitionerId,
    poliklinikId: dto.poliklinikId,
    fullName: dto.fullName,
    profession: dto.profession,
    idCardNumber: dto.idCardNumber,
    photoUrl: dto.photoUrl,
    phoneNumber: dto.phoneNumber,
    isActive: dto.isActive
  };
}

export function toPatientProfileDomain(dto?: PatientProfileDto | null): PatientProfile | null {
  if (!dto) return null;
  return {
    id: dto.id,
    userId: asUserId(dto.userId),
    medicalRecordNumber: dto.medicalRecordNumber,
    nik: dto.nik,
    fullName: dto.fullName,
    gender: dto.gender,
    birthPlace: dto.birthPlace,
    birthDate: dto.birthDate,
    bloodType: dto.bloodType,
    phoneNumber: dto.phoneNumber,
    status: dto.status
  };
}

export function toUserDomain(dto: AuthenticatedUserDto): User {
  let systemRole: 'ADMIN' | 'STAF' | 'PATIENT' = dto.systemRole || 'PATIENT';
  let primaryRole = dto.role
    ? { id: dto.role.id, name: dto.role.name || dto.role.code || String(dto.role.id) }
    : undefined;

  if (!dto.systemRole && dto.userRoles_userId && dto.userRoles_userId.length > 0) {
    const firstRole = dto.userRoles_userId[0]?.role;
    if (firstRole) {
      primaryRole = {
        id: firstRole.id,
        name: firstRole.name || firstRole.code || 'PATIENT'
      };
      if (firstRole.code === 'admin') {
        systemRole = 'ADMIN';
      } else if (
        firstRole.code === 'staff_doctor' ||
        firstRole.code === 'staff_midwife' ||
        firstRole.code === 'staff_worker' ||
        (dto.staffProfiles && dto.staffProfiles.length > 0)
      ) {
        systemRole = 'STAF';
      }
    }
  }

  const staff =
    dto.staff !== undefined
      ? toStaffProfileDomain(dto.staff)
      : dto.staffProfiles?.[0]
        ? toStaffProfileDomain(dto.staffProfiles[0])
        : null;

  const patient =
    dto.patient !== undefined
      ? toPatientProfileDomain(dto.patient)
      : dto.patientProfiles?.[0]
        ? toPatientProfileDomain(dto.patientProfiles[0])
        : null;

  return {
    id: asUserId(dto.id),
    email: asEmailAddress(dto.email),
    systemRole,
    role: primaryRole,
    staff,
    patient
  };
}

export function toTokensDomain(dto: {
  token: string;
  refreshToken: string;
  tokenExpires: number;
}): AuthTokens {
  return {
    accessToken: asTokenString(dto.token),
    refreshToken: asTokenString(dto.refreshToken),
    expiresAt: dto.tokenExpires
  };
}

export function toSessionDomain(dto: LoginResponseDto): AuthSession {
  return {
    user: toUserDomain(dto.user),
    tokens: toTokensDomain(dto)
  };
}

export function toRefreshTokensDomain(dto: RefreshResponseDto): AuthTokens {
  return toTokensDomain(dto);
}
