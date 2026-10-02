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
    field('motherAge', TEXT, 'Umur saat ini', 'Umur', {
      helpText: 'Otomatis terhitung dari tanggal lahir.',
      colSpan: 1,
      disabled: true
    }),
    field('marriageOrder', TEXT, 'Pernikahan ke berapa?', 'Pernikahan ke', {
      helpText: 'Isi angka urutan pernikahan. Contoh: 1.',
      colSpan: 1
    }),
    optionalField('marriageDate', DATE, 'Tanggal menikah', 'Tanggal menikah', {
      helpText: 'Pilih tanggal menikah jika ingat. Kosongkan jika belum ingat.',
      colSpan: 'full'
    }),
    field('motherJob', LIST, 'Pekerjaan', 'Pekerjaan', {
      choices: defaultOccupationChoices,
      colSpan: 1
    }),
    field('motherEducation', LIST, 'Pendidikan terakhir', 'Pendidikan', {
      choices: educationChoices,
      colSpan: 1
    }),
    field('religion', LIST, 'Agama', 'Agama', {
      choices: religionChoices,
      colSpan: 1
    }),
    field('phoneNumber', TEXT, 'Nomor WhatsApp / telepon', 'No. telp', { colSpan: 1 }),
    field('domicileAddress', PARAGRAPH, 'Alamat tempat tinggal sekarang', 'Domisili', {
      colSpan: 'full'
    }),
    field('identityCardAddress', PARAGRAPH, 'Alamat sesuai KTP', 'Alamat KTP', {
      colSpan: 'full'
    })
  ]
};

export const domicileHealthCoverageSection: MedicalFormSection = {
  id: 'domicileHealthCoverage',
  title: 'Di mana kamu tinggal dan faskes terdekat?',
  description: 'Isi data kelompok Dasawisma, Posyandu, dan Puskesmas wilayah domisili.',
  layout: 'grid',
  fields: [
    field('dasawisma', TEXT, 'Nama Dasawisma', 'Dasawisma', {
      helpText: 'Isi nama kelompok Dasawisma jika terdaftar.',
      colSpan: 1
    }),
    field('posyandu', TEXT, 'Nama Posyandu', 'Posyandu', {
      helpText: 'Isi nama Posyandu wilayah domisili.',
      colSpan: 1
    }),
    field('puskesmas', TEXT, 'Nama Puskesmas wilayah domisili', 'Puskesmas', {
      helpText: 'Isi nama Puskesmas wilayah domisili.',
      colSpan: 'full'
    })
  ]
};

export const partnerIdentitySection: MedicalFormSection = {
  id: 'partnerIdentity',
  title: 'Boleh kenal lebih jauh dengan suami kamu?',
  description: 'Isi sesuai data suami yang diketahui.',
  layout: 'grid',
  fields: [
    field('partnerName', TEXT, 'Nama lengkap suami', 'Nama suami', { colSpan: 1 }),
    field('partnerNik', TEXT, 'NIK suami', 'NIK suami', {
      helpText: 'Isi 16 digit angka sesuai KTP atau KK pasangan.',
      colSpan: 1
    }),
    optionalField('partnerBirthDate', DATE, 'Tanggal lahir suami', 'Tanggal lahir suami', {
      helpText: 'Pilih tanggal lahir suami jika diketahui.',
      colSpan: 'full'
    }),
    field('partnerAge', TEXT, 'Umur suami saat ini', 'Umur suami', {
      helpText: 'Contoh: 31 tahun. Boleh isi perkiraan jika usia pasti belum diketahui.',
      colSpan: 1
    }),
    field('partnerJob', LIST, 'Pekerjaan suami', 'Pekerjaan suami', {
      choices: defaultOccupationChoices,
      colSpan: 1
    }),
    field('partnerEducation', LIST, 'Pendidikan terakhir suami', 'Pendidikan suami', {
      choices: educationChoices,
      colSpan: 1
    }),
    field('partnerBloodType', LIST, 'Golongan darah suami', 'Gol. darah suami', {
      choices: bloodTypeChoices,
      colSpan: 1
    })
  ]
};
