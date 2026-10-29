import type { BackendNotification } from '../api/notification-api-service';
import type { NotificationEnvelopeV2, NotificationSemanticAction } from '../types';
import { executeNotificationAction } from '../utils/notification-action-dispatcher';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';

export interface NotificationToastModel {
  id: string;
  headline: string;
  emoji: string;
  entityName?: string | null;
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
  const rawType = (
    'type' in envelope && typeof envelope.type === 'string' ? envelope.type : ''
  ).trim();
  const rawBadge = (
    'badgeIcon' in envelope && typeof envelope.badgeIcon === 'string' ? envelope.badgeIcon : ''
  ).trim();
  const audience = (
    'audience' in envelope && typeof envelope.audience === 'string' ? envelope.audience : 'clinic'
  ) as 'patient' | 'clinic';

  const isPatientAudience = audience === 'patient';
  const personName = resolveToastPersonName(envelope);
  const rawAvatarUrl = resolveToastAvatarUrl(envelope);

  let headline = 'Ada kabar baru';
  let emoji = '👋';
  let isPerson = true;
  let systemIconType: string | null = rawBadge || 'bell';

  // Primary event mapping
  const titleLower = rawTitle.toLowerCase();
  const typeLower = rawType.toLowerCase();

  if (titleLower.includes('pasien baru') || typeLower.includes('appointment.created')) {
    headline = 'Ada pasien baru nih';
    emoji = '👋';
    isPerson = true;
  } else if (titleLower.includes('dibatalkan') || typeLower.includes('appointment.cancelled')) {
    headline = 'Janji temu dibatalkan';
    emoji = '📅';
    isPerson = true;
  } else if (
    titleLower.includes('dipanggil') ||
    typeLower.includes('appointment.patient_called') ||
    typeLower.includes('ticket.called')
  ) {
    headline = isPatientAudience ? 'Giliran Anda dipanggil' : 'Pasien sedang dipanggil';
    emoji = isPatientAudience ? '🩺' : '📢';
    isPerson = true;
  } else if (
    titleLower.includes('merespons') ||
    typeLower.includes('appointment.patient_responded')
  ) {
    headline = 'Pasien siap masuk';
    emoji = '🚪';
    isPerson = true;
  } else if (
    titleLower.includes('dipanggil ulang') ||
    typeLower.includes('appointment.patient_requeued')
  ) {
    headline = 'Antrean dipanggil ulang';
    emoji = '🔄';
    isPerson = true;
  } else if (
    titleLower.includes('tidak hadir') ||
    titleLower.includes('no show') ||
    typeLower.includes('appointment.no_show')
  ) {
    headline = isPatientAudience ? 'Panggilan terlewat' : 'Pasien tidak hadir';
    emoji = '⚠️';
    isPerson = true;
  } else if (titleLower.includes('selesai') || typeLower.includes('appointment.completed')) {
    headline = 'Pemeriksaan selesai';
    emoji = '✨';
    isPerson = true;
  } else if (
    titleLower.includes('jadwal') &&
    (titleLower.includes('diubah') ||
      titleLower.includes('dijadwalkan ulang') ||
      typeLower.includes('appointment.rescheduled'))
  ) {
    headline = isPatientAudience ? 'Jadwal janji temu diubah' : 'Jadwal pasien diubah';
    emoji = '🗓️';
    isPerson = true;
  } else if (
    titleLower.includes('dokter') &&
    (titleLower.includes('ditugaskan') ||
      titleLower.includes('diperbarui') ||
      typeLower.includes('appointment.assignment_updated'))
  ) {
    headline = isPatientAudience ? 'Dokter sudah ditugaskan' : 'Penugasan dokter diperbarui';
    emoji = '🩺';
    isPerson = true;
  } else if (titleLower.includes('check-in') || typeLower.includes('appointment.checked_in')) {
    headline = isPatientAudience ? 'Check-in berhasil' : 'Pasien sudah check-in';
    emoji = '✅';
    isPerson = true;
  } else if (
    titleLower.includes('chat') ||
    titleLower.includes('pesan') ||
    typeLower.includes('chat.message')
  ) {
    headline = isPatientAudience ? 'Pesan dari Klinik Amanah' : 'Pesan baru masuk';
    emoji = '💬';
    isPerson = true;
  } else if (
    titleLower.includes('izin') ||
    titleLower.includes('cuti') ||
    typeLower.includes('leave')
  ) {
    headline = 'Pengajuan izin baru';
    emoji = '📋';
    isPerson = true;
  } else if (
    titleLower.includes('presensi') ||
    titleLower.includes('kehadiran') ||
    typeLower.includes('attendance')
  ) {
    if (titleLower.includes('awal') || titleLower.includes('peringatan')) {
      headline = 'Pulang lebih awal';
      emoji = '⚠️';
    } else {
      headline = 'Presensi dinas tercatat';
      emoji = '⏰';
    }
    isPerson = true;
  } else if (
    titleLower.includes('upah') ||
    titleLower.includes('gaji') ||
    typeLower.includes('payroll')
  ) {
    headline = 'Upah dinas tercatat';
    emoji = '💰';
    isPerson = true;
  } else {
    // Generic system fallback
    headline = rawTitle || 'Notifikasi Baru';
    emoji = '🔔';
    isPerson = Boolean(rawAvatarUrl || personName);
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
    avatarUrl: rawAvatarUrl,
    isPerson,
    systemIconType,
    action: toastAction,
    duration: 6000
  };
}
