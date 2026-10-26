import { formatClinicDate, formatClinicDateTime } from '@/lib/date-format';
import type { Patient } from '../api/types';

/**
 * Single Source of Truth (SSOT) helper untuk pemformatan data tampilan profil & riwayat pasien.
 * Memastikan keselarasan penuh dengan kebijakan format tanggal & waktu klinik (`clinicConfig`).
 */
export const patientDisplayHelper = {
  /**
   * Format NIK resmi unmasked atau masked
   */
  getNikDisplay(patient: Patient, isLoading?: boolean): string {
    if (isLoading) return 'Memuat NIK resmi...';
    if (patient.nik) return patient.nik;
    return patient.masked_nik ?? '-';
  },

  /**
   * Format tempat, tanggal lahir dan usia pasien
   */
  getBirthDateDisplay(patient: Patient): string {
    if (!patient.birth_date) return '-';
    return formatClinicDate(patient.birth_date, { style: 'human_medium' });
  },

  /**
   * Format nomor telepon / WhatsApp pasien
   */
  getPhoneDisplay(patient: Patient): { text: string; isPlaceholder: boolean } {
    const raw = patient.phone;
    if (raw && raw !== '-' && raw.trim() !== '') {
      return { text: raw.trim(), isPlaceholder: false };
    }
    return { text: 'Belum ditambahkan', isPlaceholder: true };
  },

  /**
   * Format alamat email pasien
   */
  getEmailDisplay(patient: Patient): string {
    const raw = patient.email;
    if (raw && raw !== '-' && raw.trim() !== '') {
      return raw.trim();
    }
    return '-';
  },

  /**
   * Format tanggal registrasi akun pasien
   */
  getRegistrationDateDisplay(patient: Patient): string {
    const raw = patient.registered_at;
    if (!raw) return '-';
    return formatClinicDateTime(raw, {
      dateStyle: 'human_medium',
      timeStyle: '24h',
      withSuffix: true,
      suffix: 'WIB'
    });
  },

  /**
   * Format waktu login pertama kali pasien
   */
  getFirstLoginDisplay(patient: Patient): string {
    const raw = patient.first_login_at;
    if (raw) {
      return formatClinicDateTime(raw, {
        dateStyle: 'human_medium',
        timeStyle: '24h',
        withSuffix: true,
        suffix: 'WIB'
      });
    }

    if (patient.has_own_account) {
      return 'Belum pernah login';
    }

    return 'Pasien belum memiliki akun web';
  },

  /**
   * Format tanggal kunjungan / janji temu terakhir pasien
   */
  getLastVisitDisplay(patient: Patient): string {
    const raw = patient.last_visit_date;
    if (raw && raw !== '-') {
      return formatClinicDate(raw, { style: 'human_medium' });
    }
    return 'Belum ada kunjungan';
  },

  /**
   * Format ringkasan jumlah janji temu & kunjungan selesai
   */
  getVisitStatsDisplay(patient: Patient): string {
    const total = patient.total_appointments ?? 0;
    const completed = patient.completed_visits ?? 0;
    if (total > 0) {
      return `${total} janji temu (${completed} selesai)`;
    }
    return '0 janji temu';
  }
};
