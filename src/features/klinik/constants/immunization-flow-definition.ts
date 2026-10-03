import type { MedicalFlowDefinition } from './medical-appointment-types';
import {
  DATE,
  LIST,
  MULTIPLE_CHOICE,
  PARAGRAPH,
  TEXT,
  field,
  optionalField
} from './medical-appointment-field-builders';
import { ALLERGY_GATEWAY_CHOICE, VACCINE_GATEWAY_CHOICE } from './kia-constants';

export const immunizationFlowDefinition: MedicalFlowDefinition = {
  flow: 'immunization',
  formTitle: 'Form Pendaftaran Imunisasi Anak - Amanah Health Care',
  formDescription:
    'Form pendaftaran ini diisi oleh orang tua/wali sebelum kunjungan imunisasi anak.',
  serviceName: 'Spesialis Anak',
  visitType: 'Imunisasi Anak',
  patientNameFieldId: 'childName',
  patientContactFieldId: 'parentPhone',
  complaintFieldId: 'previousVaccineHistory',
  sections: [
    {
      id: 'childIdentity',
      title: 'Data Identitas Anak',
      description: 'Isi data identitas anak sesuai KK atau kartu identitas anak.',
      layout: 'grid',
      fields: [
        field('childName', TEXT, 'Nama lengkap anak', 'Nama anak', {
          placeholder: 'Masukkan nama anak',
          colSpan: 1
        }),
        field('childNik', TEXT, 'NIK anak', 'NIK anak', {
          helpText: 'Isi 16 digit angka sesuai KK atau kartu identitas anak.',
          placeholder: '16 digit NIK anak',
          colSpan: 1
        }),
        field('childBirthDate', DATE, 'Tanggal lahir anak', 'Tanggal lahir anak', {
          helpText: 'Pilih tanggal lahir anak pada kalender.',
          colSpan: 1
        }),
        field('childSex', LIST, 'Jenis kelamin anak', 'Jenis kelamin anak', {
          choices: ['Laki-laki', 'Perempuan'],
          colSpan: 1
        }),
        field('parentPhone', TEXT, 'Nomor HP orang tua/wali', 'Nomor HP', {
          helpText: 'Nomor aktif yang dapat dihubungi untuk konfirmasi jadwal.',
          placeholder: 'Contoh: 081234567890',
          colSpan: 'full'
        })
      ]
    },
    {
      id: 'parentIdentity',
      title: 'Data Orang Tua & Alamat',
      description: 'Isi data orang tua/wali dan alamat domisili tempat tinggal anak.',
      layout: 'grid',
      fields: [
        field('fatherName', TEXT, 'Nama Ayah', 'Nama ayah', {
          helpText: 'Isi nama ayah kandung/wali sesuai KK.',
          placeholder: 'Nama lengkap ayah/wali',
          colSpan: 1
        }),
        field('motherName', TEXT, 'Nama Ibu', 'Nama ibu', {
          helpText: 'Isi nama ibu kandung sesuai KK.',
          placeholder: 'Nama lengkap ibu kandung',
          colSpan: 1
        }),
        field('childAddress', PARAGRAPH, 'Alamat tempat tinggal', 'Alamat', {
          helpText: 'Tuliskan alamat domisili tempat tinggal anak saat ini.',
          placeholder: 'Tuliskan alamat domisili lengkap...',
          colSpan: 'full'
        })
      ]
    },
    {
      id: 'vaccineGateway',
      title: 'Riwayat Vaksinasi Anak',
      description: 'Informasi ini membantu dokter/petugas mengetahui status vaksinasi si kecil.',
      fields: [
        field(
          'hasVaccineHistory',
          MULTIPLE_CHOICE,
          'Apakah si kecil pernah mendapat imunisasi sebelumnya?',
          'Pernah imunisasi',
          {
            choices: [VACCINE_GATEWAY_CHOICE.YES, VACCINE_GATEWAY_CHOICE.NO],
            colSpan: 'full'
          }
        )
      ]
    },
    {
      id: 'vaccineHistory',
      title: 'Daftar Riwayat Vaksinasi Anak',
      description: 'Pilih status pemberian vaksin yang diingat atau sesuai catatan Buku KIA.',
      layout: 'questionnaire',
      fields: []
    },
    {
      id: 'allergyHistory',
      title: 'Riwayat Alergi Anak',
      description:
        'Informasi riwayat alergi obat, makanan, atau vaksin untuk keselamatan si kecil.',
      fields: [
        field(
          'hasAllergyHistory',
          MULTIPLE_CHOICE,
          'Apakah anak memiliki riwayat alergi?',
          'Ada alergi',
          {
            choices: [ALLERGY_GATEWAY_CHOICE.NO, ALLERGY_GATEWAY_CHOICE.YES],
            colSpan: 'full'
          }
        ),
        optionalField(
          'childAllergyHistory',
          PARAGRAPH,
          'Detail riwayat alergi anak',
          'Riwayat alergi',
          {
            helpText:
              'Tuliskan jika anak memiliki riwayat alergi obat, makanan, vaksin, atau hal lain.',
            placeholder: 'Contoh: Alergi antibiotik, alergi telur, atau hal lain...',
            colSpan: 'full',
            visibleIf: (values) => values.hasAllergyHistory === ALLERGY_GATEWAY_CHOICE.YES
          }
        )
      ]
    }
  ]
};
