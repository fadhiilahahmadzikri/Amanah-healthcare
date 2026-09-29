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
  shift: 'Janji Temu',
  system: 'Antrean'
};

function normalizeString(value?: string | null): string {
  if (!value) return '';
  const trimmed = value.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      return String(parsed.name || parsed.role || parsed.roleCode || '').trim();
    } catch {
      return '';
    }
  }
  return trimmed;
}

export function mapBackendToClinicNotification(backend: BackendNotification): ClinicNotification {
  const categoryKey = (backend.category || '').toLowerCase();
  const category: ClinicNotificationCategory = CATEGORY_MAP[categoryKey] ?? 'Janji Temu';

  const rawTitle = normalizeString(backend.title);
  const senderClean = normalizeString(backend.senderName);
  const roleClean = normalizeString(backend.senderRole);

  const title = rawTitle || senderClean || category;
  const sender = senderClean || 'Klinik Amanah';
  const roleSubtitle = roleClean || 'Informasi';

  const actions: NotificationActionItem[] = (backend.actions || []).map((action, index) => ({
    id: action.id || `act-${backend.id}-${index}`,
    label: action.label,
    type: (action.actionType as any) || 'primary',
    actionKey: action.actionKey,
    icon: undefined
  }));

  const metaPatientAvatar =
    typeof backend.metadata?.patientAvatarUrl === 'string' ? backend.metadata.patientAvatarUrl : '';
  const metaAvatar =
    typeof backend.metadata?.avatarUrl === 'string' ? backend.metadata.avatarUrl : '';
  const metaPatientUserId =
    typeof backend.metadata?.patientUserId === 'string' ? backend.metadata.patientUserId : '';

  const rawAvatar =
    backend.visualKey ||
    metaPatientAvatar ||
    metaAvatar ||
    (metaPatientUserId ? `/api/v1/users/${metaPatientUserId}/avatar` : '') ||
    '';

  return {
    id: backend.id,
    title,
    sender,
    roleSubtitle,
    avatar: rawAvatar,
    badgeIcon: backend.badgeIcon || 'bell',
    timeAgo: formatTimeAgo(backend.createdAt),
    dateFull: formatFullDate(backend.createdAt),
    body: backend.body?.trim() || '',
    category,
    status: backend.isRead || backend.readAt != null ? 'read' : 'unread',
    metaIcon: backend.metaIcon || 'calendar',
    createdAt: backend.createdAt,
    actions: actions.length > 0 ? actions : undefined
  };
}
