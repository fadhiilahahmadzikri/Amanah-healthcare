/**
 * Konfigurasi Integrasi WhatsApp Resmi Klinik Amanah Healthcare
 *
 * Anda dapat mengubah nomor telepon atau teks pembuka (payload) di bawah ini
 * kapan saja sesuai kebutuhan operasional klinik.
 */

export const CLINIC_WHATSAPP_CONFIG = {
  /**
   * Nomor WhatsApp resmi klinik (format internasional tanpa '+', contoh: '6281392456664').
   */
  phoneNumber: '6281392456664',

  /**
   * Teks pesan pembuka default (payload).
   * Ubah string ini sesuai keinginan Anda.
   */
  defaultMessage: 'Halo Klinik Amanah, saya ingin berkonsultasi mengenai layanan kesehatan.',

  /**
   * Pilihan template pesan tambahan berdasarkan konteks kebutuhan.
   */
  templates: {
    consultation: 'Halo Klinik Amanah, saya ingin berkonsultasi mengenai layanan kesehatan.',
    appointment: 'Halo Klinik Amanah, saya ingin menjadwalkan janji temu dokter.',
    emergency: 'Halo Klinik Amanah, saya memerlukan informasi layanan medis darurat.'
  }
} as const;

/**
 * Menghasilkan link tautan langsung ke WhatsApp resmi klinik dengan payload pesan otomatis.
 *
 * @param customMessage (Opsional) Teks pesan kustom untuk menggantikan defaultMessage.
 * @returns URL wa.me lengkap (misal: https://wa.me/6281392456664?text=...)
 */
export function getClinicWhatsAppUrl(customMessage?: string): string {
  const phone = CLINIC_WHATSAPP_CONFIG.phoneNumber.replace(/\D/g, '');
  const text = customMessage || CLINIC_WHATSAPP_CONFIG.defaultMessage;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
