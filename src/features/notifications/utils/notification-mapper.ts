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
  system: 'Antrean',
  chat: 'Chat Pasien',
  support: 'Chat Pasien'
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

  const rawMetadata = backend.metadata as Record<string, unknown> | null | undefined;
  const semanticAction = rawMetadata?.semanticAction as
    | { params?: Record<string, unknown> }
    | undefined;
  const semanticConvId =
    typeof semanticAction?.params?.conversationId === 'string'
      ? (semanticAction.params.conversationId as string)
      : '';
  const metaConvId =
    typeof rawMetadata?.conversationId === 'string' ? rawMetadata.conversationId : '';
  const conversationId = metaConvId || semanticConvId || '';

  const isPatientAudience =
    backend.audience === 'patient' ||
    (rawMetadata?.audience as string) === 'patient' ||
    backend.senderRole === 'Klinik Amanah' ||
    backend.senderRole === 'Admin Klinik';

  const actions: NotificationActionItem[] = (backend.actions || []).map((action, index) => {
    return {
      id: action.id || `act-${backend.id}-${index}`,
      label: action.label,
      type: (action.actionType as NotificationActionItem['type']) || 'primary',
      actionKey: action.actionKey,
      url: action.url,
      icon: undefined
    };
  });

  const isChatNotification =
    category === 'Chat Pasien' ||
    backend.category === 'chat' ||
    backend.category === 'support' ||
    backend.sourceType === 'chat' ||
    Boolean(conversationId);

  if (isChatNotification && !actions.some((a) => a.actionKey === 'view_chat')) {
    actions.push({
      id: `act-reply-${backend.id}`,
      label: 'Balas',
      type: 'primary',
      actionKey: 'view_chat',
      url: isPatientAudience
        ? '/klinik/chat'
        : conversationId
          ? `/admin/chat?conversationId=${conversationId}`
          : '/admin/chat',
      icon: undefined
    });
  }

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
    audience: backend.audience,
    status: backend.isRead || backend.readAt != null ? 'read' : 'unread',
    metaIcon: backend.metaIcon || null,
    createdAt: backend.createdAt,
    actionUrl: backend.actionUrl || null,
    metadata: backend.metadata || null,
    actions: actions.length > 0 ? actions : undefined
  };
}
