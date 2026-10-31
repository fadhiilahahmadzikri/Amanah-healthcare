import { PERMISSIONS, AUDIENCE, type AudienceType } from '@/core/auth/permissions.constants';

export type RouteVisibility = 'public' | 'auth-only' | 'authenticated' | 'protected';

export interface RouteRule {
  pattern: string;
  match: 'exact' | 'prefix';
  visibility: RouteVisibility;
  audience?: AudienceType;
  requiredPermission?: string;
  redirectTo?: string;
  description?: string;
}

/**
 * Single Source of Truth for Route Authorization Manifest.
 * Every route in the application is explicitly defined here.
 * Fail-Closed Principle: If a route is not declared, it is denied by default.
 */
export const routeManifest: RouteRule[] = [
  // 1. Public Routes
  { pattern: '/', match: 'exact', visibility: 'public' },
  { pattern: '/about', match: 'prefix', visibility: 'public' },
  { pattern: '/tentang-kami', match: 'prefix', visibility: 'public' },
  { pattern: '/layanan', match: 'prefix', visibility: 'public' },
  { pattern: '/fasilitas', match: 'prefix', visibility: 'public' },
  { pattern: '/kontak', match: 'prefix', visibility: 'public' },
  { pattern: '/testimoni', match: 'prefix', visibility: 'public' },
  { pattern: '/ulasan', match: 'prefix', visibility: 'public' },
  { pattern: '/privacy-policy', match: 'prefix', visibility: 'public' },
  { pattern: '/terms-of-service', match: 'prefix', visibility: 'public' },
  { pattern: '/kehadiran-live', match: 'prefix', visibility: 'public' },

  // 2. Auth-Only Routes (accessible only when logged out)
  { pattern: '/auth/sign-in', match: 'prefix', visibility: 'auth-only' },
  { pattern: '/auth/sign-up', match: 'prefix', visibility: 'auth-only' },
  { pattern: '/auth', match: 'exact', visibility: 'auth-only' },

  // 3. Authenticated Generic Routes (accessible by any authenticated user)
  {
    pattern: '/admin',
    match: 'exact',
    visibility: 'authenticated',
    requiredPermission: PERMISSIONS.APP.ACCESS
  },
  {
    pattern: '/admin/profile',
    match: 'prefix',
    visibility: 'authenticated',
    requiredPermission: PERMISSIONS.PROFILE.READ
  },
  {
    pattern: '/klinik/profile',
    match: 'prefix',
    visibility: 'authenticated',
    requiredPermission: PERMISSIONS.PROFILE.READ
  },

  // 4. Internal Workplace Routes (Staff & Administration)
  {
    pattern: '/admin/appointment-pasien',
    match: 'prefix',
    visibility: 'protected',
    audience: AUDIENCE.INTERNAL,
    requiredPermission: PERMISSIONS.APPOINTMENTS.READ,
    description: 'Manajemen Janji Temu Pasien oleh Staf'
  },
  {
    pattern: '/admin/data-pasien',
    match: 'prefix',
    visibility: 'protected',
    audience: AUDIENCE.INTERNAL,
    requiredPermission: PERMISSIONS.PATIENTS.READ,
    description: 'Data Rekam Medis & Profil Pasien Klinik'
  },
  {
    pattern: '/admin/riwayat-medis',
    match: 'prefix',
    visibility: 'protected',
    audience: AUDIENCE.INTERNAL,
    requiredPermission: PERMISSIONS.RECORDS.READ,
    description: 'Riwayat Rekam Medis Pasien'
  },
  {
    pattern: '/admin/jadwal-dokter',
    match: 'prefix',
    visibility: 'protected',
    audience: AUDIENCE.INTERNAL,
    requiredPermission: PERMISSIONS.SCHEDULES.READ,
    description: 'Pengaturan Jadwal dan Shift Dokter'
  },
  {
    pattern: '/admin/staff',
    match: 'prefix',
    visibility: 'protected',
    audience: AUDIENCE.INTERNAL,
    requiredPermission: PERMISSIONS.STAFF.READ,
    description: 'Manajemen Staf Operasional & Roster Kerja Klinik'
  },
  {
    pattern: '/admin/management-role',
    match: 'prefix',
    visibility: 'protected',
    audience: AUDIENCE.INTERNAL,
    requiredPermission: PERMISSIONS.ROLES.READ,
    description: 'Manajemen Role & Perizinan (Role Studio)'
  },
  {
    pattern: '/admin/clinic-essentials',
    match: 'prefix',
    visibility: 'protected',
    audience: AUDIENCE.INTERNAL,
    requiredPermission: PERMISSIONS.CLINICS.MANAGE,
    description: 'Clinic Essentials (Fasilitas, Unit, Ruangan, Layanan, & Formulir)'
  },
  {
    pattern: '/admin/kehadiran-pegawai',
    match: 'prefix',
    visibility: 'protected',
    audience: AUDIENCE.INTERNAL,
    requiredPermission: PERMISSIONS.ATTENDANCE.REVIEW,
    description: 'Rekap Kehadiran dan Presensi Pegawai'
  },
  {
    pattern: '/admin/manajemen-perizinan',
    match: 'prefix',
    visibility: 'protected',
    audience: AUDIENCE.INTERNAL,
    requiredPermission: PERMISSIONS.ATTENDANCE.APPROVE,
    description: 'Manajemen Perizinan, Cuti, & Kompensasi Staf'
  },
  {
    pattern: '/admin/peluang-pengganti',
    match: 'prefix',
    visibility: 'protected',
    audience: AUDIENCE.INTERNAL,
    requiredPermission: PERMISSIONS.ATTENDANCE.MANAGE,
    description: 'Manajemen Peluang Pengganti Dinas Staf Antar-Sesi'
  },
  {
    pattern: '/admin/payroll',
    match: 'prefix',
    visibility: 'protected',
    audience: AUDIENCE.INTERNAL,
    requiredPermission: PERMISSIONS.PAYROLL.READ,
    description: 'Manajemen Rekapitulasi Penggajian & Slip Gaji Staf'
  },
  {
    pattern: '/admin/chat',
    match: 'prefix',
    visibility: 'protected',
    audience: AUDIENCE.INTERNAL,
    requiredPermission: PERMISSIONS.APP.ACCESS,
    description: 'Chat Pasien (Admin Staf)'
  },
  {
    pattern: '/admin/settings',
    match: 'prefix',
    visibility: 'protected',
    audience: AUDIENCE.INTERNAL,
    requiredPermission: PERMISSIONS.CLINICS.MANAGE,
    description: 'Pengaturan Sistem & Konfigurasi QR Presensi'
  },
  {
    pattern: '/admin/notifications',
    match: 'prefix',
    visibility: 'protected',
    audience: AUDIENCE.INTERNAL,
    requiredPermission: PERMISSIONS.NOTIFICATIONS.READ,
    description: 'Notifikasi Admin & Staf'
  },

  // 5. External Portal Routes (Patients & Public)
  {
    pattern: '/klinik/antrean',
    match: 'prefix',
    visibility: 'protected',
    audience: AUDIENCE.EXTERNAL,
    requiredPermission: PERMISSIONS.QUEUE.READ,
    description: 'Monitor Antrean Pasien'
  },
  {
    pattern: '/klinik/janji-temu',
    match: 'prefix',
    visibility: 'protected',
    audience: AUDIENCE.EXTERNAL,
    requiredPermission: PERMISSIONS.APPOINTMENTS.BOOK,
    description: 'Janji Temu Pasien'
  },
  {
    pattern: '/klinik/history',
    match: 'prefix',
    visibility: 'protected',
    audience: AUDIENCE.EXTERNAL,
    requiredPermission: PERMISSIONS.RECORDS.READ,
    description: 'Riwayat Formulir Medis Pasien (Imunisasi & Persalinan)'
  },
  {
    pattern: '/klinik/chat',
    match: 'prefix',
    visibility: 'protected',
    audience: AUDIENCE.EXTERNAL,
    requiredPermission: PERMISSIONS.APP.ACCESS,
    description: 'Chat Konsultasi Online Pasien'
  },
  {
    pattern: '/klinik/notifications',
    match: 'prefix',
    visibility: 'protected',
    audience: AUDIENCE.EXTERNAL,
    requiredPermission: PERMISSIONS.NOTIFICATIONS.READ,
    description: 'Notifikasi Pasien'
  },
  {
    pattern: '/klinik/panduan',
    match: 'prefix',
    visibility: 'protected',
    audience: AUDIENCE.EXTERNAL,
    requiredPermission: PERMISSIONS.APP.ACCESS,
    description: 'Panduan Pasien Klinik'
  },
  {
    pattern: '/klinik',
    match: 'prefix',
    visibility: 'protected',
    audience: AUDIENCE.EXTERNAL,
    requiredPermission: PERMISSIONS.APP.ACCESS,
    description: 'Portal Pasien (Antrean, Janji Temu, Profil, Panduan)'
  },
  {
    pattern: '/patient-registration',
    match: 'prefix',
    visibility: 'protected',
    audience: AUDIENCE.EXTERNAL,
    requiredPermission: PERMISSIONS.PATIENTS.REGISTER,
    description: 'Pendaftaran Pasien Baru'
  }
];

