import type { Patient } from '@/features/data-pasien/api/types';
import type { MedicalAppointmentFlow } from '../api/types';
import type { MedicalFormSection } from '../constants/medical-appointment-schemas';
import { isMedicalSectionValid } from '../schemas/medical-appointment-validation';
import type { MedicalAppointmentValues } from './medical-appointment';
import {
  type CatalogActionState,
  type RepeatableHistoryCounts,
  type RepeatableHistoryGroup,
  type ScheduleValues,
  type StepDescriptor,
  historyGroups
} from '../model/medical-form-history-types';
import {
  CATALOG_ACTION_TYPES,
  FLOW_NAMES,
  REPEATABLE_GROUP_KEYS,
  SECTION_IDS,
  STEP_DESCRIPTOR_TYPES
} from '../constants/kia-constants';

const VALID_BLOOD_TYPES = new Set(['A', 'B', 'AB', 'O']);

export function normalizeBirthDate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if (trimmed.includes('-')) {
    const parts = trimmed.split('-');
    if (
      parts.length === 3 &&
      parts[0].length === 4 &&
      parts[1].length === 2 &&
      parts[2].length === 2 &&
      !Number.isNaN(Number(parts[0])) &&
      !Number.isNaN(Number(parts[1])) &&
      !Number.isNaN(Number(parts[2]))
    ) {
      return trimmed;
    }
  }

  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    if (
      parts.length === 3 &&
      parts[0].length === 2 &&
      parts[1].length === 2 &&
      parts[2].length === 4 &&
      !Number.isNaN(Number(parts[0])) &&
      !Number.isNaN(Number(parts[1])) &&
      !Number.isNaN(Number(parts[2]))
    ) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }

  return '';
}

export function normalizeBloodType(value: string): string {
  const clean = value.replace('+', '').replace('-', '').trim();
  return VALID_BLOOD_TYPES.has(clean) ? clean : '';
}

export function pruneEmptyValues(values: MedicalAppointmentValues): MedicalAppointmentValues {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => Boolean(value.trim()))
  ) as MedicalAppointmentValues;
}

export function buildRegistrationPrefill(
  flow: MedicalAppointmentFlow,
  patient: Patient | null
): MedicalAppointmentValues {
  if (!patient) {
    return {};
  }

  const birthDate = normalizeBirthDate(patient.birth_date || patient.tanggal_lahir || '');
  const bloodType = normalizeBloodType(patient.blood_type || '');
  const phone = patient.nomor_telepon_wa || patient.phone || '';
  const address = patient.domisili || patient.address || '';
  const nik = patient.nik_ktp || patient.nik || '';

  if (flow === FLOW_NAMES.PREGNANCY) {
    return pruneEmptyValues({
      motherName: patient.name,
      motherNik: nik,
      motherBirthDate: birthDate,
      motherAge: patient.age ? `${patient.age} tahun` : '',
      motherJob: patient.pekerjaan || '',
      phoneNumber: phone,
      domicileAddress: address,
      identityCardAddress: patient.address || address,
      motherBloodType: bloodType
    });
  }

  return pruneEmptyValues({
    childName: patient.name,
    childNik: nik,
    childBirthDate: birthDate,
    childSex: patient.gender,
    parentPhone: phone,
    motherName: patient.nama_ibu_kandung || '',
    childAddress: address
  });
}

export function buildComplaintText(
  complaintFieldId: string,
  values: MedicalAppointmentValues
): string {
  const complaint = values[complaintFieldId]?.trim();
  return complaint || '';
}

export function checkCurrentStepValid(
  descriptor: StepDescriptor,
  sections: MedicalFormSection[],
  values: MedicalAppointmentValues,
  schedule: ScheduleValues
): boolean {
  if (descriptor.type === STEP_DESCRIPTOR_TYPES.HISTORY_CATALOG) {
    return true;
  }

  if (descriptor.type === STEP_DESCRIPTOR_TYPES.MEDICAL) {
    return isMedicalSectionValid(sections[descriptor.sectionIndex], values);
  }

  if (descriptor.type === STEP_DESCRIPTOR_TYPES.DOCTOR) {
    return true;
  }

  if (descriptor.type === STEP_DESCRIPTOR_TYPES.DATE) {
    return Boolean(schedule.dateStr);
  }

  if (descriptor.type === STEP_DESCRIPTOR_TYPES.TIME) {
    return Boolean(schedule.timeSlot);
  }

  return Boolean(schedule.dateStr && schedule.timeSlot);
}

