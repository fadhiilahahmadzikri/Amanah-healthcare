import type { PatientRegistrationFormValues } from '../schemas/patient-registration-schema';

export type RegistrationOption = {
  label: string;
  value: string;
};

export type RegistrationVillage = RegistrationOption;

export type RegistrationDistrict = RegistrationOption & {
  villages: RegistrationVillage[];
};

export type RegistrationRegency = RegistrationOption & {
  districts: RegistrationDistrict[];
};

export type RegistrationProvince = RegistrationOption & {
  regencies: RegistrationRegency[];
};

export type PatientRegistrationStep = {
  title: string;
  description: string;
};

export const PATIENT_REGISTRATION_INPUT_STEP_COUNT = 8;

export const PATIENT_REGISTRATION_STEPS: PatientRegistrationStep[] = [
  {
    title: 'halo kak! kenalan dulu yuk 😊',
    description: 'siapa nama lengkap kamu sesuai KTP / KK?'
  },
  {
    title: 'sip! minta NIK kamu ya 🪪',
    description: 'masukkan 16 digit NIK KTP kamu untuk identifikasi rekam medis.'
  },
  {
    title: 'siapa nama ibu kandung kamu? 👩‍👧',
    description: 'data nama ibu kandung diperlukan untuk verifikasi identitas & rekam medis.'
  },
  {
    title: 'asik! di mana & kapan kamu lahir? 🎂',
    description: 'data tanggal lahir membantu dokter menghitung usia & konsultasi.'
  },
  {
    title: 'pilih jenis kelamin kamu 🚻',
    description: 'opsi ini digunakan untuk mencocokkan dokter & rekam medis.'
  },
  {
    title: 'apa golongan darah kamu? 🩸',
    description: 'data ini penting untuk catatan medis & penanganan darurat.'
  },
  {
    title: 'sekarang kamu tinggal dimana? 🏡',
    description: 'data domisili dipakai untuk pengiriman resep & surat rujukan.'
  },
  {
    title: 'dikit lagi kelar nih! 💼',
    description: 'apa pekerjaan atau kegiatan kamu sehari-hari?'
  },
  {
    title: 'hore! data kamu udah rapi 🎉',
    description: 'yuk periksa sekali lagi sebelum pendaftaran disimpan.'
  }
];

export const PATIENT_REGISTRATION_DEFAULT_VALUES: PatientRegistrationFormValues = {
  name: '',
  nik: '',
  nama_ibu_kandung: '',
  tempat_lahir: '',
  birth_date: '',
  gender: '' as PatientRegistrationFormValues['gender'],
  blood_type: '' as PatientRegistrationFormValues['blood_type'],
  provinsi: '',
  provinsi_id: '',
  kabupaten: '',
  kabupaten_id: '',
  kecamatan: '',
  kecamatan_id: '',
  kelurahan: '',
  kelurahan_id: '',
  alamat_detail: '',
  pekerjaan: ''
};

