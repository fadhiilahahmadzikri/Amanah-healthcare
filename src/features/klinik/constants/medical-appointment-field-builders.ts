import type {
  MedicalChoiceOption,
  MedicalFieldType,
  MedicalFormField
} from './medical-appointment-types';
import {
  BIRTH_ATTENDANT_OPTIONS,
  CONTRACEPTIVE_TYPE_OPTIONS,
  DELIVERY_METHOD_OPTIONS,
  DELIVERY_PLACE_OPTIONS
} from '@/features/maternity/constants/maternity.constants';
import { GENDER_OPTIONS } from '@/constants/gender.constants';

export const FIELD_TYPES = {
  TEXT: 'TEXT',
  PARAGRAPH: 'PARAGRAPH',
  DATE: 'DATE',
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  LIST: 'LIST'
} as const;

export const TEXT = FIELD_TYPES.TEXT;
export const PARAGRAPH = FIELD_TYPES.PARAGRAPH;
export const DATE = FIELD_TYPES.DATE;
export const MULTIPLE_CHOICE = FIELD_TYPES.MULTIPLE_CHOICE;
export const LIST = FIELD_TYPES.LIST;

export const yesNoChoices: string[] = ['Tidak', 'Ya'];
export const educationChoices: string[] = [];
export const bloodTypeChoices: string[] = [];
export const religionChoices: string[] = [];
export const defaultOccupationChoices: string[] = [];
export const tetanusChoices: string[] = [];
export const childSexChoices: MedicalChoiceOption[] = [...GENDER_OPTIONS];
export const birthAttendantChoices: string[] = [...BIRTH_ATTENDANT_OPTIONS];
export const deliveryMethodChoices: string[] = [...DELIVERY_METHOD_OPTIONS];
export const deliveryPlaceChoices: string[] = [...DELIVERY_PLACE_OPTIONS];
export const contraceptiveTypeChoices: string[] = [...CONTRACEPTIVE_TYPE_OPTIONS];

export function field(
  id: string,
  type: MedicalFieldType,
  title: string,
  label: string,
  options?: Partial<
    Pick<
      MedicalFormField,
      | 'helpText'
      | 'required'
      | 'choices'
      | 'goToSectionIdByChoice'
      | 'colSpan'
      | 'yearFieldId'
      | 'notesFieldId'
      | 'placeholder'
      | 'disabled'
      | 'visibleIf'
      | 'format'
      | 'allowCustomInput'
    >
  >
): MedicalFormField {
  return {
    id,
    type,
    title,
    label,
    helpText: options?.helpText || '',
    placeholder: options?.placeholder,
    required: options?.required !== false,
    choices: options?.choices || [],
    goToSectionIdByChoice: options?.goToSectionIdByChoice || null,
    colSpan: options?.colSpan || (type === 'PARAGRAPH' ? 'full' : 1),
    yearFieldId: options?.yearFieldId,
    notesFieldId: options?.notesFieldId,
    disabled: options?.disabled,
    visibleIf: options?.visibleIf,
    format: options?.format,
    allowCustomInput: options?.allowCustomInput
  };
}

export function optionalField(
  id: string,
  type: MedicalFieldType,
  title: string,
  label: string,
  options?: Partial<
    Pick<
      MedicalFormField,
      | 'helpText'
      | 'choices'
      | 'goToSectionIdByChoice'
      | 'colSpan'
      | 'yearFieldId'
      | 'notesFieldId'
      | 'placeholder'
      | 'disabled'
      | 'visibleIf'
      | 'format'
      | 'allowCustomInput'
    >
  >
): MedicalFormField {
  return field(id, type, title, label, { ...options, required: false });
}

export function yesNoField(
  id: string,
  title: string,
  label: string,
  helpText = '',
  yearFieldId?: string,
  required = false
): MedicalFormField {
  return field(id, MULTIPLE_CHOICE, title, label, {
    helpText,
    choices: yesNoChoices,
    yearFieldId,
    required
  });
}

export function diseaseStatusFields(config: {
  statusId: string;
  notesId: string;
  statusTitle: string;
  statusLabel: string;
  notesTitle: string;
  notesLabel: string;
  statusHelpText?: string;
  required?: boolean;
}): MedicalFormField[] {
  return [
    field(config.statusId, MULTIPLE_CHOICE, config.statusTitle, config.statusLabel, {
      helpText: config.statusHelpText || '',
      choices: yesNoChoices,
      yearFieldId: config.notesId,
      required: config.required ?? false
    }),
    optionalField(
      config.notesId,
      TEXT,
      `Tahun terdiagnosis ${config.statusLabel}`,
      `${config.statusLabel} - tahun`,
      {
        helpText: 'Tahun terdiagnosis atau dialami. Contoh: 2021.'
      }
    )
  ];
}

