import type { NotificationSemanticAction } from '../types';

export interface ActionPayloadContext {
  url?: string | null;
  actionKey?: string | null;
  type?: string | null;
  params?: Record<string, string> | null;
  doctorId?: string | null;
  date?: string | null;
  slotTime?: string | null;
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
  '/dashboard/admin',
  '/dashboard/appointment-pasien',
  '/dashboard/data-pasien',
  '/dashboard/jadwal-dokter',
  '/dashboard/kehadiran-pegawai',
  '/dashboard/chat',
  '/dashboard/workspaces',
  '/dashboard/billing',
  '/dashboard/settings',
  '/dashboard/notifications',
  '/dashboard/profile'
];

function isRouteAllowedForRole(route: string, role?: string | null): boolean {
  // Reject external, protocol-relative, or dangerous URLs
  if (
    !route.startsWith('/') ||
    route.startsWith('//') ||
    route.includes('javascript:') ||
    route.includes('data:')
  ) {
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
  const semanticParams = action.params || (context?.semanticAction as NotificationSemanticAction)?.params || {};

  if (semanticType) {
    switch (semanticType) {
      case 'view_queue':
      case 'view_appointment':
        return isPatient ? '/dashboard/klinik/antrean' : '/dashboard/appointment-pasien';

      case 'view_patient': {
        if (isPatient) return '/dashboard/klinik/antrean';
        const docId = semanticParams.staffId || semanticParams.doctorId || '';
        const params = new URLSearchParams();
        if (docId) params.set('selectedDoctorId', docId);
        params.set('dialog', 'detail');
        if (semanticParams.date) params.set('date', semanticParams.date);
        params.set('openPatients', 'true');
        if (semanticParams.scheduledStartTime) {
          params.set('highlightSlotTime', semanticParams.scheduledStartTime.slice(0, 5));
        }
        return `/dashboard/jadwal-dokter?${params.toString()}`;
      }

      case 'view_schedule':
      case 'view_schedule_detail': {
        if (isPatient) return '/dashboard/klinik/antrean';
        const docId = semanticParams.doctorId || semanticParams.staffId || '';
        const params = new URLSearchParams();
        if (docId) params.set('selectedDoctorId', docId);
        params.set('dialog', 'detail');
        if (semanticParams.date) params.set('date', semanticParams.date);
        if (semanticParams.slotTime) {
          params.set('highlightSlotTime', semanticParams.slotTime.slice(0, 5));
        }
        return `/dashboard/jadwal-dokter?${params.toString()}`;
      }

      default:
        break;
    }
  }

  // 2. Legacy actionKey mapping
  const doctorId =
    (context?.selectedDoctorId as string) ||
    (context?.doctorId as string) ||
    (context?.practitionerId as string) ||
    (context?.staffId as string) ||
    '';
  const date =
    (context?.date as string) ||
    (context?.targetDate as string) ||
    (context?.appointmentDate as string) ||
    '';
  const rawSlotTime =
    (context?.highlightSlotTime as string) ||
    (context?.slotTime as string) ||
    (context?.targetStartTime as string) ||
    (context?.scheduledStartTime as string) ||
    '';
  const slotTime = rawSlotTime ? rawSlotTime.slice(0, 5) : '';

  if (action.actionKey === 'view_patient') {
    if (isPatient) return '/dashboard/klinik/antrean';
    const params = new URLSearchParams();
    if (doctorId) params.set('selectedDoctorId', doctorId);
    params.set('dialog', 'detail');
    if (date) params.set('date', date);
    params.set('openPatients', 'true');
    if (slotTime) params.set('highlightSlotTime', slotTime);
    return `/dashboard/jadwal-dokter?${params.toString()}`;
  }

  if (action.actionKey === 'view_schedule' || action.actionKey === 'reschedule') {
    if (isPatient) return '/dashboard/klinik/antrean';
    const params = new URLSearchParams();
    if (doctorId) params.set('selectedDoctorId', doctorId);
    params.set('dialog', 'detail');
    if (date) params.set('date', date);
    if (slotTime) params.set('highlightSlotTime', slotTime);
    return `/dashboard/jadwal-dokter?${params.toString()}`;
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
  action: { actionKey?: string; url?: string | null; label?: string; type?: string; params?: Record<string, string> },
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

