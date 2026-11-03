import type {
  MedicalFormSection,
  MedicalFormField,
  MedicalFieldType,
  FormFieldDataSource,
  TableConfig
} from './medical-appointment-types';
import { mapComponentIdToFieldType, mapFieldTypeToComponentId } from './component-registry';

export interface FormJsonField {
  id: string;
  type?: MedicalFieldType;
  component?: string;
  title: string;
  label?: string;
  helpText?: string;
  placeholder?: string;
  required?: boolean;
  isActive?: boolean;
  choices?: string[];
  dataSource?: FormFieldDataSource;
  colSpan?: 1 | 2 | 'full';
  disabled?: boolean;
  yearFieldId?: string;
  notesFieldId?: string;
  goToSectionIdByChoice?: Record<string, string> | null;
}

export interface FormJsonStep {
  id: string;
  title: string;
  description?: string;
  layout?: 'grid' | 'stack' | 'questionnaire' | 'table';
  repeatableGroup?: string;
  tableConfig?: TableConfig;
  fields: FormJsonField[];
}

export interface FormJsonSchema {
  version: number;
  title?: string;
  description?: string;
  steps: FormJsonStep[];
}

export function convertJsonSchemaToSections(
  rawSchema?: Record<string, any> | null,
  includeInactive: boolean = false
): MedicalFormSection[] {
  if (!rawSchema || !Array.isArray(rawSchema.steps) || rawSchema.steps.length === 0) {
    return [];
  }

  const rawSteps = Array.isArray(rawSchema.steps) ? rawSchema.steps : [];
  const validSteps = rawSteps.filter((step): step is FormJsonStep => Boolean(step && typeof step === 'object'));

  return validSteps.map((step, stepIdx) => {
    const rawFields = Array.isArray(step.fields) ? step.fields : [];
    const filteredFields = includeInactive
      ? rawFields
      : rawFields.filter((f) => f.isActive !== false);

    const fields: MedicalFormField[] = filteredFields.map((f, fieldIdx) => {
      const fieldType = f.type || (f.component ? mapComponentIdToFieldType(f.component) : 'TEXT');
      return {
        id: f.id || `field_${stepIdx}_${fieldIdx}`,
        type: fieldType,
        title: f.title || f.label || `Field ${fieldIdx + 1}`,
        label: f.label || f.title || `Field ${fieldIdx + 1}`,
        helpText: f.helpText || '',
        placeholder: f.placeholder || '',
        required: Boolean(f.required),
        choices: Array.isArray(f.choices) ? f.choices : [],
        dataSource: f.dataSource,
        goToSectionIdByChoice: f.goToSectionIdByChoice || null,
        colSpan: f.colSpan ?? (fieldType === 'PARAGRAPH' || fieldType === 'DATE' ? 'full' : 1),
        yearFieldId: f.yearFieldId,
        notesFieldId: f.notesFieldId,
        disabled: Boolean(f.disabled),
        isActive: f.isActive !== false
      };
    });

    return {
      id: step.id || `step_${stepIdx}`,
      title: step.title || `Langkah ${stepIdx + 1}`,
      description: step.description || '',
      fields,
      layout: step.layout || (step.id === 'diseaseHistory' ? 'questionnaire' : 'grid'),
      repeatableGroup: step.repeatableGroup,
      tableConfig: (step as any).tableConfig
    };
  });
}

export function convertSectionsToJsonSchema(
  sections: MedicalFormSection[],
  title?: string,
  description?: string
): FormJsonSchema {
  return {
    version: 1,
    title: title || 'Formulir Pengkajian Klinis',
    description: description || '',
    steps: sections.map((sec, sIdx) => ({
      id: sec.id || `step_${sIdx}`,
      title: sec.title,
      description: sec.description,
      layout: sec.layout || 'grid',
      repeatableGroup: sec.repeatableGroup,
      tableConfig: sec.tableConfig,
      fields: sec.fields.map((f) => ({
        id: f.id,
        type: f.type,
        component: mapFieldTypeToComponentId(f.type),
        title: f.title,
        label: f.label || f.title,
        helpText: f.helpText || '',
        placeholder: f.placeholder || '',
        required: Boolean(f.required),
        isActive: f.isActive !== false,
        choices: f.choices || [],
        dataSource: f.dataSource,
        colSpan: f.colSpan || (f.type === 'PARAGRAPH' || f.type === 'DATE' ? 'full' : 1),
        yearFieldId: f.yearFieldId,
        notesFieldId: f.notesFieldId,
        goToSectionIdByChoice: f.goToSectionIdByChoice || null,
        disabled: Boolean(f.disabled)
      }))
    }))
  };
}
