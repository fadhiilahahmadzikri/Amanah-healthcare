import type { NotificationSemanticAction } from '../types';
import { AUDIENCE, type AudienceType } from '@/core/auth/permissions.constants';

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

const PATIENT_ROUTE_ALLOWLIST = ['/klinik', '/patient-registration'];

const CLINIC_ROUTE_ALLOWLIST = ['/admin'];

function isRouteAllowedForRole(
  route: string,
  userAudienceOrRole?: AudienceType | string | null
): boolean {
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

  const isExternal = userAudienceOrRole === AUDIENCE.EXTERNAL;
  const allowlist = isExternal ? PATIENT_ROUTE_ALLOWLIST : CLINIC_ROUTE_ALLOWLIST;

  return allowlist.some((prefix) => route === prefix || route.startsWith(`${prefix}/`));
}

/**
 * Resolves the destination route from notification action and payload context.
 * Strict fail-closed resolution.
 */
export function resolveNotificationRoute(
  action: {
    actionKey?: string;
    url?: string | null;
    type?: string;
    params?: Record<string, string>;
  },
  context?: Record<string, unknown>,
  userAudienceOrRole?: AudienceType | string | null
): string | null {
  const isExternal =
    context?.audience === AUDIENCE.EXTERNAL || userAudienceOrRole === AUDIENCE.EXTERNAL;

  // 1. Semantic Action Resolution
  const semanticType = action.type || (context?.semanticAction as NotificationSemanticAction)?.type;
  const actionParams =
    action.params ?? (context?.semanticAction as NotificationSemanticAction)?.params;
  const semanticParams = actionParams ?? {};

  if (semanticType) {
    switch (semanticType) {
      case 'view_queue':
      case 'view_appointment':
        return isExternal ? '/klinik/antrean' : '/admin/appointment-pasien';

      case 'view_patient': {
        if (isExternal) return '/klinik/antrean';
        const docId = semanticParams.doctorId ?? '';
        const params = new URLSearchParams();
        if (docId) {
          params.set('selectedDoctorId', docId);
          params.set('dialog', 'detail');
          params.set('openPatients', 'true');
        }
        if (semanticParams.date) params.set('date', semanticParams.date);
        const qs = params.toString();
        return `/admin/jadwal-dokter${qs ? `?${qs}` : ''}`;
      }

      case 'view_schedule':
      case 'view_schedule_detail': {
        if (isExternal) return '/klinik/antrean';
        const docId = semanticParams.doctorId ?? '';
        const params = new URLSearchParams();
        if (docId) {
          params.set('selectedDoctorId', docId);
          params.set('dialog', 'detail');
        }
        if (semanticParams.date) params.set('date', semanticParams.date);
        const qs = params.toString();
        return `/admin/jadwal-dokter${qs ? `?${qs}` : ''}`;
      }

      case 'view_chat': {
        if (isExternal) {
          return '/klinik/chat';
        }
        const convId =
          semanticParams.conversationId ||
          (action.params?.conversationId as string) ||
          (context?.conversationId as string) ||
          '';
        return convId ? `/admin/chat?conversationId=${convId}` : '/admin/chat';
      }

      case 'view_leave': {
        if (isExternal) return '/klinik/antrean';
        const leaveId = semanticParams.leaveId ?? '';
        return leaveId
          ? `/admin/manajemen-perizinan?leaveId=${leaveId}`
          : '/admin/manajemen-perizinan';
      }

      case 'view_attendance': {
        if (isExternal) return '/klinik/antrean';
        const attendanceId = semanticParams.attendanceId ?? '';
        return attendanceId
          ? `/admin/kehadiran-pegawai?highlight=${attendanceId}`
          : '/admin/kehadiran-pegawai';
      }

      default:
        break;
    }
  }

  // 2. Legacy actionKey mapping
  const doctorId = (context?.doctorId as string) ?? '';
  const date = (context?.date as string) ?? '';

  if (action.actionKey === 'view_chat') {
    if (isExternal) {
      return '/klinik/chat';
    }
    const semanticAction = context?.semanticAction as NotificationSemanticAction | undefined;
    const convId =
      (action.params?.conversationId as string) ||
      (context?.conversationId as string) ||
      (semanticAction?.params?.conversationId as string) ||
      '';
    return convId ? `/admin/chat?conversationId=${convId}` : '/admin/chat';
  }

  if (action.actionKey === 'view_leave') {
    if (isExternal) return '/klinik/antrean';
    const leaveId = (context?.leaveId as string) ?? '';
    return leaveId ? `/admin/manajemen-perizinan?leaveId=${leaveId}` : '/admin/manajemen-perizinan';
  }

  if (action.actionKey === 'view_attendance') {
    if (isExternal) return '/klinik/antrean';
    const attId = (context?.attendanceId as string) ?? '';
    return attId ? `/admin/kehadiran-pegawai?highlight=${attId}` : '/admin/kehadiran-pegawai';
  }

  if (action.actionKey === 'view_patient') {
    if (isExternal) return '/klinik/antrean';
    const params = new URLSearchParams();
    if (doctorId) {
      params.set('selectedDoctorId', doctorId);
      params.set('dialog', 'detail');
      params.set('openPatients', 'true');
    }
    if (date) params.set('date', date);
    const qs = params.toString();
    return `/admin/jadwal-dokter${qs ? `?${qs}` : ''}`;
  }

  if (action.actionKey === 'view_schedule') {
    if (isExternal) return '/klinik/antrean';
    const params = new URLSearchParams();
    if (doctorId) {
      params.set('selectedDoctorId', doctorId);
      params.set('dialog', 'detail');
    }
    if (date) params.set('date', date);
    const qs = params.toString();
    return `/admin/jadwal-dokter${qs ? `?${qs}` : ''}`;
  }

  if (action.actionKey === 'view_appointment') {
    return isExternal ? '/klinik/antrean' : '/admin/appointment-pasien';
  }

  // 3. Fallback to explicit URL only if allowed by role allowlist
  if (action.url) {
    if (isRouteAllowedForRole(action.url, userAudienceOrRole)) {
      return action.url;
    }
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
    audience?: AudienceType | string;
    metadata?: Record<string, unknown> | null;
    actionUrl?: string | null;
  },
  userRole?: string | null,
  onComplete?: () => void
): void {
  const context: Record<string, unknown> = {
    ...notification?.metadata,
    audience: notification?.audience || (notification?.metadata?.audience as string)
  };
  const targetRoute = resolveNotificationRoute(action, context, userRole);
  if (targetRoute) {
    router.push(targetRoute);
  } else if (notification?.actionUrl && isRouteAllowedForRole(notification.actionUrl, userRole)) {
    router.push(notification.actionUrl);
  }
  onComplete?.();
}