export function previousPregnancyFields(order: number): MedicalFormField[] {
  const prefix = `previousPregnancy${order}`;
  const labelPrefix = `Riwayat ${order}`;

  return [
    optionalField(
      `${prefix}BirthYear`,
      TEXT,
      'Tahun lahir atau tahun berakhir',
      `${labelPrefix} - tahun lahir`,
      {
        helpText: 'Tuliskan tahun lahir atau tahun berakhir kehamilan. Contoh: 2024.',
        placeholder: 'Contoh: 2024',
        colSpan: 1
      }
    ),
    optionalField(`${prefix}BirthWeight`, TEXT, 'Berat lahir bayi', `${labelPrefix} - berat lahir`, {
      helpText: 'Berat lahir bayi saat lahir (dalam gram).',
      placeholder: '3100',
      colSpan: 1
    }),
    optionalField(`${prefix}BirthLength`, TEXT, 'Panjang lahir bayi', `${labelPrefix} - panjang lahir`, {
      helpText: 'Panjang badan bayi saat lahir (dalam cm).',
      placeholder: '49',
      colSpan: 1
    }),
    optionalField(
      `${prefix}ChildSex`,
      MULTIPLE_CHOICE,
      'Jenis kelamin bayi',
      `${labelPrefix} - jenis kelamin`,
      {
        choices: childSexChoices,
        colSpan: 1
      }
    ),
    optionalField(
      `${prefix}GestationalAgeAtBirth`,
      TEXT,
      'Usia kehamilan saat lahir',
      `${labelPrefix} - usia kehamilan`,
      {
        helpText: 'Usia kehamilan saat bayi lahir (dalam minggu).',
        placeholder: '39',
        colSpan: 1
      }
    ),
    optionalField(`${prefix}BirthAttendant`, LIST, 'Ditolong oleh siapa?', `${labelPrefix} - penolong`, {
      helpText: 'Pilih penolong persalinan atau ketik sendiri.',
      choices: birthAttendantChoices,
      allowCustomInput: true,
      colSpan: 1
    }),
    optionalField(`${prefix}DeliveryMethod`, LIST, 'Cara persalinan', `${labelPrefix} - cara persalinan`, {
      helpText: 'Pilih cara persalinan atau ketik sendiri.',
      choices: deliveryMethodChoices,
      allowCustomInput: true,
      colSpan: 1
    }),
    optionalField(`${prefix}DeliveryPlace`, LIST, 'Tempat persalinan', `${labelPrefix} - tempat`, {
      helpText: 'Pilih tempat persalinan atau ketik sendiri.',
      choices: deliveryPlaceChoices,
      allowCustomInput: true,
      colSpan: 1
    }),
    optionalField(
      `${prefix}Complications`,
      PARAGRAPH,
      'Apakah ada komplikasi atau masalah?',
      `${labelPrefix} - komplikasi`,
      {
        helpText: 'Tuliskan komplikasi jika ada, atau tulis Tidak ada.',
        placeholder: 'Contoh: Tidak ada, atau tuliskan komplikasi',
        colSpan: 'full'
      }
    )
  ];
}

export function contraceptionFields(order: number): MedicalFormField[] {
  const prefix = `contraception${order}`;
  const labelPrefix = `KB ${order}`;

  return [
    optionalField(`${prefix}StartDate`, DATE, 'Kapan mulai dipakai?', `${labelPrefix} - tanggal mulai`, {
      helpText: 'Pilih tanggal mulai menggunakan KB.',
      colSpan: 1
    }),
    optionalField(
      `${prefix}StopDate`,
      DATE,
      'Kapan berhenti atau dilepas?',
      `${labelPrefix} - tanggal lepas`,
      {
        helpText: 'Pilih tanggal berhenti atau dilepasnya KB.',
        colSpan: 1
      }
    ),
    optionalField(`${prefix}Type`, LIST, 'Jenis KB/kontrasepsi', `${labelPrefix} - jenis`, {
      helpText: 'Pilih jenis KB atau ketik sendiri.',
      choices: contraceptiveTypeChoices,
      allowCustomInput: true,
      colSpan: 1
    }),
    optionalField(`${prefix}Duration`, TEXT, 'Berapa lama dipakai?', `${labelPrefix} - masa pakai`, {
      helpText: 'Dihitung otomatis dari tanggal mulai dan tanggal lepas.',
      placeholder: 'Otomatis dari rentang tanggal',
      colSpan: 1,
      disabled: true
    }),
    optionalField(
      `${prefix}Problems`,
      PARAGRAPH,
      'Apakah ada masalah saat memakai KB?',
      `${labelPrefix} - masalah`,
      {
        helpText: 'Tuliskan masalah atau keluhan jika ada, atau tulis Tidak ada.',
        colSpan: 'full'
      }
    ),
    optionalField(
      `${prefix}SideEffects`,
      PARAGRAPH,
      'Apakah ada efek samping?',
      `${labelPrefix} - efek samping`,
      {
        helpText: 'Tuliskan efek samping jika ada, atau tulis Tidak ada.',
        colSpan: 'full'
      }
    )
  ];
}
