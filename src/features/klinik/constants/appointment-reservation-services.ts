import type { MedicalAppointmentFlow } from '../api/types';

export type AppointmentServiceCategoryId = 'general' | 'midwifery';

export interface AppointmentServiceCategory {
  id: AppointmentServiceCategoryId;
  title: string;
  icon?: string;
  description?: string;
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
    title: 'Layanan Umum',
    icon: '🩺',
    description: 'Pemeriksaan kesehatan umum, cek laboratorium, dan konsultasi dokter.'
  },
  {
    id: 'midwifery',
    title: 'Layanan Kebidanan',
    icon: '👶',
    description: 'Pemeriksaan kehamilan, persalinan, nifas, KB, dan imunisasi anak.'
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
  },
  {
    id: 'midwifery-khitan',
    categoryId: 'midwifery',
    title: 'Layanan Khitanan (Sirkumsisi)',
    doctorServiceName: 'Poli KIA',
    image: {
      src: '/healthcare/assets/images/ChatGPT_Image_Aug_14__2026__08_21_37_PM_1_eb18f970.webp',
      alt: 'Layanan Khitanan (Sirkumsisi)'
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

export function getReservationDoctorServiceName(service: AppointmentReservationService): string {
  if (service.doctorServiceName) {
    return service.doctorServiceName;
  }
  return service.title;
}

export function getReservationMedicalFlow(service: AppointmentReservationService) {
  return service.medicalFlow;
}

export function getServiceImage(title?: string): { src: string; alt: string } {
  if (!title) {
    return {
      src: '/healthcare/assets/images/layanan-umum-pemeriksaan.webp',
      alt: 'Layanan Poliklinik'
    };
  }

  const s = title.toLowerCase();
  if (s.includes('khitan') || s.includes('sirkumsisi') || s.includes('sunat')) {
    return {
      src: '/healthcare/assets/images/ChatGPT_Image_Aug_14__2026__08_21_37_PM_1_eb18f970.webp',
      alt: title
    };
  }
  if (s.includes('usg')) {
    return { src: '/healthcare/assets/images/asset-index-6.webp', alt: title };
  }
  if (s.includes('imunisasi')) {
    return { src: '/healthcare/assets/images/asset_imunisasi.webp', alt: title };
  }
  if (s.includes('persalinan') || s.includes('melahirkan')) {
    return { src: '/healthcare/assets/images/asset_persalinan.webp', alt: title };
  }
  if (s.includes('toilet') || s.includes('intim')) {
    return { src: '/healthcare/assets/images/asset_konsul_kb.webp', alt: title };
  }
  if (s.includes('kehamilan') || s.includes('hamil') || s.includes('anc')) {
    return { src: '/healthcare/assets/images/layanan-umum-kehamilan.webp', alt: title };
  }
  if (s.includes('nifas')) {
    return { src: '/healthcare/assets/images/asset-perawatannifas.webp', alt: title };
  }
  if (s.includes('kb') || s.includes('keluarga berencana')) {
    return { src: '/healthcare/assets/images/asset_kb.webp', alt: title };
  }
  if (s.includes('tumbuh kembang')) {
    return { src: '/healthcare/assets/images/asset_tumbuhkembanganak.webp', alt: title };
  }
  if (s.includes('tekanan darah') || s.includes('tensi')) {
    return { src: '/healthcare/assets/images/layanan-umum-tekanan-darah.webp', alt: title };
  }
  if (s.includes('laboratorium') || s.includes('lab') || s.includes('darah')) {
    return { src: '/healthcare/assets/images/layanan-umum-laboratorium.webp', alt: title };
  }
  if (s.includes('nebulizer') || s.includes('uap')) {
    return { src: '/healthcare/assets/images/dokumentasi/nebulizer.webp', alt: title };
  }
  if (s.includes('ecg') || s.includes('ekg') || s.includes('jantung')) {
    return { src: '/healthcare/assets/images/layanan-umum-pemantauan.webp', alt: title };
  }
  if (s.includes('surat') || s.includes('keterangan')) {
    return { src: '/healthcare/assets/images/layanan-umum-keterangan.webp', alt: title };
  }
  if (s.includes('konsultasi')) {
    return { src: '/healthcare/assets/images/layanan-umum-konsultasi.webp', alt: title };
  }
  if (s.includes('keluhan')) {
    return { src: '/healthcare/assets/images/layanan-umum-keluhan.webp', alt: title };
  }

  const found = APPOINTMENT_RESERVATION_SERVICES.find(
    (item) => item.title.toLowerCase() === s || s.includes(item.title.toLowerCase())
  );
  if (found) {
    return found.image;
  }

  return {
    src: '/healthcare/assets/images/layanan-umum-pemeriksaan.webp',
    alt: title
  };
}
