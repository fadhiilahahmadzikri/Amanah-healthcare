import type { PatientAffiliationProfile } from '@/features/data-pasien/api/patient-affiliation-service';
import { PATIENT_RELATIONSHIP_CODE } from '@/constants/relationship.constants';
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
  getHistorySectionId,
  historyGroups
} from '../model/medical-form-history-types';
import {
  CATALOG_ACTION_TYPES,
  FLOW_NAMES,
  REPEATABLE_GROUP_KEYS,
  SECTION_IDS,
  STEP_DESCRIPTOR_TYPES
} from '../constants/kia-constants';

export function pruneEmptyValues(values: MedicalAppointmentValues): MedicalAppointmentValues {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => Boolean(value.trim()))
  ) as MedicalAppointmentValues;
}

export function buildRegistrationPrefill(
  flow: MedicalAppointmentFlow,
  patient: PatientAffiliationProfile | null,
  affiliations?: PatientAffiliationProfile[]
): MedicalAppointmentValues {
  if (!patient) {
    return {};
  }

  const birthDate = patient.birthDate || '';
  const bloodType = patient.bloodType || '';
  const phone = patient.phone || patient.phoneNumber || '';
  const nik = patient.nik || '';
  const occupation = patient.occupationName || '';
  const domicileAddress =
    patient.domicileAddress || patient.address || patient.line1 || '';
  const identityCardAddress = patient.identityCardAddress || '';

  const result: Record<string, string> = {
    fullName: patient.fullName,
    nik,
    birthDate,
    bloodType,
    phone,
    phoneNumber: phone,
    domicileAddress,
    identityCardAddress,
  };

  if (flow === 'pregnancy') {
    result.motherName = patient.fullName;
    result.motherNik = nik;
    result.motherBirthDate = birthDate;
    result.motherJob = occupation;
    result.motherBloodType = bloodType;

    // Resolve husband/partner honestly: NEVER match patient herself
    if (affiliations && affiliations.length > 0) {
      // Find candidate spouse: must be active and different ID from patient
      const spouse = affiliations.find(
        (a) =>
          a.id !== patient.id &&
          a.isActive !== false &&
          (a.relationship === PATIENT_RELATIONSHIP_CODE.SPOUSE ||
            a.relationship === 'pasangan' ||
            ((patient.relationship === PATIENT_RELATIONSHIP_CODE.SPOUSE ||
              patient.relationship === 'pasangan') &&
              (a.isSelf ||
                a.relationship === PATIENT_RELATIONSHIP_CODE.SELF ||
                a.relationship === 'diri_sendiri') &&
              a.gender === 'male'))
      );

      if (spouse) {
        if (spouse.fullName) result.partnerName = spouse.fullName;
        if (spouse.nik) result.partnerNik = spouse.nik;
        if (spouse.birthDate) result.partnerBirthDate = spouse.birthDate;
        if (spouse.bloodType) result.partnerBloodType = spouse.bloodType;
        if (spouse.occupationName) result.partnerJob = spouse.occupationName;
        if (spouse.phoneNumber || spouse.phone) {
          result.partnerPhone = spouse.phoneNumber || spouse.phone || '';
        }
      }
    }
  } else if (flow === 'immunization') {
    result.childName = patient.fullName;
    result.childNik = nik;
    result.childBirthDate = birthDate;
    result.childSex = patient.gender || '';
    result.parentPhone = phone;
    result.childAddress = domicileAddress;

    // Mother name in immunization comes from patient record motherName or female parent affiliation
    if (patient.motherName) {
      result.motherName = patient.motherName;
    }

    if (affiliations && affiliations.length > 0) {
      const parent = affiliations.find(
        (a) =>
          a.id !== patient.id &&
          a.isActive !== false &&
          (a.relationship === PATIENT_RELATIONSHIP_CODE.PARENT ||
            a.relationship === 'orang_tua' ||
            a.isSelf ||
            a.relationship === PATIENT_RELATIONSHIP_CODE.SELF ||
            a.relationship === 'diri_sendiri')
      );

      if (parent) {
        if (parent.gender === 'female' && !result.motherName) {
          result.motherName = parent.fullName;
        } else if (parent.gender === 'male' && !result.fatherName) {
          result.fatherName = parent.fullName;
        }
      }
    }
  } else {
    result.address = domicileAddress;
  }

  return pruneEmptyValues(result);
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
    return Boolean(schedule.session);
  }

  return Boolean(schedule.dateStr && schedule.session);
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

  const pregMatch = sectionId.match(/^previousPregnancy(\d+)Details$/);
  if (pregMatch) {
    return {
      group: historyGroups[REPEATABLE_GROUP_KEYS.PREGNANCY],
      recordNumber: parseInt(pregMatch[1], 10)
    };
  }

  const contraMatch = sectionId.match(/^contraception(\d+)Details$/);
  if (contraMatch) {
    return {
      group: historyGroups[REPEATABLE_GROUP_KEYS.CONTRACEPTION],
      recordNumber: parseInt(contraMatch[1], 10)
    };
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
  const sectionId = getHistorySectionId(group.key, recordNumber);
  return sections.find((section) => section.id === sectionId);
}

export function pickMedicalValues(
  activeSections: MedicalFormSection[],
  values: MedicalAppointmentValues
): MedicalAppointmentValues {
  return activeSections.reduce<MedicalAppointmentValues>((acc, section) => {
    section.fields.forEach((field) => {
      acc[field.id] = values[field.id] || '';
    });
    return acc;
  }, {});
}

export function collectAnsweredFieldsFromSections(
  sections: MedicalFormSection[],
  values: MedicalAppointmentValues
) {
  return sections.flatMap((section) =>
    section.fields
      .filter((field) => !field.visibleIf || field.visibleIf(values))
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
