import type { MedicalAppointmentFlow } from '../api/types';

export type MedicalFieldType = 'TEXT' | 'PARAGRAPH' | 'DATE' | 'MULTIPLE_CHOICE' | 'LIST';

export interface MedicalFormField {
  id: string;
  type: MedicalFieldType;
  title: string;
  label: string;
  helpText: string;
  placeholder?: string;
  required: boolean;
  choices: string[];
  goToSectionIdByChoice: Record<string, string> | null;
  colSpan?: 1 | 2 | 'full';
  yearFieldId?: string;
  notesFieldId?: string;
  disabled?: boolean;
  visibleIf?: (values: Record<string, string>) => boolean;
}

export interface MedicalFormSection {
  id: string;
  title: string;
  description: string;
  fields: MedicalFormField[];
  layout?: 'grid' | 'stack' | 'questionnaire';
}

export interface MedicalFlowDefinition {
  flow: MedicalAppointmentFlow;
  formTitle: string;
  formDescription: string;
  serviceName: string;
  visitType: string;
  patientNameFieldId: string;
  patientContactFieldId: string;
  complaintFieldId: string;
  sections: MedicalFormSection[];
}
