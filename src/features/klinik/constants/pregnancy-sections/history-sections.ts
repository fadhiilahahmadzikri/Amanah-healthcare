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
    field('gravidaCount', TEXT, 'Total kehamilan termasuk sekarang', 'G', {
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
    field('hasPreviousPregnancyHistory', MULTIPLE_CHOICE, '', 'Ada riwayat obstetri', {
      choices: ['Ya, ada', 'Belum/tidak ada'],
      goToSectionIdByChoice: {
        'Ya, ada': 'previousPregnancy1Details',
        'Belum/tidak ada': 'contraceptionGateway'
      },
      colSpan: 'full'
    })
  ]
};

export function createPreviousPregnancySection(order: number): MedicalFormSection {
  return {
    id: `previousPregnancy${order}Details`,
    title: `Ceritakan riwayat persalinan ke-${order}`,
    description: 'Isi riwayat yang diingat. Lewati bagian yang tidak ada atau tidak ingat.',
    layout: 'grid',
    fields: previousPregnancyFields(order)
  };
}

export const previousPregnancySections: MedicalFormSection[] = [createPreviousPregnancySection(1)];

export const contraceptionGatewaySection: MedicalFormSection = {
  id: 'contraceptionGateway',
  title: 'Pernah menggunakan KB sebelumnya?',
  description: 'KB berarti alat atau cara untuk mengatur kehamilan.',
  fields: [
    field('hasContraceptionHistory', MULTIPLE_CHOICE, '', 'Ada riwayat KB', {
      choices: ['Ya, pernah', 'Belum pernah'],
      goToSectionIdByChoice: {
        'Ya, pernah': 'contraception1Details',
        'Belum pernah': 'closing'
      }
    })
  ]
};

export function createContraceptionSection(order: number): MedicalFormSection {
  return {
    id: `contraception${order}Details`,
    title: `Ceritakan riwayat KB ke-${order}`,
    description: 'Isi riwayat KB dalam bagian ini. Lewati bagian yang tidak ada atau tidak ingat.',
    layout: 'grid',
    fields: contraceptionFields(order)
  };
}

export const contraceptionSections: MedicalFormSection[] = [createContraceptionSection(1)];

export const closingSection: MedicalFormSection = {
  id: 'closing',
  title: 'Selesai',
  description:
    'Terima kasih. Setelah form dikirim, petugas akan memeriksa dan melengkapi data rekam medis.',
  fields: []
};