export function isHistoryRecordEmpty(
  section: MedicalFormSection,
  values: MedicalAppointmentValues
): boolean {
  return section.fields.every((field) => !values[field.id]?.trim());
}

export function getHistorySectionMeta(sectionId?: string) {
  if (!sectionId) {
    return null;
  }

  for (const group of Object.values(historyGroups)) {
    const sectionIndex = group.sectionIds.indexOf(sectionId);
    if (sectionIndex >= 0) {
      return {
        group,
        recordNumber: sectionIndex + 1
      };
    }
  }
  return null;
}

export function isHistorySectionVisible(
  sectionId: string,
  historyCounts: RepeatableHistoryCounts,
  catalogAction?: CatalogActionState | null
): boolean {
  const historySection = getHistorySectionMeta(sectionId);
  if (!historySection) {
    return true;
  }

  if (
    catalogAction &&
    catalogAction.groupKey === historySection.group.key &&
    catalogAction.recordNumber === historySection.recordNumber
  ) {
    return true;
  }

  return historySection.recordNumber <= historyCounts[historySection.group.key];
}

export function getHistorySection(
  sections: MedicalFormSection[],
  group: RepeatableHistoryGroup,
  recordNumber: number
): MedicalFormSection | undefined {
  const sectionId = group.sectionIds[recordNumber - 1];
  return sections.find((section) => section.id === sectionId);
}

export function pickMedicalValues(
  activeSections: MedicalFormSection[],
  values: MedicalAppointmentValues
): MedicalAppointmentValues {
  return activeSections.reduce<MedicalAppointmentValues>((result, section) => {
    section.fields.forEach((field) => {
      result[field.id] = values[field.id] || '';
    });
    return result;
  }, {});
}

export function collectAnsweredFieldsFromSections(
  sections: MedicalFormSection[],
  values: MedicalAppointmentValues
) {
  return sections.flatMap((section) =>
    section.fields
      .map((field) => ({
        id: field.id,
        label: field.label,
        value: values[field.id] || ''
      }))
      .filter((answer) => answer.value.trim().length > 0)
  );
}

export function buildMedicalActiveSteps({
  visibleMedicalSections,
  hasPreviousPregnancyHistory,
  hasContraceptionHistory,
  historyCounts,
  catalogAction
}: {
  visibleMedicalSections: MedicalFormSection[];
  hasPreviousPregnancyHistory?: string;
  hasContraceptionHistory?: string;
  historyCounts: RepeatableHistoryCounts;
  catalogAction?: CatalogActionState | null;
}): StepDescriptor[] {
  const steps: StepDescriptor[] = [];

  visibleMedicalSections.forEach((section, sectionIndex) => {
    steps.push({ type: STEP_DESCRIPTOR_TYPES.MEDICAL, sectionIndex });

    const targetPregnancyAnchorId =
      catalogAction?.groupKey === REPEATABLE_GROUP_KEYS.PREGNANCY &&
      catalogAction.type === CATALOG_ACTION_TYPES.ADD
        ? `previousPregnancy${catalogAction.recordNumber}Details`
        : historyCounts.pregnancy === 0
          ? SECTION_IDS.OBSTETRIC_GATEWAY
          : `previousPregnancy${historyCounts.pregnancy}Details`;

    if (
      hasPreviousPregnancyHistory === historyGroups.pregnancy.enabledValue &&
      section.id === targetPregnancyAnchorId
    ) {
      steps.push({
        type: STEP_DESCRIPTOR_TYPES.HISTORY_CATALOG,
        historyKey: REPEATABLE_GROUP_KEYS.PREGNANCY
      });
    }

    const targetContraceptionAnchorId =
      catalogAction?.groupKey === REPEATABLE_GROUP_KEYS.CONTRACEPTION &&
      catalogAction.type === CATALOG_ACTION_TYPES.ADD
        ? `contraception${catalogAction.recordNumber}Details`
        : historyCounts.contraception === 0
          ? SECTION_IDS.CONTRACEPTION_GATEWAY
          : `contraception${historyCounts.contraception}Details`;

    if (
      hasContraceptionHistory === historyGroups.contraception.enabledValue &&
      section.id === targetContraceptionAnchorId
    ) {
      steps.push({
        type: STEP_DESCRIPTOR_TYPES.HISTORY_CATALOG,
        historyKey: REPEATABLE_GROUP_KEYS.CONTRACEPTION
      });
    }
  });

  return steps;
}
