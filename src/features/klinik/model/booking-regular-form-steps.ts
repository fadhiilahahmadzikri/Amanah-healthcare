import type { PatientRegistrationStep } from '@/features/data-pasien/constants/registration-options';
import type {
  PatientAffiliationProfile,
  PatientRelationshipType
} from '@/features/data-pasien/api/patient-affiliation-service';
import type { ReferenceOptionItem } from '@/features/data-pasien/api/patient-reference-service';

export const REGULAR_BOOKING_STEPS = {
  TARGET_PATIENT: 1,
  FULL_NAME: 2,
  NIK: 3,
  MOTHER_NAME: 4,
  BIRTH_INFO: 5,
  GENDER: 6,
  BLOOD_TYPE: 7,
  PHONE: 8,
  EMERGENCY_CHOICE: 9,
  EMERGENCY_DETAIL: 10,
  ADDRESS: 11,
  OCCUPATION: 12,
  CONFIRMATION: 13
} as const;

export type RegularBookingStepNumber =
  (typeof REGULAR_BOOKING_STEPS)[keyof typeof REGULAR_BOOKING_STEPS];

export interface UseBookingRegularPatientFormOptions {
  onSuccess: (newPatient: PatientAffiliationProfile) => void;
  onCancel: () => void;
  targetFlow?: string;
  onRelationshipSubmit?: (relationship: PatientRelationshipType) => void;
  allowedRelationships?: ReferenceOptionItem[];
  hasExistingSelf?: boolean;
  initialRelationship?: PatientRelationshipType | string;
  existingPatients?: PatientAffiliationProfile[];
}

export function getBookingStepMeta(
  step: number,
  isSelf: boolean,
  relationshipLabel?: string
): PatientRegistrationStep {
  switch (step) {
    case REGULAR_BOOKING_STEPS.TARGET_PATIENT:
      return {
        title: 'Siapa yang akan berobat?',
        description: 'Pilih profil yang akan berkonsultasi ke klinik hari ini'
      };
    case REGULAR_BOOKING_STEPS.FULL_NAME:
      if (isSelf) {
        return {
          title: 'Data identitas diri',
          description: 'Masukkan nama lengkap Anda sesuai KTP atau identitas resmi'
        };
      }
      return {
        title: `Nama lengkap ${relationshipLabel || 'pasien'}`,
        description: 'Masukkan nama lengkap pasien sesuai KTP atau kartu keluarga'
      };
    case REGULAR_BOOKING_STEPS.NIK:
      if (isSelf) {
        return {
          title: 'Nomor Induk Kependudukan',
          description: '16 digit NIK KTP Anda untuk identifikasi rekam medis resmi'
        };
      }
      return {
        title: `NIK ${relationshipLabel || 'pasien'}`,
        description: '16 digit NIK sesuai KTP atau KK untuk verifikasi rekam medis'
      };
    case REGULAR_BOOKING_STEPS.MOTHER_NAME:
      return {
        title: 'Nama ibu kandung',
        description: 'Data nama ibu kandung diperlukan untuk verifikasi identitas dan rekam medis'
      };
    case REGULAR_BOOKING_STEPS.BIRTH_INFO:
      return {
        title: 'Tempat dan tanggal lahir',
        description: 'Pastikan tempat dan tanggal lahir sesuai identitas resmi'
      };
    case REGULAR_BOOKING_STEPS.GENDER:
      if (isSelf) {
        return {
          title: 'Jenis kelamin Anda',
          description: 'Pilih jenis kelamin sesuai identitas KTP Anda'
        };
      }
      return {
        title: `Jenis kelamin ${relationshipLabel || 'pasien'}`,
        description: 'Pilih jenis kelamin sesuai identitas resmi'
      };
    case REGULAR_BOOKING_STEPS.BLOOD_TYPE:
      return {
        title: 'Golongan darah pasien',
        description:
          'Pilih jenis golongan darah pasien atau pilih Belum Tahu jika belum diperiksa'
      };
    case REGULAR_BOOKING_STEPS.PHONE:
      return {
        title: 'Nomor WhatsApp atau telepon',
        description:
          'Nomor aktif yang dapat dihubungi untuk konfirmasi antrean dan pengingat janji temu'
      };
    case REGULAR_BOOKING_STEPS.EMERGENCY_CHOICE:
      return {
        title: 'Punya kontak darurat?',
        description:
          'Keluarga atau kerabat terdekat yang dapat dihubungi faskes dalam keadaan darurat medis'
      };
    case REGULAR_BOOKING_STEPS.EMERGENCY_DETAIL:
      return {
        title: 'Data kontak darurat',
        description:
          'Pilih kerabat terdaftar atau masukkan nama dan nomor telepon baru'
      };
    case REGULAR_BOOKING_STEPS.ADDRESS:
      return {
        title: 'Alamat domisili saat ini',
        description: 'Alamat tempat tinggal untuk rujukan dan data pasien'
      };
    case REGULAR_BOOKING_STEPS.OCCUPATION:
      return {
        title: 'Pekerjaan pasien',
        description: 'Pilih jenis pekerjaan atau kegiatan utama sehari-hari'
      };
    case REGULAR_BOOKING_STEPS.CONFIRMATION:
      return {
        title: 'Konfirmasi data pendaftaran',
        description: 'Periksa kembali kelengkapan data sebelum disimpan'
      };
    default:
      return {
        title: 'Data pasien',
        description: 'Lengkapi data identitas'
      };
  }
}
