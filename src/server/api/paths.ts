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
    updateDayStatus: (id: string) =>
      `${getBaseApiUrl()}/api/v1/admin/doctor-schedules/${id}/day-status`,
    createSession: (id: string) =>
      `${getBaseApiUrl()}/api/v1/admin/doctor-schedules/${id}/sessions`,
    updateSession: (id: string, sessionId: string) =>
      `${getBaseApiUrl()}/api/v1/admin/doctor-schedules/${id}/sessions/${sessionId}`,
    deleteSession: (id: string, sessionId: string) =>
      `${getBaseApiUrl()}/api/v1/admin/doctor-schedules/${id}/sessions/${sessionId}`,
    reschedule: (id: string, sessionId: string) =>
      `${getBaseApiUrl()}/api/v1/admin/doctor-schedules/${id}/sessions/${sessionId}/reschedule`,
    rescheduleEligibility: (id: string, sessionId: string) =>
      `${getBaseApiUrl()}/api/v1/admin/doctor-schedules/${id}/sessions/${sessionId}/reschedule-eligibility`,
    duration: (id: string) => `${getBaseApiUrl()}/api/v1/admin/doctor-schedules/${id}/duration`,
    dayByDate: (id: string, date: string) =>
      `${getBaseApiUrl()}/api/v1/admin/doctor-schedules/${id}/days/${date}`,
    filterOptions: () => `${getBaseApiUrl()}/api/v1/admin/doctor-schedules/filter-options`,
    sessionPatients: (id: string, sessionId: string) =>
      `${getBaseApiUrl()}/api/v1/admin/doctor-schedules/${id}/sessions/${sessionId}/patients`,
    doctorPatients: (id: string) =>
      `${getBaseApiUrl()}/api/v1/admin/doctor-schedules/${id}/patients`,
    projection: () => `${getBaseApiUrl()}/api/v1/schedules/projection`,
    adminProjection: () =>
      `${getBaseApiUrl()}/api/v1/admin/doctor-schedules/projection/availability`,
    referenceOptions: () => `${getBaseApiUrl()}/api/v1/schedules/reference/options`,
    adminReferenceOptions: () =>
      `${getBaseApiUrl()}/api/v1/admin/doctor-schedules/reference/options`
  },
  appointments: {
    list: () => `${getBaseApiUrl()}/api/v1/appointments`,
    call: (appointmentId: string) => `${getBaseApiUrl()}/api/v1/appointments/${appointmentId}/call`,
    complete: (appointmentId: string) =>
      `${getBaseApiUrl()}/api/v1/appointments/${appointmentId}/complete`,
    cancel: (appointmentId: string) =>
      `${getBaseApiUrl()}/api/v1/appointments/${appointmentId}/cancel`,
    adminCancel: (appointmentId: string) =>
      `${getBaseApiUrl()}/api/v1/admin/appointments/${appointmentId}/cancel`,
    queueDaily: () => `${getBaseApiUrl()}/api/v1/appointments/queue/daily`,
    queueDisplay: () => `${getBaseApiUrl()}/api/v1/appointments/queue/display`,
    status: (appointmentId: string) =>
      `${getBaseApiUrl()}/api/v1/admin/appointments/${appointmentId}/status`
  },
  schedules: {
    slotAvailability: () => `${getBaseApiUrl()}/api/v1/schedules/slot-availability`,
    referenceOptions: () => `${getBaseApiUrl()}/api/v1/schedules/reference/options`,
    referenceRooms: () => `${getBaseApiUrl()}/api/v1/schedules/reference/rooms`,
    referencePolikliniks: () => `${getBaseApiUrl()}/api/v1/schedules/reference/polikliniks`,
    contexts: () => `${getBaseApiUrl()}/api/v1/schedules/contexts`,
    projection: () => `${getBaseApiUrl()}/api/v1/schedules/projection`,
    occupancyOverview: () => `${getBaseApiUrl()}/api/v1/schedules/occupancy-overview`,
    poliSchedules: (poliklinikId: string) =>
      `${getBaseApiUrl()}/api/v1/schedules/poli/${poliklinikId}`,
    mySchedules: () => `${getBaseApiUrl()}/api/v1/schedules/my-schedules`,
    calendarSummary: () => `${getBaseApiUrl()}/api/v1/schedules/calendar-summary`,
    daySettings: () => `${getBaseApiUrl()}/api/v1/schedules/day-settings`,
    dayByDate: (date: string) => `${getBaseApiUrl()}/api/v1/schedules/days/${date}`,
    availability: () => `${getBaseApiUrl()}/api/v1/schedules/availability`,
    list: () => `${getBaseApiUrl()}/api/v1/schedules`,
    byId: (id: string) => `${getBaseApiUrl()}/api/v1/schedules/${id}`,
    toggleAvailability: (id: string) => `${getBaseApiUrl()}/api/v1/schedules/${id}/availability`,
    sessionPatients: (sessionId: string) =>
      `${getBaseApiUrl()}/api/v1/schedules/sessions/${sessionId}/patients`,
    bookedPatients: () => `${getBaseApiUrl()}/api/v1/schedules/booked-patients`,
    sessionBookedPatients: (id: string) =>
      `${getBaseApiUrl()}/api/v1/schedules/${id}/booked-patients`,
    rescheduleEligibility: (sessionId: string) =>
      `${getBaseApiUrl()}/api/v1/schedules/sessions/${sessionId}/reschedule-eligibility`,
    reschedule: (sessionId: string) =>
      `${getBaseApiUrl()}/api/v1/schedules/sessions/${sessionId}/reschedule`
  },
  clinicalPractitioners: {
    list: () => `${getBaseApiUrl()}/api/v1/clinical/practitioners`
  }
} as const;
