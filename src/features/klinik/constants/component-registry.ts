import type { MedicalFieldType } from './medical-appointment-types';

export interface FormComponentOption {
  id: string;
  fieldType: MedicalFieldType;
  label: string;
  description: string;
  iconName: string;
}

export const COMPONENT_OPTIONS: FormComponentOption[] = [
  {
    id: 'text-input',
    fieldType: 'TEXT',
    label: 'Teks Singkat (Input)',
    description: 'Input baris tunggal untuk teks, angka, NIK, atau nomor telepon',
    iconName: 'edit'
  },
  {
    id: 'textarea',
    fieldType: 'PARAGRAPH',
    label: 'Paragraf (Textarea)',
    description: 'Area teks multi-baris untuk keluhan, catatan klinis, atau deskripsi panjang',
    iconName: 'fileText'
  },
  {
    id: 'calendar',
    fieldType: 'DATE',
    label: 'Kalender (Date Picker)',
    description: 'Pemilih tanggal lahir, HPHT, atau tanggal tindakan medis',
    iconName: 'calendar'
  },
  {
    id: 'choice-chips',
    fieldType: 'MULTIPLE_CHOICE',
    label: 'Pilihan Chip (Radio)',
    description: 'Tombol pilihan cepat Ya/Tidak, golongan darah, atau opsi teratur',
    iconName: 'checkCircle'
  },
  {
    id: 'select',
    fieldType: 'LIST',
    label: 'Menu Tarik (Select Dropdown)',
    description: 'Dropdown pemilihan dari banyak opsi (pekerjaan, pendidikan, dll)',
    iconName: 'chevronDown'
  }
];

export function mapFieldTypeToComponentId(type: MedicalFieldType): string {
  switch (type) {
    case 'PARAGRAPH':
      return 'textarea';
    case 'DATE':
      return 'calendar';
    case 'MULTIPLE_CHOICE':
      return 'choice-chips';
    case 'LIST':
      return 'select';
    case 'TEXT':
    default:
      return 'text-input';
  }
}

export function mapComponentIdToFieldType(componentId: string): MedicalFieldType {
  switch (componentId) {
    case 'textarea':
    case 'paragraph':
      return 'PARAGRAPH';
    case 'calendar':
    case 'date':
      return 'DATE';
    case 'choice-chips':
    case 'radio':
    case 'multiple-choice':
      return 'MULTIPLE_CHOICE';
    case 'select':
    case 'dropdown':
    case 'list':
      return 'LIST';
    case 'text-input':
    case 'text':
    default:
      return 'TEXT';
  }
}
