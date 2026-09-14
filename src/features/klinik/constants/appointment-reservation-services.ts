import type { MedicalAppointmentFlow } from '../api/types';

export type AppointmentServiceCategoryId = 'general' | 'midwifery';

export interface AppointmentServiceCategory {
  id: AppointmentServiceCategoryId;
  title: string;
}

export interface AppointmentReservationService {
  id: string;
  categoryId: AppointmentServiceCategoryId;
  title: string;
  doctorServiceName?: string;
  medicalFlow?: MedicalAppointmentFlow;
  image: {
    src: string;
    alt: string;
  };
}

export const APPOINTMENT_SERVICE_CATEGORIES: AppointmentServiceCategory[] = [
  {
    id: 'general',
    title: 'Layanan Umum'
  },
  {
    id: 'midwifery',
    title: 'Layanan Kebidanan'
  }
];

export const APPOINTMENT_RESERVATION_SERVICES: AppointmentReservationService[] = [
  {
    id: 'general-usg',
    categoryId: 'general',
    title: 'USG',
    image: {
      src: '/healthcare/assets/images/asset-index-6.webp',
      alt: 'Layanan USG'
    }
  },
  {
    id: 'general-examination',
    categoryId: 'general',
    title: 'Pemeriksaan Umum',
    image: {
      src: '/healthcare/assets/images/layanan-umum-pemeriksaan.webp',
      alt: 'Pemeriksaan umum'
    }
  },
  {
    id: 'general-minor-complaints',
    categoryId: 'general',
    title: 'Pengobatan Keluhan Ringan',
    image: {
      src: '/healthcare/assets/images/layanan-umum-keluhan.webp',
      alt: 'Pengobatan keluhan ringan'
    }
  },
  {
    id: 'general-blood-pressure',
    categoryId: 'general',
    title: 'Cek Tekanan Darah',
    image: {
      src: '/healthcare/assets/images/layanan-umum-tekanan-darah.webp',
      alt: 'Cek tekanan darah'
    }
  },
  {
    id: 'general-ecg',
    categoryId: 'general',
    title: 'ECG',
    image: {
      src: '/healthcare/assets/images/layanan-umum-pemantauan.webp',
      alt: 'Layanan ECG'
    }
  },
  {
    id: 'general-laboratory',
    categoryId: 'general',
    title: 'Pemeriksaan Laboratorium',
    image: {
      src: '/healthcare/assets/images/layanan-umum-laboratorium.webp',
      alt: 'Pemeriksaan laboratorium'
    }
  },
  {
    id: 'general-nebulizer',
    categoryId: 'general',
    title: 'Nebulizer',
    image: {
      src: '/healthcare/assets/images/dokumentasi/nebulizer.webp',
      alt: 'Layanan nebulizer'
    }
  },
  {
    id: 'general-pregnancy-exam',
    categoryId: 'general',
    title: 'Pemeriksaan Kehamilan',
    doctorServiceName: 'Kebidanan & Kandungan',
    medicalFlow: 'pregnancy',
    image: {
      src: '/healthcare/assets/images/layanan-umum-kehamilan.webp',
      alt: 'Pemeriksaan kehamilan'
    }
  },
  {
    id: 'general-health-consultation',
    categoryId: 'general',
    title: 'Konsultasi Kesehatan',
    image: {
      src: '/healthcare/assets/images/layanan-umum-konsultasi.webp',
      alt: 'Konsultasi kesehatan'
    }
  },
  {
    id: 'general-health-certificate',
    categoryId: 'general',
    title: 'Surat Keterangan Sehat',
    image: {
      src: '/healthcare/assets/images/layanan-umum-keterangan.webp',
      alt: 'Surat keterangan sehat'
    }
  },
  {
    id: 'midwifery-childbirth',
    categoryId: 'midwifery',
    title: 'Persalinan',
    doctorServiceName: 'Kebidanan & Kandungan',
    medicalFlow: 'pregnancy',
    image: {
      src: '/healthcare/assets/images/asset_persalinan.webp',
      alt: 'Layanan persalinan'
    }
  },
  {
    id: 'midwifery-pregnancy-exam',
    categoryId: 'midwifery',
    title: 'Pemeriksaan Kehamilan',
    doctorServiceName: 'Kebidanan & Kandungan',
    medicalFlow: 'pregnancy',
    image: {
      src: '/healthcare/assets/images/asset_pemeriksaankehamilan.webp',
      alt: 'Pemeriksaan kehamilan bidan'
    }
  },
  {
    id: 'midwifery-postpartum-care',
    categoryId: 'midwifery',
    title: 'Perawatan Nifas',
    doctorServiceName: 'Kebidanan & Kandungan',
    medicalFlow: 'pregnancy',
    image: {
      src: '/healthcare/assets/images/asset-perawatannifas.webp',
      alt: 'Perawatan nifas'
    }
  },
  {
    id: 'midwifery-family-planning',
    categoryId: 'midwifery',
    title: 'Keluarga Berencana (KB)',
    doctorServiceName: 'Kebidanan & Kandungan',
    medicalFlow: 'pregnancy',
    image: {
      src: '/healthcare/assets/images/asset_kb.webp',
      alt: 'Keluarga berencana'
    }
  },
  {
    id: 'midwifery-vaginal-toilet',
    categoryId: 'midwifery',
    title: 'Vaginal Toilet',
    doctorServiceName: 'Kebidanan & Kandungan',
    medicalFlow: 'pregnancy',
    image: {
      src: '/healthcare/assets/images/asset_konsul_kb.webp',
      alt: 'Layanan vaginal toilet'
    }
  },
  {
    id: 'midwifery-immunization',
    categoryId: 'midwifery',
    title: 'Imunisasi',
    doctorServiceName: 'Spesialis Anak',
    medicalFlow: 'immunization',
    image: {
      src: '/healthcare/assets/images/asset_imunisasi.webp',
      alt: 'Layanan imunisasi'
    }
  },
  {
    id: 'midwifery-growth-development',
    categoryId: 'midwifery',
    title: 'Pemeriksaan Tumbuh Kembang Anak',
    doctorServiceName: 'Spesialis Anak',
    image: {
      src: '/healthcare/assets/images/asset_tumbuhkembanganak.webp',
      alt: 'Pemeriksaan tumbuh kembang anak'
    }
  },
  {
    id: 'midwifery-reproductive-health',
    categoryId: 'midwifery',
    title: 'Konsultasi Kesehatan Reproduksi',
    doctorServiceName: 'Kebidanan & Kandungan',
    medicalFlow: 'pregnancy',
    image: {
      src: '/healthcare/assets/images/asset_konsul_kb.webp',
      alt: 'Konsultasi kesehatan reproduksi'
    }
  }
];

export function getReservationServicesByCategory(categoryId: AppointmentServiceCategoryId) {
  return APPOINTMENT_RESERVATION_SERVICES.filter((service) => service.categoryId === categoryId);
}

export function getReservationServiceByTitle(title?: string) {
  if (!title) {
    return undefined;
  }

  return APPOINTMENT_RESERVATION_SERVICES.find((service) => service.title === title);
}

export function getReservationDoctorServiceName(service: AppointmentReservationService) {
  return service.doctorServiceName || service.title;
}

export function getReservationMedicalFlow(service: AppointmentReservationService) {
  return service.medicalFlow;
}
