import { fakerID_ID as faker } from '@faker-js/faker';
import { IndonesianIdentityGenerator } from './indonesian-identity-generator';
import type { DynamicProfileOptions, GeneratedPatientProfile } from './types';

const RELATIONSHIP_LABELS: Record<string, string> = {
  anak: 'Anak',
  pasangan: 'Pasangan',
  orang_tua: 'Orang Tua',
  diri_sendiri: 'Diri Sendiri',
  kerabat: 'Kerabat',
  teman: 'Teman',
  lainnya: 'Lainnya'
};

const ADULT_OCCUPATIONS = [
  { code: 'karyawan_swasta', name: 'Karyawan Swasta' },
  { code: 'wiraswasta', name: 'Wiraswasta / Pengusaha' },
  { code: 'pns_tni_polri', name: 'Pegawai Negeri Sipil / TNI / Polri' },
  { code: 'guru_dosen', name: 'Guru / Dosen' },
  { code: 'tenaga_medis', name: 'Tenaga Medis / Kesehatan' },
  { code: 'ibu_rumah_tangga', name: 'Ibu Rumah Tangga' }
];

const CANONICAL_BLOOD_TYPES = ['a', 'b', 'ab', 'o'];

export class PatientProfileGenerator {
  private constructor() {}

  public static generate(options: DynamicProfileOptions = {}): GeneratedPatientProfile {
    const relationship = options.relationship || 'anak';
    const relationshipLabel = RELATIONSHIP_LABELS[relationship] || 'Pasien';

    const gender: 'male' | 'female' =
      options.gender || (faker.datatype.boolean() ? 'female' : 'male');

    // Dynamic age resolution based on relationship category
    const currentYear = new Date().getFullYear();
    let age: number;
    if (options.ageMin !== undefined && options.ageMax !== undefined) {
      age = faker.number.int({ min: options.ageMin, max: options.ageMax });
    } else {
      switch (relationship) {
        case 'anak':
          age = faker.number.int({ min: 3, max: 15 });
          break;
        case 'pasangan':
          age = faker.number.int({ min: 25, max: 48 });
          break;
        case 'orang_tua':
          age = faker.number.int({ min: 52, max: 74 });
          break;
        case 'diri_sendiri':
          age = faker.number.int({ min: 21, max: 55 });
          break;
        default:
          age = faker.number.int({ min: 18, max: 50 });
          break;
      }
    }

    const birthYear = currentYear - age;
    const birthMonth = String(faker.number.int({ min: 1, max: 12 })).padStart(2, '0');
    const birthDay = String(faker.number.int({ min: 1, max: 28 })).padStart(2, '0');
    const dateOfBirth = `${birthYear}-${birthMonth}-${birthDay}`;

    const fullName = faker.person.fullName({ sex: gender });
    const address = IndonesianIdentityGenerator.generateAddress(options.city);
    const nik = IndonesianIdentityGenerator.generateNik(
      dateOfBirth,
      gender === 'female',
      address.regencyCode ? `${address.regencyCode}01` : '320101'
    );
    const motherName = faker.person.fullName({ sex: 'female' });
    const placeOfBirth = address.regencyName.replace(/^(KABUPATEN|KOTA ADM\.|KOTA)\s+/i, '');

    const bloodType =
      options.bloodType ||
      CANONICAL_BLOOD_TYPES[Math.floor(Math.random() * CANONICAL_BLOOD_TYPES.length)];

    const phone = IndonesianIdentityGenerator.generatePhone();

    // Dynamic emergency contact based on relationship
    let emergencyContactName: string;
    let emergencyContactRelationship: string;
    if (relationship === 'anak') {
      emergencyContactName = faker.person.fullName({ sex: 'male' });
      emergencyContactRelationship = 'Ayah Kandung';
    } else if (relationship === 'pasangan') {
      emergencyContactName = faker.person.fullName({
        sex: gender === 'female' ? 'male' : 'female'
      });
      emergencyContactRelationship = gender === 'female' ? 'Suami' : 'Istri';
    } else if (relationship === 'orang_tua') {
      emergencyContactName = faker.person.fullName();
      emergencyContactRelationship = 'Anak Kandung';
    } else {
      emergencyContactName = faker.person.fullName();
      emergencyContactRelationship = 'Kerabat';
    }
    const emergencyContactPhone = IndonesianIdentityGenerator.generatePhone();

    // Dynamic occupation based on age/relationship
    let occupationCode: string;
    let occupationName: string;
    if (options.occupationCode) {
      occupationCode = options.occupationCode;
      const found = ADULT_OCCUPATIONS.find((o) => o.code === occupationCode);
      occupationName = found ? found.name : 'Pekerjaan Pasien';
    } else if (age < 18 || relationship === 'anak') {
      occupationCode = 'pelajar_mahasiswa';
      occupationName = 'Pelajar / Mahasiswa';
    } else if (gender === 'female' && faker.datatype.boolean()) {
      occupationCode = 'ibu_rumah_tangga';
      occupationName = 'Ibu Rumah Tangga';
    } else {
      const occ = ADULT_OCCUPATIONS[Math.floor(Math.random() * ADULT_OCCUPATIONS.length)];
      occupationCode = occ.code;
      occupationName = occ.name;
    }

    return {
      relationship,
      relationshipLabel,
      fullName,
      nik,
      motherName,
      placeOfBirth,
      dateOfBirth,
      gender,
      bloodType,
      phone,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelationship,
      provinceName: address.provinceName,
      provinceCode: address.provinceCode,
      regencyName: address.regencyName,
      regencyCode: address.regencyCode,
      districtName: address.districtName,
      districtCode: address.districtCode,
      villageName: address.villageName,
      villageCode: address.villageCode,
      line1: address.line1,
      fullAddress: address.fullAddress,
      occupationCode,
      occupationName
    };
  }

  public static toRecord(profile: GeneratedPatientProfile): Record<string, string> {
    return {
      relationship: profile.relationship,
      relationshipLabel: profile.relationshipLabel,
      fullName: profile.fullName,
      nik: profile.nik,
      motherName: profile.motherName,
      placeOfBirth: profile.placeOfBirth,
      dateOfBirth: profile.dateOfBirth,
      gender: profile.gender,
      bloodType: profile.bloodType,
      phone: profile.phone,
      emergencyContactName: profile.emergencyContactName,
      emergencyContactPhone: profile.emergencyContactPhone,
      emergencyContactRelationship: profile.emergencyContactRelationship,
      provinceName: profile.provinceName,
      provinceCode: profile.provinceCode,
      regencyName: profile.regencyName,
      regencyCode: profile.regencyCode,
      districtName: profile.districtName,
      districtCode: profile.districtCode,
      villageName: profile.villageName,
      villageCode: profile.villageCode,
      line1: profile.line1,
      fullAddress: profile.fullAddress,
      occupationCode: profile.occupationCode,
      occupationName: profile.occupationName,

      // Also provide standard camelCase / alternate keys for TanStack patient registration modal compatibility
      name: profile.fullName,
      nama_ibu_kandung: profile.motherName,
      tempat_lahir: profile.placeOfBirth,
      birth_date: profile.dateOfBirth,
      blood_type: profile.bloodType,
      provinsi: profile.provinceName,
      provinsi_id: profile.provinceCode,
      kabupaten: profile.regencyName,
      kabupaten_id: profile.regencyCode,
      kecamatan: profile.districtName,
      kecamatan_id: profile.districtCode,
      kelurahan: profile.villageName,
      kelurahan_id: profile.villageCode,
      alamat_detail: profile.line1,
      pekerjaan: profile.occupationName
    };
  }
}
