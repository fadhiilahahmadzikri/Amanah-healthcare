import type { MedicalFormSection } from '../medical-appointment-types';
import {
  MULTIPLE_CHOICE,
  TEXT,
  contraceptionFields,
  field,
  previousPregnancyFields
} from '../medical-appointment-field-builders';

export const obstetricSummarySection: MedicalFormSection = {
  id: 'obstetricSummary',
  title: 'Ceritakan riwayat kehamilan kamu',
  description:
    'Isi jumlahnya dulu. Detail riwayat sebelumnya akan ditanyakan satu per satu jika ada.',
  layout: 'grid',
  fields: [
    field('gravidaCount', TEXT, 'Berapa total kehamilan termasuk yang sekarang?', 'G', {
      helpText: 'Contoh: sedang hamil anak kedua, isi 2.',
      placeholder: 'Contoh: 1',
      colSpan: 1
    }),
    field('parityCount', TEXT, 'Berapa kali pernah melahirkan?', 'P', {
      helpText: 'Jika belum pernah, isi 0.',
      placeholder: 'Contoh: 0',
      colSpan: 1
    }),
    field(
      'abortionCount',
      TEXT,
      'Berapa kali pernah keguguran atau kehamilan tidak berlanjut?',
      'Ab',
      {
        helpText: 'Jika tidak pernah, isi 0.',
        placeholder: 'Contoh: 0',
        colSpan: 'full'
      }
    ),
    field('livingChildrenCount', TEXT, 'Berapa anak yang saat ini masih hidup?', 'Ah', {
      helpText: 'Jika belum ada, isi 0.',
      placeholder: 'Contoh: 1',
      colSpan: 'full'
    })
  ]
};

export const obstetricGatewaySection: MedicalFormSection = {
  id: 'obstetricGateway',
  title: 'Ada riwayat kehamilan atau persalinan sebelumnya?',
  description: 'Informasi ini membantu bidan memahami kondisi kehamilan saat ini.',
  fields: [
    field(
      'hasPreviousPregnancyHistory',
      MULTIPLE_CHOICE,
      'Apakah Anda memiliki riwayat kehamilan atau persalinan sebelumnya?',
      'Ada riwayat obstetri',
      {
        choices: ['Ya, ada', 'Belum/tidak ada'],
        goToSectionIdByChoice: {
          'Ya, ada': 'previousPregnancy1Details',
          'Belum/tidak ada': 'contraceptionGateway'
        },
        colSpan: 'full'
      }
    )
  ]
};

export const previousPregnancySections: MedicalFormSection[] = [
  {
    id: 'previousPregnancy1Details',
    title: 'Ceritakan riwayat persalinan sebelumnya',
    description: 'Isi riwayat yang diingat. Lewati bagian yang tidak ada atau tidak ingat.',
    layout: 'grid',
    fields: previousPregnancyFields(1)
  },
  {
    id: 'previousPregnancy2Details',
    title: 'Ceritakan riwayat persalinan sebelumnya',
    description:
      'Isi riwayat berikutnya yang diingat. Lewati bagian yang tidak ada atau tidak ingat.',
    layout: 'grid',
    fields: previousPregnancyFields(2)
  },
  {
    id: 'previousPregnancy3Details',
    title: 'Ceritakan riwayat persalinan sebelumnya',
    description:
      'Isi riwayat berikutnya yang diingat. Lewati bagian yang tidak ada atau tidak ingat.',
    layout: 'grid',
    fields: previousPregnancyFields(3)
  },
  {
    id: 'previousPregnancy4Details',
    title: 'Ceritakan riwayat persalinan sebelumnya',
    description:
      'Isi riwayat berikutnya yang diingat. Lewati bagian yang tidak ada atau tidak ingat.',
    layout: 'grid',
    fields: previousPregnancyFields(4)
  }
];

export const contraceptionGatewaySection: MedicalFormSection = {
  id: 'contraceptionGateway',
  title: 'Pernah menggunakan KB sebelumnya?',
  description: 'KB berarti alat atau cara untuk mengatur kehamilan.',
  fields: [
    field(
      'hasContraceptionHistory',
      MULTIPLE_CHOICE,
      'Apakah Anda pernah menggunakan KB/kontrasepsi?',
      'Ada riwayat KB',
      {
        choices: ['Ya, pernah', 'Belum pernah'],
        goToSectionIdByChoice: {
          'Ya, pernah': 'contraception1Details',
          'Belum pernah': 'closing'
        }
      }
    )
  ]
};

export const contraceptionSections: MedicalFormSection[] = [
  {
    id: 'contraception1Details',
    title: 'Ceritakan riwayat KB kamu',
    description: 'Isi riwayat KB dalam bagian ini. Lewati bagian yang tidak ada atau tidak ingat.',
    layout: 'grid',
    fields: contraceptionFields(1)
  },
  {
    id: 'contraception2Details',
    title: 'Ceritakan riwayat KB kamu',
    description: 'Isi jika ada riwayat KB berikutnya. Lewati jika tidak ada.',
    layout: 'grid',
    fields: contraceptionFields(2)
  },
  {
    id: 'contraception3Details',
    title: 'Ceritakan riwayat KB kamu',
    description: 'Isi jika ada riwayat KB berikutnya. Lewati jika tidak ada.',
    layout: 'grid',
    fields: contraceptionFields(3)
  },
  {
    id: 'contraception4Details',
    title: 'Ceritakan riwayat KB kamu',
    description:
      'Isi jika ada riwayat KB berikutnya. Bila lebih dari 4, sampaikan sisanya ke bidan saat kunjungan.',
    layout: 'grid',
    fields: contraceptionFields(4)
  }
];

export const closingSection: MedicalFormSection = {
  id: 'closing',
  title: 'Selesai',
  description:
    'Terima kasih. Setelah form dikirim, petugas akan memeriksa dan melengkapi data rekam medis.',
  fields: []
};
