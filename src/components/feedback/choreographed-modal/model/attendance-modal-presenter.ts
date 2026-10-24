import { openNotificationModal } from './notification-modal-store';
import type { ModalVariantKey, ChoreographyType } from '../types';

export interface PresentAttendanceModalParams {
  id?: string;
  nama_staf: string;
  avatar?: string | null;
  kategori?: string | null;
  waktu_presensi?: string | null;
  waktu?: string | null;
  status?: string | null;
  shift?: string | null;
  action?: 'check_in' | 'manual_check_in' | 'check_out';
  isEarlyDeparture?: boolean;
  notes?: string;
  onNavigateDetail?: (id?: string) => void;
}

/**
 * Presenter use case: Maps upstream attendance events/records to the agnostic
 * choreographed notification modal, avoiding code duplication across socket & mutations.
 */
export function presentAttendanceModal(params: PresentAttendanceModalParams) {
  const isEarly = params.isEarlyDeparture;
  const isCheckOut = params.action === 'check_out';
  const isLate = params.status === 'Terlambat';
  const time = params.waktu_presensi || params.waktu || 'hari ini';
  const shiftText = params.shift ? `Shift ${params.shift}` : undefined;

  let variant: ModalVariantKey = 'success';
  let choreography: ChoreographyType = 'pulse';
  let statusText = 'Presensi Masuk • Tepat Waktu';
  let title = 'Presensi Masuk Berhasil!\nSelamat Bertugas Melayani Pasien';
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
