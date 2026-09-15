/**
 * Clinic knowledge base profile.
 * Keep operational data empty until it is connected to a trusted source.
 */

export interface DoctorSchedule {
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';
  doctor: string;
  time: string;
  usg: boolean;
  notes?: string;
}

export interface ClinicServiceCategory {
  category: string;
  items: string[];
}

export const CLINIC_PROFILE = {
  name: 'Klinik Pratama Amanah Healthcare',
  shortName: 'Klinik Amanah',
  tagline: '',
  operationalHours: '',
  contact: {
    phone: '',
    whatsapp: '',
    email: '',
    website: '',
    instagram: '',
    address: '',
    region: '',
    disclaimer: ''
  },
  values: [] as string[],
  doctors: [] as string[],
  schedules: [] as DoctorSchedule[],
  services: [] as ClinicServiceCategory[],
  facilities: [] as string[],
  insurance: {
    bpjsSupport: false,
    bpjsServices: [] as string[]
  },
  emergencyProtocol: {
    warning:
      'Untuk kondisi darurat mengancam jiwa (sesak napas berat, nyeri dada hebat, kejang, perdarahan masif, penurunan kesadaran), pasien harus segera dibawa ke IGD Rumah Sakit terdekat atau hubungi nomor darurat 119/118.'
  }
};
