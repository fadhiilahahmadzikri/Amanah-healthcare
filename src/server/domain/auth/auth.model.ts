import 'server-only';
import type { UserId, TokenString, EmailAddress } from '@/core/types/branded';
import type { SystemRole } from '@/server/auth/policies';

export interface MedicalStaffProfile {
  readonly id: string;
  readonly userId: UserId;
  readonly practitionerId?: string | null;
  readonly poliklinikId?: string | null;
  readonly fullName: string;
  readonly profession?: string | null;
  readonly idCardNumber?: string | null;
  readonly photoUrl?: string | null;
  readonly phoneNumber?: string | null;
  readonly isActive: boolean;
}

export interface PatientProfile {
  readonly id: string;
  readonly userId: UserId;
  readonly medicalRecordNumber: string;
  readonly nik: string;
  readonly fullName: string;
  readonly gender: string;
  readonly birthPlace?: string | null;
  readonly birthDate?: string | null;
  readonly bloodType?: string | null;
  readonly phoneNumber?: string | null;
  readonly status?: string;
}

export interface UserRole {
  readonly id: string | number;
  readonly name: string;
}

export interface User {
  readonly id: UserId;
  readonly email: EmailAddress;
  readonly systemRole: SystemRole;
  readonly role?: UserRole;
  readonly staff?: MedicalStaffProfile | null;
  readonly patient?: PatientProfile | null;
}

export interface AuthTokens {
  readonly accessToken: TokenString;
  readonly refreshToken: TokenString;
  readonly expiresAt: number;
}

export interface AuthSession {
  readonly user: User;
  readonly tokens: AuthTokens;
}
