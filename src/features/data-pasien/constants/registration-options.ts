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

export const PATIENT_REGISTRATION_GENDER_OPTIONS: RegistrationOption[] = [
  { label: 'laki-laki', value: 'Laki-laki' },
  { label: 'perempuan', value: 'Perempuan' }
];

export const PATIENT_REGISTRATION_BLOOD_TYPE_OPTIONS: RegistrationOption[] = [
  { label: 'A', value: 'A' },
  { label: 'B', value: 'B' },
  { label: 'AB', value: 'AB' },
  { label: 'O', value: 'O' },
  { label: 'belum tahu', value: 'Belum Tahu' }
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

export const PATIENT_REGISTRATION_REGIONS: RegistrationProvince[] = [
  {
    label: 'DKI Jakarta',
    value: '31',
    regencies: [
      {
        label: 'Kota Jakarta Selatan',
        value: '3174',
        districts: [
          {
            label: 'Setiabudi',
            value: '317401',
            villages: [
              { label: 'Karet', value: '3174011001' },
              { label: 'Menteng Atas', value: '3174011002' }
            ]
          },
          {
            label: 'Tebet',
            value: '317402',
            villages: [
              { label: 'Tebet Barat', value: '3174021001' },
              { label: 'Manggarai', value: '3174021002' }
            ]
          }
        ]
      },
      {
        label: 'Kota Jakarta Pusat',
        value: '3173',
        districts: [
          {
            label: 'Tanah Abang',
            value: '317301',
            villages: [
              { label: 'Kebon Melati', value: '3173011001' },
              { label: 'Karet Tengsin', value: '3173011002' }
            ]
          }
        ]
      }
    ]
  },
  {
    label: 'Jawa Barat',
    value: '32',
    regencies: [
      {
        label: 'Kota Bandung',
        value: '3273',
        districts: [
          {
            label: 'Coblong',
            value: '327301',
            villages: [
              { label: 'Dago', value: '3273011001' },
              { label: 'Cipaganti', value: '3273011002' }
            ]
          },
          {
            label: 'Lengkong',
            value: '327302',
            villages: [
              { label: 'Cikawao', value: '3273021001' },
              { label: 'Malabar', value: '3273021002' }
            ]
          }
        ]
      },
      {
        label: 'Kabupaten Bogor',
        value: '3201',
        districts: [
          {
            label: 'Cibinong',
            value: '320101',
            villages: [
              { label: 'Pakansari', value: '3201011001' },
              { label: 'Nanggewer', value: '3201011002' }
            ]
          }
        ]
      }
    ]
  },
  {
    label: 'Jawa Timur',
    value: '35',
    regencies: [
      {
        label: 'Kota Surabaya',
        value: '3578',
        districts: [
          {
            label: 'Gubeng',
            value: '357801',
            villages: [
              { label: 'Airlangga', value: '3578011001' },
              { label: 'Mojo', value: '3578011002' }
            ]
          },
          {
            label: 'Tegalsari',
            value: '357802',
            villages: [
              { label: 'Kedungdoro', value: '3578021001' },
              { label: 'Keputran', value: '3578021002' }
            ]
          }
        ]
      }
    ]
  }
];
