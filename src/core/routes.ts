export const ROUTES = {
  home: '/',
  signIn: '/auth/sign-in',
  signUp: '/auth/sign-up',
  verifyOtp: '/verify-otp',
  dashboard: '/dashboard',
  dashboardAppointmentPasien: '/dashboard/appointment-pasien',
  dashboardStaff: '/dashboard/staff',
  dashboardDoctorSchedules: '/dashboard/jadwal-dokter',
  dashboardLeaveManagement: '/dashboard/manajemen-perizinan',
  dashboardReplacementOpportunities: '/dashboard/peluang-pengganti',
  dashboardPayroll: '/dashboard/payroll',
  dashboardPatient: '/dashboard/klinik/antrean',
  sessionExpired: '/api/auth/session-expired'
} as const;

export const REDIRECT_PARAM = 'redirect';
export const PROTECTED_PREFIXES = ['/dashboard', '/patient-registration'] as const;

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function safeRedirect(path: string | null | undefined, fallback = ROUTES.dashboard): string {
  if (!path) return fallback;
  if (path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\')) {
    return path;
  }
  return fallback;
}

export function getRoleLandingPath(role?: string | null): string {
  if (role === 'admin') {
    return ROUTES.dashboardAppointmentPasien;
  }
  return ROUTES.dashboardPatient;
}
