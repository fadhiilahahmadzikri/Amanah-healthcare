import 'server-only';
import { getBaseApiUrl } from './base-url';

export const paths = {
  auth: {
    // Engine A: Canonical JWT API (/api/v1/auth/*)
    login: () => `${getBaseApiUrl()}/api/v1/auth/email/login`,
    register: () => `${getBaseApiUrl()}/api/v1/auth/email/register`,
    me: () => `${getBaseApiUrl()}/api/v1/auth/me`,
    refresh: () => `${getBaseApiUrl()}/api/v1/auth/refresh`,
    forgotPassword: () => `${getBaseApiUrl()}/api/v1/auth/forgot/password`,
    resetPassword: () => `${getBaseApiUrl()}/api/v1/auth/reset/password`,
    resendOtp: () => `${getBaseApiUrl()}/api/v1/auth/otp/resend`,
    logout: () => `${getBaseApiUrl()}/api/v1/auth/logout`,
    deleteMe: () => `${getBaseApiUrl()}/api/v1/auth/me`,

    // Engine B: Better Auth (/api/auth/*)
    betterAuthSignIn: () => `${getBaseApiUrl()}/api/auth/sign-in/email`,
    betterAuthSignOut: () => `${getBaseApiUrl()}/api/auth/sign-out`,
    betterAuthGetSession: () => `${getBaseApiUrl()}/api/auth/get-session`,
    betterAuthForgetPassword: () => `${getBaseApiUrl()}/api/auth/forget-password`,
    betterAuthResetPassword: () => `${getBaseApiUrl()}/api/auth/reset-password`,
    betterAuthAdminListUsers: () => `${getBaseApiUrl()}/api/auth/admin/list-users`,
    betterAuthAdminSetRole: () => `${getBaseApiUrl()}/api/auth/admin/set-role`,
    betterAuthAdminBanUser: () => `${getBaseApiUrl()}/api/auth/admin/ban-user`,
    betterAuthAdminImpersonateUser: () => `${getBaseApiUrl()}/api/auth/admin/impersonate-user`
  },
  users: {
    byId: (id: string) => `${getBaseApiUrl()}/api/v1/users/${id}`,
    list: () => `${getBaseApiUrl()}/api/v1/users`
  },
  patients: {
    registration: () => `${getBaseApiUrl()}/api/v1/patients/registration`,
    me: () => `${getBaseApiUrl()}/api/v1/patients/me`
  },
  doctorSchedules: {
    list: () => `${getBaseApiUrl()}/api/v1/admin/doctor-schedules`,
    detail: (id: string) => `${getBaseApiUrl()}/api/v1/admin/doctor-schedules/${id}`,
    update: (id: string) => `${getBaseApiUrl()}/api/v1/admin/doctor-schedules/${id}`,
    updateDayStatus: (id: string) => `${getBaseApiUrl()}/api/v1/admin/doctor-schedules/${id}/day-status`,
    createSession: (id: string) => `${getBaseApiUrl()}/api/v1/admin/doctor-schedules/${id}/sessions`,
    updateSession: (id: string, sessionId: string) =>
      `${getBaseApiUrl()}/api/v1/admin/doctor-schedules/${id}/sessions/${sessionId}`,
    deleteSession: (id: string, sessionId: string) =>
      `${getBaseApiUrl()}/api/v1/admin/doctor-schedules/${id}/sessions/${sessionId}`,
    filterOptions: () => `${getBaseApiUrl()}/api/v1/admin/doctor-schedules/filter-options`
  },
  clinicalPractitioners: {
    list: () => `${getBaseApiUrl()}/api/v1/clinical/practitioners`
  }
} as const;