/**
 * Resolves the matching route rule using longest-prefix match.
 * Prioritizes exact matches, then longest prefix match.
 * If no rule matches, returns null (Fail-Closed Default Deny).
 */
export function resolveRouteRule(pathname: string): RouteRule | null {
  // 1. Check exact match
  const exactMatch = routeManifest.find(
    (rule) => rule.match === 'exact' && rule.pattern === pathname
  );
  if (exactMatch) return exactMatch;

  // 2. Check prefix matches (sorted by longest prefix first)
  const prefixMatches = routeManifest
    .filter((rule) => rule.match === 'prefix' && pathname.startsWith(rule.pattern))
    .toSorted((a, b) => b.pattern.length - a.pattern.length);

  if (prefixMatches.length > 0) {
    return prefixMatches[0];
  }

  // 3. Fail-Closed: null implies unknown route
  return null;
}

export interface RouteAuthContext {
  audience?: AudienceType | null;
  permissions?: string[];
  role?: string | null;
}

/**
 * Evaluates whether a principal is authorized for a given pathname.
 * Purely driven by Audience ('internal' vs 'external') and Granular Permissions.
 */
export function isRouteAuthorized(
  pathname: string,
  context?: RouteAuthContext | null
): { allowed: boolean; reason?: 'unauthenticated' | 'forbidden' | 'unknown_route' | 'auth_only' } {
  const rule = resolveRouteRule(pathname);

  if (!rule) {
    // Fail-Closed: unknown route inside protected zone is denied
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/klinik') ||
      pathname.startsWith('/patient-registration')
    ) {
      return { allowed: false, reason: 'forbidden' };
    }
    return { allowed: true };
  }

  if (rule.visibility === 'public') {
    return { allowed: true };
  }

  const audience = context?.audience ?? null;
  const permissions = context?.permissions ?? [];

  if (rule.visibility === 'auth-only') {
    if (audience) {
      return { allowed: false, reason: 'auth_only' };
    }
    return { allowed: true };
  }

  // If requires authentication but no audience is resolved
  if (!audience) {
    return { allowed: false, reason: 'unauthenticated' };
  }

  if (rule.visibility === 'authenticated') {
    if (rule.requiredPermission) {
      const hasWildcard = permissions.includes('*');
      if (!hasWildcard && !permissions.includes(rule.requiredPermission)) {
        return { allowed: false, reason: 'forbidden' };
      }
    }
    return { allowed: true };
  }

  if (rule.visibility === 'protected') {
    // 1. Audience verification
    if (rule.audience && rule.audience !== audience) {
      return { allowed: false, reason: 'forbidden' };
    }

    // 2. Granular permission verification
    if (rule.requiredPermission) {
      const hasWildcard = permissions.includes('*');
      if (!hasWildcard && !permissions.includes(rule.requiredPermission)) {
        return { allowed: false, reason: 'forbidden' };
      }
    }

    return { allowed: true };
  }

  return { allowed: true };
}
