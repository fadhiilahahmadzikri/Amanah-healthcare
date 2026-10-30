import 'server-only';
import { AppError } from '@/core/errors/app-error';
import { getAccessTokenCookie } from './token-store';
import { AuthPolicies, type AuthUserDescriptor } from './policies';

export async function requireAuthToken(): Promise<string> {
  const token = await getAccessTokenCookie();
  if (!token) {
    throw AppError.unauthenticated('Authentication required. Missing access token.');
  }
  return token;
}

export function assertRole(user: AuthUserDescriptor, requiredRole: string): void {
  if (user.role !== requiredRole && !AuthPolicies.isAdmin(user)) {
    throw AppError.forbidden(`Access restricted to ${requiredRole}.`);
  }
}

export function assertAdmin(user: AuthUserDescriptor): void {
  if (!AuthPolicies.isAdmin(user)) {
    throw AppError.forbidden('Administrator privileges required.');
  }
}

export function assertMedicalStaff(user: AuthUserDescriptor): void {
  if (!AuthPolicies.isMedicalStaff(user)) {
    throw AppError.forbidden('Medical practitioner credentials required.');
  }
}
