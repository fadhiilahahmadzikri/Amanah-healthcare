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
    return patient.nik || patient.nik_ktp || patient.masked_nik || '-';
  },

  /**
   * Format tempat, tanggal lahir dan usia pasien
   */
  getBirthDateDisplay(patient: Patient): string {
    const rawBirthDate = patient.birth_date || patient.tanggal_lahir;
    if (!rawBirthDate) return '-';
    return formatClinicDate(rawBirthDate, { style: 'human_medium' });
  },

  /**
   * Format nomor telepon / WhatsApp pasien
   */
  getPhoneDisplay(patient: Patient): { text: string; isPlaceholder: boolean } {
    const raw = patient.nomor_telepon_wa || patient.phone;
    if (raw && raw !== '-' && raw.trim() !== '') {
      return { text: raw.trim(), isPlaceholder: false };
    }
    return { text: 'Belum ditambahkan', isPlaceholder: true };
  },

  /**
   * Format alamat email pasien
   */
  getEmailDisplay(patient: Patient): string {
    const raw = patient.email_pasien || patient.email;
    if (raw && raw !== '-' && raw.trim() !== '') {
      return raw.trim();
    }
    return '-';
  },

  /**
   * Format tanggal registrasi akun pasien
   */
  getRegistrationDateDisplay(patient: Patient): string {
    const raw = patient.tanggal_registrasi_akun || patient.created_at;
    if (!raw) return '-';
    return formatClinicDateTime(raw, {
      dateStyle: 'human_medium',
      timeStyle: '24h',
      withSuffix: true,
      suffix: 'WIB',
    });
  },

  /**
   * Format waktu login pertama kali pasien
   */
  getFirstLoginDisplay(patient: Patient): string {
    const raw = patient.login_pertama_kali;
    if (raw) {
      return formatClinicDateTime(raw, {
        dateStyle: 'human_medium',
        timeStyle: '24h',
        withSuffix: true,
        suffix: 'WIB',
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
    const raw = patient.last_visit_date || patient.kunjungan_terakhir;
    if (raw && raw !== '-') {
      return formatClinicDate(raw, { style: 'human_medium' });
    }
    return 'Belum ada kunjungan';
  },

  /**
   * Format ringkasan jumlah janji temu & kunjungan selesai
   */
  getVisitStatsDisplay(patient: Patient): string {
    const total = patient.total_appointments ?? patient.total_kunjungan ?? 0;
    const completed = patient.completed_visits ?? 0;
    if (total > 0) {
      return `${total} janji temu (${completed} selesai)`;
    }
    return '0 janji temu';
  },
};
