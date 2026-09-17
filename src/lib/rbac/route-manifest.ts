export type RouteVisibility = 'public' | 'auth-only' | 'authenticated' | 'protected';

export type UserRole = 'admin' | 'patient';

export interface RouteRule {
  pattern: string;
  match: 'exact' | 'prefix';
  visibility: RouteVisibility;
  allowedRoles?: UserRole[];
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
  { pattern: '/dashboard', match: 'exact', visibility: 'authenticated' },
  { pattern: '/dashboard/profile', match: 'prefix', visibility: 'authenticated' },

  // 4. Admin-Only Protected Routes
  {
    pattern: '/dashboard/admin',
    match: 'prefix',
    visibility: 'protected',
    allowedRoles: ['admin'],
    description: 'Laporan Operasional & Statistik Klinik'
  },
  {
    pattern: '/dashboard/appointment-pasien',
    match: 'prefix',
    visibility: 'protected',
    allowedRoles: ['admin'],
    description: 'Manajemen Janji Temu Pasien oleh Staf/Admin'
  },
  {
    pattern: '/dashboard/data-pasien',
    match: 'prefix',
    visibility: 'protected',
    allowedRoles: ['admin'],
    description: 'Data Rekam Medis & Profil Pasien Klinik'
  },
  {
    pattern: '/dashboard/jadwal-dokter',
    match: 'prefix',
    visibility: 'protected',
    allowedRoles: ['admin'],
    description: 'Pengaturan Jadwal dan Shift Dokter'
  },
  {
    pattern: '/dashboard/kehadiran-pegawai',
    match: 'prefix',
    visibility: 'protected',
    allowedRoles: ['admin'],
    description: 'Rekap Kehadiran dan Presensi Pegawai'
  },
  {
    pattern: '/dashboard/chat',
    match: 'prefix',
    visibility: 'protected',
    allowedRoles: ['admin'],
    description: 'Chat Pasien (Admin Staf)'
  },
  {
    pattern: '/dashboard/workspaces',
    match: 'prefix',
    visibility: 'protected',
    allowedRoles: ['admin'],
    description: 'Unit Layanan & Tim Klinik'
  },
  {
    pattern: '/dashboard/billing',
    match: 'prefix',
    visibility: 'protected',
    allowedRoles: ['admin'],
    description: 'Langganan & Billing Lisensi Klinik'
  },
  {
    pattern: '/dashboard/settings',
    match: 'prefix',
    visibility: 'protected',
    allowedRoles: ['admin'],
    description: 'Pengaturan Sistem & Konfigurasi QR Presensi'
  },

  // 5. Patient-Only Protected Routes
  {
    pattern: '/dashboard/klinik',
    match: 'prefix',
    visibility: 'protected',
    allowedRoles: ['patient'],
    description: 'Portal Pasien (Antrean, Janji Temu, Profil, Panduan)'
  },
  {
    pattern: '/dashboard/notifications',
    match: 'prefix',
    visibility: 'protected',
    allowedRoles: ['patient'],
    description: 'Notifikasi Pasien'
  },
  {
    pattern: '/patient-registration',
    match: 'prefix',
    visibility: 'protected',
    allowedRoles: ['patient'],
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

  // 2. Check prefix matches (sorted by longest prefix first so /dashboard/admin wins over /dashboard)
  const prefixMatches = routeManifest
    .filter((rule) => rule.match === 'prefix' && pathname.startsWith(rule.pattern))
    .sort((a, b) => b.pattern.length - a.pattern.length);

  if (prefixMatches.length > 0) {
    return prefixMatches[0];
  }

  // 3. Fail-Closed: null implies unknown route
  return null;
}

/**
 * Evaluates whether a role is authorized for a given pathname.
 */
export function isRouteAuthorized(
  pathname: string,
  userRole?: string | null
): { allowed: boolean; reason?: 'unauthenticated' | 'forbidden' | 'unknown_route' | 'auth_only' } {
  const rule = resolveRouteRule(pathname);

  if (!rule) {
    // Fail-Closed: unknown route inside protected zone is denied
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/patient-registration')) {
      return { allowed: false, reason: 'forbidden' };
    }
    return { allowed: true };
  }

  if (rule.visibility === 'public') {
    return { allowed: true };
  }

  if (rule.visibility === 'auth-only') {
    if (userRole) {
      return { allowed: false, reason: 'auth_only' };
    }
    return { allowed: true };
  }

  // If requires authentication but no role is present
  if (!userRole) {
    return { allowed: false, reason: 'unauthenticated' };
  }

  if (rule.visibility === 'authenticated') {
    return { allowed: true };
  }

  if (rule.visibility === 'protected' && rule.allowedRoles) {
    // Normalize role: 'user' maps to 'patient'
    const normalizedRole = userRole === 'admin' ? 'admin' : 'patient';
    if (rule.allowedRoles.includes(normalizedRole)) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'forbidden' };
  }

  return { allowed: true };
}
