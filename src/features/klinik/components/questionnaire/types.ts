import type { MedicalFormField } from '../../constants/medical-appointment-schemas';

export interface QuestionnaireItem {
  id: string;
  yearFieldId: string;
  notesFieldId?: string;
  title: string;
  label: string;
  helpText?: string;
  conditionName?: string;
}

export function extractQuestionnaireItems(fields: MedicalFormField[]): QuestionnaireItem[] {
  const items: QuestionnaireItem[] = [];
  const handledIds = new Set<string>();

  for (const f of fields) {
    if (f.yearFieldId && !handledIds.has(f.id)) {
      items.push({
        id: f.id,
        yearFieldId: f.yearFieldId,
        notesFieldId: f.notesFieldId,
        title: f.title,
        label: f.label,
        helpText: f.helpText,
        conditionName: formatConditionName(f.label)
      });
      handledIds.add(f.id);
      handledIds.add(f.yearFieldId);
      if (f.notesFieldId) {
        handledIds.add(f.notesFieldId);
      }
    }
  }

  // Also include any other binary yes/no questions if present in the section
  for (const f of fields) {
    if (
      !handledIds.has(f.id) &&
      f.type === 'MULTIPLE_CHOICE' &&
      f.choices.length === 2 &&
      f.choices.includes('Tidak') &&
      f.choices.includes('Ya')
    ) {
      items.push({
        id: f.id,
        yearFieldId: '',
        title: f.title,
        label: f.label,
        helpText: f.helpText,
        conditionName: formatConditionName(f.label)
      });
      handledIds.add(f.id);
    }
  }

  return items;
}

function formatConditionName(label: string): string {
  return label.replace(/^Riwayat\s+/i, '').trim();
}
