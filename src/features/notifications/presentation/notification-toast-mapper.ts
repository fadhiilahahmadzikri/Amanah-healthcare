import type { BackendNotification } from '../api/notification-api-service';
import type { NotificationEnvelopeV2, NotificationSemanticAction } from '../types';
import { executeNotificationAction } from '../utils/notification-action-dispatcher';

export interface NotificationToastModel {
  id: string;
  headline: string;
  emoji: string;
  entityName?: string | null;
  subline?: string | null;
  avatarUrl?: string | null;
  isPerson: boolean;
  systemIconType?: string | null;
  action?: {
    label?: string;
    onClick: () => void;
    url?: string;
  } | null;
  duration?: number;
}

/**
 * Normalizes string values safely without fictional defaults.
 */
function normalizeString(value?: string | null): string {
  return value ? value.trim() : '';
}

/**
 * Resolves avatar URL from backend envelope with zero dummy data.
 * Checks visualKey, metadata.avatarUrl, or canonical user avatar API endpoints.
 */
export function resolveToastAvatarUrl(
  envelope: NotificationEnvelopeV2 | BackendNotification | Record<string, unknown>
): string | null {
  const visualKey =
    'visualKey' in envelope && typeof envelope.visualKey === 'string' ? envelope.visualKey : null;
  if (visualKey) return visualKey;

  const metadata = ('metadata' in envelope && envelope.metadata ? envelope.metadata : {}) as Record<
    string,
    unknown
  >;

  if (typeof metadata.avatarUrl === 'string' && metadata.avatarUrl) {
    return metadata.avatarUrl;
  }

  if (typeof metadata.patientUserId === 'string' && metadata.patientUserId) {
    return `/api/v1/users/${metadata.patientUserId}/avatar`;
  }

  if (typeof metadata.staffUserId === 'string' && metadata.staffUserId) {
    return `/api/v1/users/${metadata.staffUserId}/avatar`;
  }

  if (typeof metadata.userId === 'string' && metadata.userId) {
    return `/api/v1/users/${metadata.userId}/avatar`;
  }

  return null;
}

/**
 * Extracts canonical person name from envelope or payload.
 */
export function resolveToastPersonName(
  envelope: NotificationEnvelopeV2 | BackendNotification | Record<string, unknown>
): string | null {
  const senderName =
    'senderName' in envelope && typeof envelope.senderName === 'string'
      ? normalizeString(envelope.senderName)
      : '';

  // If senderName is a real person name (not clinic system)
  if (
    senderName &&
    senderName !== 'Klinik Amanah' &&
    senderName !== 'Admin Klinik' &&
    senderName !== 'Sistem'
  ) {
    return senderName;
  }

  const metadata = ('metadata' in envelope && envelope.metadata ? envelope.metadata : {}) as Record<
    string,
    unknown
  >;

  if (typeof metadata.patientName === 'string' && metadata.patientName) {
    return normalizeString(metadata.patientName);
  }

  if (typeof metadata.nama_staf === 'string' && metadata.nama_staf) {
    return normalizeString(metadata.nama_staf);
  }

  if (typeof metadata.staffName === 'string' && metadata.staffName) {
    return normalizeString(metadata.staffName);
  }

  if (typeof metadata.doctorName === 'string' && metadata.doctorName) {
    return normalizeString(metadata.doctorName);
  }

  // Extract from body if structured as "Nama Pasien\nKode Antrean"
  const body = 'body' in envelope && typeof envelope.body === 'string' ? envelope.body : '';
  if (body) {
    const firstLine = body
      .split('\n')[0]
      .replace(/^Pasien\s+/i, '')
      .replace(/\s*\([^)]*\).*$/, '')
      .trim();
    if (firstLine && firstLine !== 'Pasien' && firstLine.length < 50) {
      return firstLine;
    }
  }

  return senderName || null;
}

/**
 * Canonical presentation mapper translating all backend notification events
 * into the Unified Friendly Notification Toast Model.
 */
export function mapNotificationToToastModel(
  envelope: NotificationEnvelopeV2 | BackendNotification | Record<string, unknown>,
  router: { push: (url: string) => void },
  userRole?: string | null
): NotificationToastModel {
  const id =
    ('id' in envelope && typeof envelope.id === 'string' ? envelope.id : '') ||
    `toast-${Date.now()}`;
  const rawTitle = (
    'title' in envelope && typeof envelope.title === 'string' ? envelope.title : ''
  ).trim();
  const rawBadge = (
    'badgeIcon' in envelope && typeof envelope.badgeIcon === 'string' ? envelope.badgeIcon : ''
  ).trim();

  const personName = resolveToastPersonName(envelope);
  const rawAvatarUrl = resolveToastAvatarUrl(envelope);

  // Directly trust upstream backend title and metadata (Single Source of Truth)
  const headline = rawTitle || 'Notifikasi Baru';
  const isPerson = Boolean(rawAvatarUrl || personName);
  const systemIconType: string | null = rawBadge || 'bell';

  // Map contextual announcement emoji directly from backend badgeIcon metadata
  const emoji =
    rawBadge === 'message-square'
      ? '💬'
      : rawBadge === 'user-plus' || rawBadge === 'user'
        ? '👤'
        : rawBadge === 'calendar' || rawBadge === 'calendar-check'
          ? '📅'
          : rawBadge === 'clock'
            ? '⏰'
            : rawBadge === 'alert-circle'
              ? '⚠️'
              : rawBadge === 'stethoscope'
                ? '🩺'
                : rawBadge === 'check' || rawBadge === 'check-circle'
                  ? '✅'
                  : '🔔';

  // Extract optional subline context (e.g. email · role)
  let subline: string | null = null;
  const metadata = ('metadata' in envelope && envelope.metadata ? envelope.metadata : {}) as Record<
    string,
    unknown
  >;
  if (typeof metadata.email === 'string' && typeof metadata.roleName === 'string') {
    subline = `${metadata.email} · ${metadata.roleName}`;
  } else if ('body' in envelope && typeof envelope.body === 'string' && envelope.body.includes('\n')) {
    const lines = envelope.body.split('\n');
    if (lines.length > 1) {
      subline = lines[1].trim();
    }
  }

  // Trailing action resolution
  const primaryAction =
    'action' in envelope && envelope.action
      ? (envelope.action as NotificationSemanticAction)
      : undefined;

  let toastAction: NotificationToastModel['action'] = null;

  if (primaryAction) {
    toastAction = {
      label: primaryAction.label || 'Lihat',
      onClick: () => {
        executeNotificationAction(router, primaryAction, envelope as any, userRole);
      }
    };
  } else if (
    'actionUrl' in envelope &&
    typeof envelope.actionUrl === 'string' &&
    envelope.actionUrl
  ) {
    const url = envelope.actionUrl;
    toastAction = {
      label: 'Lihat',
      onClick: () => {
        router.push(url);
      },
      url
    };
  }

  return {
    id,
    headline,
    emoji,
    entityName: personName,
    subline,
    avatarUrl: rawAvatarUrl,
    isPerson,
    systemIconType,
    action: toastAction,
    duration: 6000
  };
}
