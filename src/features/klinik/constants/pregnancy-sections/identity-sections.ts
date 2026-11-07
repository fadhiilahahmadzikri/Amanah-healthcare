import type { MedicalFormSection } from '../medical-appointment-types';
import {
  DATE,
  LIST,
  PARAGRAPH,
  TEXT,
  bloodTypeChoices,
  defaultOccupationChoices,
  educationChoices,
  field,
  optionalField,
  religionChoices
} from '../medical-appointment-field-builders';

export const motherIdentitySection: MedicalFormSection = {
  id: 'motherIdentity',
  title: 'Kenalan dulu, yuk',
  description: 'Isi data sesuai identitas dan kondisi saat ini.',
  layout: 'grid',
  fields: [
    field('motherName', TEXT, 'Nama lengkap', 'Nama lengkap', { colSpan: 1 }),
    field('motherNik', TEXT, 'NIK', 'NIK', {
      helpText: 'Isi 16 digit angka sesuai KTP.',
      colSpan: 1
    }),
    field('motherBirthDate', DATE, 'Tanggal lahir', 'Tanggal lahir', { colSpan: 'full' }),
    optionalField('motherAge', TEXT, 'Umur saat ini', 'Umur', {
      helpText: 'Otomatis terhitung dari tanggal lahir.',
      colSpan: 1,
      disabled: true
    }),
    optionalField('marriageOrder', TEXT, 'Pernikahan ke berapa?', 'Pernikahan ke', {
      helpText: 'Isi angka urutan pernikahan. Contoh: 1.',
      colSpan: 1
    }),
    optionalField('marriageDate', DATE, 'Tanggal menikah', 'Tanggal menikah', {
      helpText: 'Pilih tanggal menikah jika ingat. Kosongkan jika belum ingat.',
      colSpan: 'full'
    }),
    optionalField('motherJob', LIST, 'Pekerjaan', 'Pekerjaan', {
      choices: defaultOccupationChoices,
      colSpan: 1
    }),
    optionalField('motherEducation', LIST, 'Pendidikan terakhir', 'Pendidikan', {
      choices: educationChoices,
      colSpan: 1
    }),
    optionalField('religion', LIST, 'Agama', 'Agama', {
      choices: religionChoices,
      colSpan: 1
    }),
    field('phoneNumber', TEXT, 'Nomor WhatsApp / telepon', 'No. telp', { colSpan: 1 })
  ]
};

export const motherDomicileSection: MedicalFormSection = {
  id: 'motherDomicile',
  title: 'Alamat tempat tinggal sekarang',
  description: 'Pilih wilayah administratif dan alamat domisili calon ibu saat ini.',
  layout: 'region',
  fields: [
    optionalField('domicileAddress', PARAGRAPH, 'Alamat tempat tinggal sekarang', 'Domisili', {
      colSpan: 'full'
    }),
    optionalField('identityCardAddress', PARAGRAPH, 'Alamat sesuai KTP', 'Alamat KTP', {
      colSpan: 'full'
    }),
    optionalField('line1', TEXT, 'Alamat detail', 'Detail'),
    optionalField('villageName', TEXT, 'Kelurahan / Desa', 'Kelurahan'),
    optionalField('villageCode', TEXT, 'Kode Kelurahan', 'Kode Kel'),
    optionalField('districtName', TEXT, 'Kecamatan', 'Kecamatan'),
    optionalField('districtCode', TEXT, 'Kode Kecamatan', 'Kode Kec'),
    optionalField('regencyName', TEXT, 'Kota / Kabupaten', 'Kota/Kab'),
    optionalField('regencyCode', TEXT, 'Kode Kota', 'Kode Kota'),
    optionalField('provinceName', TEXT, 'Provinsi', 'Provinsi'),
    optionalField('provinceCode', TEXT, 'Kode Provinsi', 'Kode Prov')
  ]
};

export const domicileHealthCoverageSection: MedicalFormSection = {
  id: 'domicileHealthCoverage',
  title: 'Di mana kamu tinggal dan faskes terdekat?',
  description: 'Isi data kelompok Dasawisma, Posyandu, dan Puskesmas wilayah domisili jika diketahui.',
  layout: 'grid',
  fields: [
    optionalField('dasawisma', TEXT, 'Nama Dasawisma', 'Dasawisma', {
      helpText: 'Isi nama kelompok Dasawisma jika terdaftar.',
      colSpan: 1
    }),
    optionalField('posyandu', TEXT, 'Nama Posyandu', 'Posyandu', {
      helpText: 'Isi nama Posyandu wilayah domisili.',
      colSpan: 1
    }),
    optionalField('puskesmas', TEXT, 'Nama Puskesmas wilayah domisili', 'Puskesmas', {
      helpText: 'Isi nama Puskesmas wilayah domisili.',
      colSpan: 'full'
    })
  ]
};

export const partnerIdentitySection: MedicalFormSection = {
  id: 'partnerIdentity',
  title: 'Boleh kenal lebih jauh dengan suami kamu?',
  description: 'Isi sesuai data suami yang diketahui jika ada.',
  layout: 'grid',
  fields: [
    optionalField('partnerName', TEXT, 'Nama lengkap suami', 'Nama suami', { colSpan: 1 }),
    optionalField('partnerNik', TEXT, 'NIK suami', 'NIK suami', {
      helpText: 'Isi 16 digit angka sesuai KTP atau KK pasangan jika ada.',
      colSpan: 1
    }),
    optionalField('partnerBirthDate', DATE, 'Tanggal lahir suami', 'Tanggal lahir suami', {
      helpText: 'Pilih tanggal lahir suami jika diketahui.',
      colSpan: 'full'
    }),
    optionalField('partnerAge', TEXT, 'Umur suami saat ini', 'Umur suami', {
      helpText: 'Contoh: 31 tahun. Boleh isi perkiraan jika usia pasti belum diketahui.',
      colSpan: 1
    }),
    optionalField('partnerJob', LIST, 'Pekerjaan suami', 'Pekerjaan suami', {
      choices: defaultOccupationChoices,
      colSpan: 1
    }),
    optionalField('partnerEducation', LIST, 'Pendidikan terakhir suami', 'Pendidikan suami', {
      choices: educationChoices,
      colSpan: 1
    }),
    optionalField('partnerPhone', TEXT, 'Nomor HP suami', 'No. HP suami', {
      helpText: 'Isi nomor WhatsApp / HP suami jika ada.',
      colSpan: 1,
      format: 'phone'
    }),
    optionalField('partnerBloodType', LIST, 'Golongan darah suami', 'Gol. darah suami', {
      choices: bloodTypeChoices,
      colSpan: 1
    })
  ]
};
