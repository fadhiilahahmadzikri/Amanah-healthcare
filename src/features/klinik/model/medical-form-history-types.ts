import {
  CATALOG_ACTION_TYPES,
  CONTRACEPTION_CHOICE,
  PREVIOUS_PREGNANCY_CHOICE,
  REPEATABLE_GROUP_KEYS,
  STEP_DESCRIPTOR_TYPES
} from '../constants/medical-appointment-types';

export type RepeatableHistoryKey =
  (typeof REPEATABLE_GROUP_KEYS)[keyof typeof REPEATABLE_GROUP_KEYS];

export type StepDescriptor =
  | {
      type: typeof STEP_DESCRIPTOR_TYPES.MEDICAL;
      sectionIndex: number;
    }
  | {
      type: typeof STEP_DESCRIPTOR_TYPES.HISTORY_CATALOG;
      historyKey: RepeatableHistoryKey;
    }
  | {
      type:
        | typeof STEP_DESCRIPTOR_TYPES.DOCTOR
        | typeof STEP_DESCRIPTOR_TYPES.DATE
        | typeof STEP_DESCRIPTOR_TYPES.TIME
        | typeof STEP_DESCRIPTOR_TYPES.REVIEW;
    };

export type RepeatableHistoryCounts = Record<RepeatableHistoryKey, number>;

export interface RepeatableHistoryGroup {
  key: RepeatableHistoryKey;
  sectionIds: string[];
  gatewayFieldId: string;
  disabledValue: string;
  enabledValue: string;
  maxRecords: number;
}

export interface HistoryRecordActions {
  currentRecord: number;
  totalRecords: number;
  maxRecords: number;
  onAdd: () => void;
  onRemove: () => void;
}

export interface HistoryPromptState {
  groupKey: RepeatableHistoryKey;
  currentRecord: number;
}

export interface CatalogActionState {
  type: (typeof CATALOG_ACTION_TYPES)[keyof typeof CATALOG_ACTION_TYPES];
  groupKey: RepeatableHistoryKey;
  recordNumber: number;
}

export type ScheduleValues = {
  doctor: string;
  dateStr: string;
  session: string;
};

export const scheduleStepDescriptors: StepDescriptor[] = [
  { type: STEP_DESCRIPTOR_TYPES.DATE },
  { type: STEP_DESCRIPTOR_TYPES.TIME },
  { type: STEP_DESCRIPTOR_TYPES.REVIEW }
];

export const historyGroups: Record<RepeatableHistoryKey, RepeatableHistoryGroup> = {
  [REPEATABLE_GROUP_KEYS.PREGNANCY]: {
    key: REPEATABLE_GROUP_KEYS.PREGNANCY,
    sectionIds: [
      'previousPregnancy1Details',
      'previousPregnancy2Details',
      'previousPregnancy3Details',
      'previousPregnancy4Details'
    ],
    gatewayFieldId: 'hasPreviousPregnancyHistory',
    disabledValue: PREVIOUS_PREGNANCY_CHOICE.NO,
    enabledValue: PREVIOUS_PREGNANCY_CHOICE.YES,
    maxRecords: 4
  },
  [REPEATABLE_GROUP_KEYS.CONTRACEPTION]: {
    key: REPEATABLE_GROUP_KEYS.CONTRACEPTION,
    sectionIds: [
      'contraception1Details',
      'contraception2Details',
      'contraception3Details',
      'contraception4Details'
    ],
    gatewayFieldId: 'hasContraceptionHistory',
    disabledValue: CONTRACEPTION_CHOICE.NO,
    enabledValue: CONTRACEPTION_CHOICE.YES,
    maxRecords: 4
  }
};

export const defaultHistoryCounts: RepeatableHistoryCounts = {
  [REPEATABLE_GROUP_KEYS.PREGNANCY]: 1,
  [REPEATABLE_GROUP_KEYS.CONTRACEPTION]: 1
};
