import type { MedicalFlowDefinition, MedicalFormField } from './medical-appointment-types';
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

const vaccineCodes = [
  { id: 'HB_0', title: 'HB 0 (Hepatitis B 0)', label: 'HB 0' },
  { id: 'BCG', title: 'BCG', label: 'BCG' },
  { id: 'PENTA_1', title: 'PENTA 1 / Heksavalen 1', label: 'PENTA 1' },
  { id: 'IPV_1', title: 'IPV 1 (Polio suntik 1)', label: 'IPV 1' },
  { id: 'PCV_1', title: 'PCV 1 (Pneumokokus 1)', label: 'PCV 1' },
  { id: 'RV_1', title: 'RV 1 (Rotavirus tetes 1)', label: 'RV 1' },
  { id: 'PENTA_2', title: 'PENTA 2 / Heksavalen 2', label: 'PENTA 2' },
  { id: 'IPV_2', title: 'IPV 2 (Polio suntik 2)', label: 'IPV 2' },
  { id: 'PCV_2', title: 'PCV 2 (Pneumokokus 2)', label: 'PCV 2' },
  { id: 'RV_2', title: 'RV 2 (Rotavirus tetes 2)', label: 'RV 2' },
  { id: 'PENTA_3', title: 'PENTA 3 / Heksavalen 3', label: 'PENTA 3' },
  { id: 'IPV_3', title: 'IPV 3 (Polio suntik 3)', label: 'IPV 3' },
  { id: 'RV_3', title: 'RV 3 (Rotavirus tetes 3)', label: 'RV 3' },
  { id: 'MR', title: 'MR (Campak Rubela)', label: 'MR' },
  { id: 'JE', title: 'JE (Japanese Encephalitis)', label: 'JE' },
  { id: 'PCV_B', title: 'PCV-B (Booster PCV)', label: 'PCV-B' },
  { id: 'PENTA_B', title: 'PENTA-B (Booster DPT-HB-Hib)', label: 'PENTA-B' },
  { id: 'MR_B', title: 'MR-B (Booster Campak Rubela)', label: 'MR-B' }
];

function buildVaccineChecklistFields(): MedicalFormField[] {
  const fields: MedicalFormField[] = [];

  for (const v of vaccineCodes) {
    fields.push(
      optionalField(`vaccine_${v.id}_status`, MULTIPLE_CHOICE, v.title, `${v.label} - status`, {
        choices: ['Sudah', 'Belum', 'Tidak tahu'],
        colSpan: 1
      })
    );
    fields.push(
      optionalField(
        `vaccine_${v.id}_date`,
        DATE,
        `Tanggal suntik ${v.label}`,
        `${v.label} - tanggal`,
        {
          colSpan: 1
        }
      )
    );
  }

  fields.push(
    optionalField('otherVaccinesNote', PARAGRAPH, 'Imunisasi lain', 'Imunisasi lain', {
      helpText:
        'Tuliskan jika ada imunisasi lain seperti polio tetes, influenza, atau catatan lain.',
      placeholder: 'Contoh: Polio tetes 4 kali di Puskesmas...',
      colSpan: 'full'
    })
  );

  fields.push(
    optionalField(
      'previousVaccineHistory',
      PARAGRAPH,
      'Ringkasan riwayat vaksinasi',
      'Riwayat vaksin',
      {
        colSpan: 'full'
      }
    )
  );

  return fields;
}

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
      fields: buildVaccineChecklistFields()
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
            placeholder: 'Contoh: Alergi antibiotik, alergi telur, atau tidak ada...',
            colSpan: 'full'
          }
        )
      ]
    }
  ]
};
