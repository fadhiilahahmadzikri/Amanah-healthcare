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

export const DEFAULT_RICH_FORM_TEMPLATE: FormJsonSchema = {
  version: 1,
  title: 'Formulir Pengkajian Klinis',
  description: 'Lengkapi data pengkajian klinis pasien untuk keperluan rekam medis.',
  steps: [
    {
      id: 'step_identitas_dasar',
      title: 'Identitas & Anamnesis Awal',
      description: 'Data identitas pasien dan keluhan utama yang dirasakan saat ini.',
      fields: [
        {
          id: 'patient_full_name',
          component: 'text-input',
          type: 'TEXT',
          title: 'Nama Lengkap Pasien',
          label: 'Nama Lengkap Pasien',
          placeholder: 'Masukkan nama lengkap sesuai KTP',
          helpText: 'Nama lengkap tanpa singkatan',
          required: true,
          isActive: true,
          colSpan: 1
        },
        {
          id: 'patient_nik',
          component: 'text-input',
          type: 'TEXT',
          title: 'Nomor Induk Kependudukan (NIK)',
          label: 'NIK',
          placeholder: '16 digit NIK',
          helpText: '16 angka sesuai KTP / Kartu Keluarga',
          required: false,
          isActive: true,
          colSpan: 1
        },
        {
          id: 'patient_birth_date',
          component: 'calendar',
          type: 'DATE',
          title: 'Tanggal Lahir',
          label: 'Tanggal Lahir',
          placeholder: 'Pilih tanggal lahir',
          helpText: 'Tanggal lahir pasien',
          required: true,
          isActive: true,
          colSpan: 'full'
        },
        {
          id: 'patient_phone',
          component: 'text-input',
          type: 'TEXT',
          title: 'Nomor WhatsApp / Telepon',
          label: 'No. WhatsApp',
          placeholder: '08xxxxxxxxxx',
          helpText: 'Nomor aktif untuk konfirmasi janji temu',
          required: true,
          isActive: true,
          colSpan: 1
        },
        {
          id: 'patient_chief_complaint',
          component: 'textarea',
          type: 'PARAGRAPH',
          title: 'Keluhan Utama',
          label: 'Keluhan Utama',
          placeholder: 'Ceritakan keluhan atau gejala yang dirasakan saat ini...',
          helpText: 'Jelaskan secara singkat gejala yang dialami',
          required: true,
          isActive: true,
          colSpan: 'full'
        }
      ]
    },
    {
      id: 'step_riwayat_kesehatan',
      title: 'Riwayat Kesehatan & Penyakit',
      description: 'Riwayat alergi dan kondisi kesehatan penting lainnya.',
      fields: [
        {
          id: 'patient_blood_type',
          component: 'choice-chips',
          type: 'MULTIPLE_CHOICE',
          title: 'Golongan Darah',
          label: 'Golongan Darah',
          helpText: 'Pilih salah satu',
          required: false,
          isActive: true,
          choices: ['A', 'B', 'AB', 'O', 'Belum Tahu'],
          colSpan: 'full'
        },
        {
          id: 'patient_has_allergy',
          component: 'choice-chips',
          type: 'MULTIPLE_CHOICE',
          title: 'Riwayat Alergi Obat / Makanan',
          label: 'Riwayat Alergi',
          helpText: 'Apakah pasien memiliki alergi obat tertentu?',
          required: true,
          isActive: true,
          choices: ['Tidak Ada', 'Ada Alergi'],
          colSpan: 'full'
        },
        {
          id: 'patient_allergy_detail',
          component: 'textarea',
          type: 'PARAGRAPH',
          title: 'Rincian Alergi (Jika Ada)',
          label: 'Rincian Alergi',
          placeholder: 'Contoh: Alergi Penisilin, Parasetamol, atau Makanan Laut',
          helpText: 'Sebutkan jenis obat atau substansi pemicu alergi',
          required: false,
          isActive: true,
          colSpan: 'full'
        }
      ]
    },
    {
      id: 'step_catatan_tambahan',
      title: 'Catatan Tambahan',
      description: 'Informasi atau instruksi tambahan yang perlu diketahui tenaga medis.',
      fields: [
        {
          id: 'patient_additional_notes',
          component: 'textarea',
          type: 'PARAGRAPH',
          title: 'Catatan Khusus Pasien',
          label: 'Catatan Tambahan',
          placeholder: 'Tuliskan catatan tambahan jika diperlukan...',
          helpText: 'Opsional: riwayat operasi, konsumsi obat rutin, dll.',
          required: false,
          isActive: true,
          colSpan: 'full'
        }
      ]
    }
  ]
};

export function convertJsonSchemaToSections(
  rawSchema?: Record<string, any> | null,
  includeInactive: boolean = false
): MedicalFormSection[] {
  if (!rawSchema || !Array.isArray(rawSchema.steps) || rawSchema.steps.length === 0) {
    return convertJsonSchemaToSections(DEFAULT_RICH_FORM_TEMPLATE, includeInactive);
  }

  const steps = rawSchema.steps as FormJsonStep[];

  return steps.map((step, stepIdx) => {
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
      layout: step.layout || 'grid',
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
    steps: sections.map((section, sIdx) => ({
      id: section.id || `step_${sIdx}`,
      title: section.title,
      description: section.description,
      layout: section.layout || 'grid',
      repeatableGroup: section.repeatableGroup,
      tableConfig: section.tableConfig,
      fields: section.fields.map((f) => ({
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
