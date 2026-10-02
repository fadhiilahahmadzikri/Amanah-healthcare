import type { MedicalFlowDefinition } from './medical-appointment-types';
import { DATE, LIST, PARAGRAPH, TEXT, field } from './medical-appointment-field-builders';

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
        field('parentPhone', TEXT, 'Nomor WhatsApp/HP orang tua', 'No HP', {
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
      id: 'vaccineAndAllergyHistory',
      title: 'Riwayat Vaksin & Alergi',
      description:
        'Informasi riwayat vaksin sebelumnya dan riwayat alergi yang disampaikan orang tua.',
      fields: [
        field('previousVaccineHistory', PARAGRAPH, 'Riwayat vaksin sebelumnya', 'Riwayat vaksin', {
          helpText:
            'Contoh: HB 0 sudah diberikan setelah lahir, BCG dan Polio 1 saat usia 1 bulan. Tuliskan catatan dari buku KIA atau ingatan orang tua.'
        }),
        field('childAllergyHistory', PARAGRAPH, 'Riwayat alergi anak', 'Riwayat alergi', {
          helpText:
            'Tuliskan jika anak memiliki riwayat alergi obat, makanan, vaksin, atau hal lain. Jika tidak ada, tulis Tidak ada.'
        })
      ]
    }
  ]
};
