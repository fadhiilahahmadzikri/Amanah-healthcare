import type { PatientRegistrationStep } from '@/features/data-pasien/constants/registration-options';
import type {
  PatientAffiliationProfile,
  PatientRelationshipType
} from '@/features/data-pasien/api/patient-affiliation-service';
import type { ReferenceOptionItem } from '@/features/data-pasien/api/patient-reference-service';

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
    case 1:
      return {
        title: 'Siapa yang akan berobat?',
        description: 'Pilih profil yang akan berkonsultasi ke klinik hari ini'
      };
    case 2:
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
    case 3:
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
    case 4:
      return {
        title: 'Nama ibu kandung',
        description: 'Data nama ibu kandung diperlukan untuk verifikasi identitas dan rekam medis'
      };
    case 5:
      return {
        title: 'Tempat dan tanggal lahir',
        description: 'Pastikan tempat dan tanggal lahir sesuai identitas resmi'
      };
    case 6:
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
    case 7:
      return {
        title: 'Golongan darah pasien',
        description:
          'Pilih jenis golongan darah pasien atau pilih Belum Tahu jika belum diperiksa'
      };
    case 8:
      return {
        title: 'Nomor WhatsApp atau telepon',
        description:
          'Nomor aktif yang dapat dihubungi untuk konfirmasi antrean dan pengingat janji temu'
      };
    case 9:
      if (isSelf) {
        return {
          title: 'Kontak darurat kerabat (Opsional)',
          description:
            'Keluarga atau kerabat terdekat yang dapat dihubungi faskes dalam keadaan darurat medis'
        };
      }
      return {
        title: 'Kontak darurat kerabat',
        description:
          'Keluarga atau kerabat terdekat yang dapat dihubungi faskes dalam keadaan darurat medis'
      };
    case 10:
      return {
        title: 'Alamat domisili saat ini',
        description: 'Alamat tempat tinggal untuk rujukan dan data pasien'
      };
    case 11:
      return {
        title: 'Pekerjaan pasien',
        description: 'Pilih jenis pekerjaan atau kegiatan utama sehari-hari'
      };
    case 12:
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
