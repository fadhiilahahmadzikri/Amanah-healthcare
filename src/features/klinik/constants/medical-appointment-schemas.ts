import type { MedicalAppointmentFlow } from '../api/types';
import {
  FIELD_TYPES,
  type MedicalFieldType,
  type MedicalFlowDefinition,
  type MedicalFormField,
  type MedicalFormSection
} from './medical-appointment-types';
import { convertJsonSchemaToSections, type FormJsonSchema } from './default-form-template';
import { VISIT_TYPE } from '@/constants/visit-type.constants';

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

export function createDynamicFlowDefinition(
  flow: string,
  schema?: FormJsonSchema | Record<string, any> | null,
  serviceName?: string
): MedicalFlowDefinition {
  const allFields =
    schema?.steps?.flatMap((s: any) => (s && Array.isArray(s.fields) ? s.fields : [])) || [];
  const hasField = (id: string) => allFields.some((f: any) => f && f.id === id);

  const patientNameFieldId = hasField('motherName')
    ? 'motherName'
    : hasField('childName')
      ? 'childName'
      : hasField('fullName')
        ? 'fullName'
        : 'patient_full_name';

  const patientContactFieldId = hasField('phoneNumber')
    ? 'phoneNumber'
    : hasField('parentPhone')
      ? 'parentPhone'
      : hasField('phone')
        ? 'phone'
        : 'patient_phone';

  const complaintFieldId = hasField('currentComplaints')
    ? 'currentComplaints'
    : hasField('complaints')
      ? 'complaints'
      : hasField('complaint')
        ? 'complaint'
        : flow === 'pregnancy'
          ? 'currentComplaints'
          : 'patient_chief_complaint';

  return {
    flow,
    formTitle: schema?.title ?? '',
    formDescription: schema?.description ?? '',
    serviceName: serviceName ?? '',
    visitType: VISIT_TYPE.NEW_VISIT,
    patientNameFieldId,
    patientContactFieldId,
    complaintFieldId,
    sections: convertJsonSchemaToSections(schema)
  };
}

export function getMedicalFlowDefinition(flow: string): MedicalFlowDefinition {
  return createDynamicFlowDefinition(flow);
}
