import type { MedicalAppointmentFlow } from '../api/types';
import type {
  MedicalFieldType,
  MedicalFlowDefinition,
  MedicalFormField,
  MedicalFormSection
} from './medical-appointment-types';
import {
  DATE,
  FIELD_TYPES,
  LIST,
  MULTIPLE_CHOICE,
  PARAGRAPH,
  TEXT,
  bloodTypeChoices,
  contraceptionFields,
  defaultOccupationChoices,
  diseaseStatusFields,
  educationChoices,
  field,
  optionalField,
  previousPregnancyFields,
  religionChoices,
  tetanusChoices,
  yesNoChoices,
  yesNoField
} from './medical-appointment-field-builders';
import { pregnancyFlowDefinition } from './pregnancy-flow-definition';
import { immunizationFlowDefinition } from './immunization-flow-definition';

export type { MedicalFieldType, MedicalFormField, MedicalFormSection, MedicalFlowDefinition };

export {
  FIELD_TYPES,
  TEXT,
  PARAGRAPH,
  DATE,
  MULTIPLE_CHOICE,
  LIST,
  yesNoChoices,
  educationChoices,
  bloodTypeChoices,
  religionChoices,
  defaultOccupationChoices,
  tetanusChoices,
  field,
  optionalField,
  yesNoField,
  diseaseStatusFields,
  previousPregnancyFields,
  contraceptionFields,
  pregnancyFlowDefinition,
  immunizationFlowDefinition
};

export const medicalFlowDefinitions: Record<MedicalAppointmentFlow, MedicalFlowDefinition> = {
  pregnancy: pregnancyFlowDefinition,
  immunization: immunizationFlowDefinition
};

export function getMedicalFlowDefinition(flow: MedicalAppointmentFlow): MedicalFlowDefinition {
  return medicalFlowDefinitions[flow];
}
