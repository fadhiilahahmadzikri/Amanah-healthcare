export const ROUTES = {
  home: '/',
  signIn: '/auth/sign-in',
  signUp: '/auth/sign-up',
  verifyOtp: '/verify-otp',
  admin: '/admin',
  adminAppointmentPasien: '/admin/appointment-pasien',
  adminStaff: '/admin/staff',
  adminDoctorSchedules: '/admin/jadwal-dokter',
  adminLeaveManagement: '/admin/manajemen-perizinan',
  adminReplacementOpportunities: '/admin/peluang-pengganti',
  adminPayroll: '/admin/payroll',
  adminPatientData: '/admin/data-pasien',
  adminMedicalRecords: '/admin/riwayat-medis',
  adminAttendance: '/admin/kehadiran-pegawai',
  adminChat: '/admin/chat',
  adminNotifications: '/admin/notifications',
  adminSettings: '/admin/settings',
  adminProfile: '/admin/profile',
  // Clinic / Patient Portal
  clinicQueue: '/klinik/antrean',
  clinicAppointments: '/klinik/janji-temu',
  clinicHistory: '/klinik/history',
  clinicChat: '/klinik/chat',
  clinicGuide: '/klinik/panduan',
  clinicProfile: '/klinik/profile',
  clinicNotifications: '/klinik/notifications',
  sessionExpired: '/api/auth/session-expired'
} as const;

export const REDIRECT_PARAM = 'redirect';
export const PROTECTED_PREFIXES = ['/admin', '/klinik', '/patient-registration'] as const;

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function safeRedirect(
  path: string | null | undefined,
  fallback: string = ROUTES.adminAppointmentPasien
): string {
  if (!path) return fallback;
  if (path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\')) {
    return path;
  }
  return fallback;
}

export function getRoleLandingPath(role?: string | null): string {
  if (role === 'patient') {
    return ROUTES.clinicQueue;
  }
  return ROUTES.adminAppointmentPasien;
}
