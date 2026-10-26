import type { NotificationSemanticAction } from '../types';

export interface ActionPayloadContext {
  url?: string | null;
  actionKey?: string | null;
  type?: string | null;
  params?: Record<string, string> | null;
  doctorId?: string | null;
  date?: string | null;
  openPatients?: boolean | null;
  patientId?: string | null;
  sessionId?: string | null;
  appointmentId?: string | null;
}

const PATIENT_ROUTE_ALLOWLIST = [
  '/dashboard/klinik',
  '/dashboard/notifications',
  '/dashboard/profile',
  '/patient-registration'
];

const CLINIC_ROUTE_ALLOWLIST = [
  '/dashboard/appointment-pasien',
  '/dashboard/data-pasien',
  '/dashboard/jadwal-dokter',
  '/dashboard/kehadiran-pegawai',
  '/dashboard/manajemen-perizinan',
  '/dashboard/chat',
  '/dashboard/settings',
  '/dashboard/notifications',
  '/dashboard/profile'
];

function isRouteAllowedForRole(route: string, role?: string | null): boolean {
  // Reject external, protocol-relative, or dangerous URLs
  const isUnsafe = [
    !route.startsWith('/'),
    route.startsWith('//'),
    route.includes('javascript:'),
    route.includes('data:')
  ].some(Boolean);

  if (isUnsafe) {
    return false;
  }

  const isPatient = role === 'patient' || role === 'user';
  if (isPatient) {
    return PATIENT_ROUTE_ALLOWLIST.some((allowed) => route.startsWith(allowed));
  }

  // Clinic staff / admin allowlist
  return CLINIC_ROUTE_ALLOWLIST.some((allowed) => route.startsWith(allowed));
}

/**
 * Resolves the destination URL for a notification action.
 * Maps semantic actions (action.type + params) with role-based allowlists.
 */
export function resolveNotificationRoute(
  action?: {
    actionKey?: string;
    url?: string | null;
    type?: string;
    params?: Record<string, string>;
  } | null,
  context?: Record<string, unknown> | null,
  userRole?: string | null
): string | null {
  if (!action) return null;

  const isPatient = userRole === 'patient' || userRole === 'user';

  // 1. Semantic action type mapping (Envelope v2 SSOT)
  const semanticType = action.type || (context?.semanticAction as NotificationSemanticAction)?.type;
  const actionParams =
    action.params ?? (context?.semanticAction as NotificationSemanticAction)?.params;
  const semanticParams = actionParams ?? {};

  if (semanticType) {
    switch (semanticType) {
      case 'view_queue':
      case 'view_appointment':
        return isPatient ? '/dashboard/klinik/antrean' : '/dashboard/appointment-pasien';

      case 'view_patient': {
        if (isPatient) return '/dashboard/klinik/antrean';
        const docId = semanticParams.doctorId ?? '';
        const params = new URLSearchParams();
        if (docId) {
          params.set('selectedDoctorId', docId);
          params.set('dialog', 'detail');
          params.set('openPatients', 'true');
        }
        if (semanticParams.date) params.set('date', semanticParams.date);
        const qs = params.toString();
        return `/dashboard/jadwal-dokter${qs ? `?${qs}` : ''}`;
      }

      case 'view_schedule':
      case 'view_schedule_detail': {
        if (isPatient) return '/dashboard/klinik/antrean';
        const docId = semanticParams.doctorId ?? '';
        const params = new URLSearchParams();
        if (docId) {
          params.set('selectedDoctorId', docId);
          params.set('dialog', 'detail');
        }
        if (semanticParams.date) params.set('date', semanticParams.date);
        const qs = params.toString();
        return `/dashboard/jadwal-dokter${qs ? `?${qs}` : ''}`;
      }

      case 'view_chat': {
        const convId = semanticParams.conversationId;
        return convId ? `/dashboard/chat?conversationId=${convId}` : '/dashboard/chat';
      }

      case 'view_leave': {
        if (isPatient) return '/dashboard/klinik/antrean';
        const leaveId = semanticParams.leaveId ?? '';
        return leaveId
          ? `/dashboard/manajemen-perizinan?leaveId=${leaveId}`
          : '/dashboard/manajemen-perizinan';
      }

      case 'view_attendance': {
        if (isPatient) return '/dashboard/klinik/antrean';
        const attendanceId = semanticParams.attendanceId ?? '';
        return attendanceId
          ? `/dashboard/kehadiran-pegawai?highlight=${attendanceId}`
          : '/dashboard/kehadiran-pegawai';
      }

      default:
        break;
    }
  }

  // 2. Legacy actionKey mapping
  const doctorId = (context?.doctorId as string) ?? '';
  const date = (context?.date as string) ?? '';

  if (action.actionKey === 'view_leave') {
    if (isPatient) return '/dashboard/klinik/antrean';
    const leaveId = (context?.leaveId as string) ?? '';
    return leaveId
      ? `/dashboard/manajemen-perizinan?leaveId=${leaveId}`
      : '/dashboard/manajemen-perizinan';
  }

  if (action.actionKey === 'view_attendance') {
    if (isPatient) return '/dashboard/klinik/antrean';
    const attId = (context?.attendanceId as string) ?? '';
    return attId
      ? `/dashboard/kehadiran-pegawai?highlight=${attId}`
      : '/dashboard/kehadiran-pegawai';
  }

  if (action.actionKey === 'view_patient') {
    if (isPatient) return '/dashboard/klinik/antrean';
    const params = new URLSearchParams();
    if (doctorId) {
      params.set('selectedDoctorId', doctorId);
      params.set('dialog', 'detail');
      params.set('openPatients', 'true');
    }
    if (date) params.set('date', date);
    const qs = params.toString();
    return `/dashboard/jadwal-dokter${qs ? `?${qs}` : ''}`;
  }

  if (action.actionKey === 'view_schedule') {
    if (isPatient) return '/dashboard/klinik/antrean';
    const params = new URLSearchParams();
    if (doctorId) {
      params.set('selectedDoctorId', doctorId);
      params.set('dialog', 'detail');
    }
    if (date) params.set('date', date);
    const qs = params.toString();
    return `/dashboard/jadwal-dokter${qs ? `?${qs}` : ''}`;
  }

  if (action.actionKey === 'view_appointment') {
    return isPatient ? '/dashboard/klinik/antrean' : '/dashboard/appointment-pasien';
  }

  // 3. Fallback to explicit URL only if allowed by role allowlist
  if (action.url && isRouteAllowedForRole(action.url, userRole)) {
    return action.url;
  }

  return null;
}

/**
 * Centrally executes a notification action.
 */
export function executeNotificationAction(
  router: { push: (url: string) => void },
  action: {
    actionKey?: string;
    url?: string | null;
    label?: string;
    type?: string;
    params?: Record<string, string>;
  },
  notification?: {
    id?: string;
    metadata?: Record<string, unknown> | null;
    actionUrl?: string | null;
  },
  userRole?: string | null,
  onComplete?: () => void
): void {
  const targetRoute = resolveNotificationRoute(action, notification?.metadata, userRole);
  if (targetRoute) {
    router.push(targetRoute);
  } else if (notification?.actionUrl && isRouteAllowedForRole(notification.actionUrl, userRole)) {
    router.push(notification.actionUrl);
  }
  onComplete?.();
}
