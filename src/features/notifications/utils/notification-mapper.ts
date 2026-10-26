import { formatFullDate, formatTimeAgo } from '@/lib/utils';
import type { BackendNotification } from '../api/notification-api-service';
import type {
  ClinicNotification,
  ClinicNotificationCategory,
  NotificationActionItem
} from '../types';

const CATEGORY_MAP: Record<string, ClinicNotificationCategory> = {
  appointment: 'Janji Temu',
  promotion: 'Promo',
  lab_result: 'Hasil Lab',
  queue: 'Antrean',
  pharmacy: 'Farmasi',
  telemedicine: 'Telemedisin',
  clinical: 'Janji Temu',
  shift: 'Shift & Kehadiran',
  attendance: 'Shift & Kehadiran',
  leave: 'Shift & Kehadiran',
  replacement: 'Shift & Kehadiran',
  system: 'Antrean'
};

function normalizeString(value?: string | null): string {
  return value ? value.trim() : '';
}

export function mapBackendToClinicNotification(backend: BackendNotification): ClinicNotification {
  const categoryKey = (backend.category ?? '').toLowerCase();
  const category: ClinicNotificationCategory = CATEGORY_MAP[categoryKey] ?? 'Janji Temu';

  const rawTitle = normalizeString(backend.title);
  const senderClean = normalizeString(backend.senderName);
  const roleClean = normalizeString(backend.senderRole);

  const title = rawTitle || 'Notifikasi';
  const sender = senderClean || 'Klinik Amanah';
  const roleSubtitle = roleClean || 'Informasi';

  const actions: NotificationActionItem[] = (backend.actions || []).map((action, index) => ({
    id: action.id || `act-${backend.id}-${index}`,
    label: action.label,
    type: (action.actionType as any) || 'primary',
    actionKey: action.actionKey,
    url: action.url,
    icon: undefined
  }));

  const metaAvatar =
    typeof backend.metadata?.avatarUrl === 'string' ? backend.metadata.avatarUrl : '';
  const metaPatientUserId =
    typeof backend.metadata?.patientUserId === 'string' ? backend.metadata.patientUserId : '';

  let rawAvatar = backend.visualKey ?? '';
  if (!rawAvatar && metaAvatar) {
    rawAvatar = metaAvatar;
  } else if (!rawAvatar && metaPatientUserId) {
    rawAvatar = `/api/v1/users/${metaPatientUserId}/avatar`;
  }

  return {
    id: backend.id,
    title,
    sender,
    roleSubtitle,
    avatar: rawAvatar,
    badgeIcon: backend.badgeIcon || null,
    timeAgo: formatTimeAgo(backend.createdAt),
    dateFull: formatFullDate(backend.createdAt),
    body: backend.body?.trim() || '',
    category,
    status: backend.isRead || backend.readAt != null ? 'read' : 'unread',
    metaIcon: backend.metaIcon || null,
    createdAt: backend.createdAt,
    actionUrl: backend.actionUrl || null,
    metadata: backend.metadata || null,
    actions: actions.length > 0 ? actions : undefined
  };
}
