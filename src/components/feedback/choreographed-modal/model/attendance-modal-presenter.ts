import { openNotificationModal } from './notification-modal-store';
import type { ModalVariantKey, ChoreographyType } from '../types';
import { ATTENDANCE_ACTIONS, type AttendanceAction } from '@/features/kehadiran-pegawai/api/types';
import {
  CANONICAL_ATTENDANCE_STATUS
} from '@/features/kehadiran-pegawai/constants/attendance-status.constants';

export interface PresentAttendanceModalParams {
  id?: string;
  nama_staf: string;
  avatar?: string | null;
  kategori?: string | null;
  waktu_presensi?: string | null;
  checkInAt?: string | null;
  checkOutAt?: string | null;
  status?: string | null;
  shift?: string | null;
  action?: AttendanceAction;
  isEarlyDeparture?: boolean;
  isReplacement?: boolean;
  notes?: string;
  onNavigateDetail?: (id?: string) => void;
}

/**
 * Presenter use case: Maps upstream attendance events/records to the agnostic
 * choreographed notification modal, avoiding code duplication across socket & mutations.
 */
export function presentAttendanceModal(params: PresentAttendanceModalParams) {
  const isEarly = Boolean(params.isEarlyDeparture);
  const isCheckOut = params.action === ATTENDANCE_ACTIONS.CHECK_OUT;
  const isLate =
    params.status === CANONICAL_ATTENDANCE_STATUS.LATE ||
    params.status === 'late' ||
    params.status === 'Terlambat';
  const isReplacement = Boolean(params.isReplacement);

  let time = params.waktu_presensi ?? 'hari ini';
  if ((isCheckOut || isEarly) && params.checkOutAt) {
    try {
      const d = new Date(params.checkOutAt);
      if (!Number.isNaN(d.getTime())) {
        time = `${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB`;
      }
    } catch {
      // Retain time from upstream waktu_presensi
    }
  }

  const rawShift = params.shift ?? '';
  const localizedShift = rawShift;
  const shiftText = localizedShift ? `Shift ${localizedShift}` : undefined;

  let variant: ModalVariantKey = 'success';
  let choreography: ChoreographyType = 'pulse';
  let statusText = isReplacement
    ? 'Presensi Masuk • Shift Pengganti'
    : 'Presensi Masuk • Tepat Waktu';
  let title = isReplacement
    ? 'Presensi Masuk Berhasil!\nSelamat Bertugas sebagai Pengganti'
    : 'Presensi Masuk Berhasil!\nSelamat Bertugas Melayani Pasien';
  let subtitle = `Tercatat pada ${time}${shiftText ? ` • ${shiftText}` : ''}`;

  if (isEarly) {
    variant = 'warning';
    choreography = 'classic';
    statusText = 'Presensi Pulang Cepat';
    title = 'Presensi Pulang Cepat Tercatat';
    subtitle = params.notes
      ? `Alasan: ${params.notes} • Tercatat: ${time}`
      : `Tercatat pada ${time}${shiftText ? ` • ${shiftText}` : ''}`;
  } else if (isCheckOut) {
    variant = 'success';
    choreography = 'classic';
    statusText = 'Presensi Pulang • Selesai Bertugas';
    title = 'Presensi Pulang Berhasil!\nTerima Kasih atas Dedikasinya';
    subtitle = `Tercatat pada ${time}${shiftText ? ` • ${shiftText}` : ''}`;
  } else if (isLate) {
    variant = 'warning';
    choreography = 'classic';
    statusText = 'Presensi Masuk • Terlambat';
    title = 'Presensi Masuk Berhasil\nSelamat Bertugas Melayani Pasien';
    subtitle = `Tercatat pada ${time}${shiftText ? ` • ${shiftText}` : ''}`;
  }

  openNotificationModal({
    variant,
    choreography,
    statusText,
    title,
    subtitle,
    identity: {
      name: params.nama_staf,
      avatarUrl: params.avatar,
      role: params.kategori,
      badgeText: shiftText
    },
    primaryBtnText: 'Selesai',
    secondaryBtnText: 'Lihat Kehadiran',
    onSecondaryAction: () => {
      params.onNavigateDetail?.(params.id);
    },
    autoCloseDurationMs: 8000
  });
}
