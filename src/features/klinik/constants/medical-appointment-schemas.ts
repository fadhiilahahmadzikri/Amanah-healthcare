import type { MedicalAppointmentFlow } from '../api/types';
import {
  FIELD_TYPES,
  type MedicalFieldType,
  type MedicalFlowDefinition,
  type MedicalFormField,
  type MedicalFormSection
} from './medical-appointment-types';

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

export function yesNoField(
  id: string,
  title: string,
  label: string,
  options?: {
    helpText?: string;
    colSpan?: 1 | 2 | 'full';
    yearFieldId?: string;
    notesFieldId?: string;
  }
): MedicalFormField {
  return {
    id,
    type: 'MULTIPLE_CHOICE',
    title,
    label,
    helpText: options?.helpText || '',
    placeholder: '',
    required: true,
    choices: yesNoChoices,
    goToSectionIdByChoice: null,
    colSpan: options?.colSpan || 1,
    yearFieldId: options?.yearFieldId,
    notesFieldId: options?.notesFieldId
  };
}

export type { MedicalFieldType, MedicalFormField, MedicalFormSection, MedicalFlowDefinition };

export { FIELD_TYPES };

export const medicalFlowDefinitions: Record<string, MedicalFlowDefinition> = {};

export function getMedicalFlowDefinition(flow: string): MedicalFlowDefinition | undefined {
  return medicalFlowDefinitions[flow];
}
