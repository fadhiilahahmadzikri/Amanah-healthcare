import type { Gender } from '@/constants/gender.constants';

export type ChildSex = Gender;

export type VaccineAdministrationStatus = 'GIVEN' | 'NOT_GIVEN' | 'POSTPONED' | 'CONTRAINDICATED';

export interface ImmunizationRegistrationPayload {
  patientId: string;
  appointmentId?: string | null;
  childName: string;
  childNik?: string;
  childBirthDate: string;
  childSex: ChildSex;
  childAgeFormatted?: string;
  parentPhone: string;
  fatherName?: string;
  motherName?: string;
  childAddress?: string;
  line1?: string;
  provinceCode?: string;
  provinceName?: string;
  regencyCode?: string;
  regencyName?: string;
  districtCode?: string;
  districtName?: string;
  villageCode?: string;
  villageName?: string;
  previousVaccineHistory?: string;
  childAllergyHistory?: string;
}

export interface ImmunizationClinicalEntry {
  id?: string;
  rowIndex: number;
  vaccineName: string;
  vaccineCode?: string;
  status: VaccineAdministrationStatus;
  injectionDate?: string | null;
  ageDisplay?: string | null;
  fever?: 'Ya' | 'Tidak' | null;
  cough?: 'Ya' | 'Tidak' | null;
  runnyNose?: 'Ya' | 'Tidak' | null;
  weightKg?: number | null;
  heightCm?: number | null;
  headCircumferenceCm?: number | null;
  temperatureCelsius?: number | null;
  planning?: string | null;
  notes?: string | null;
  appointmentId?: string | null;
  administeredBy?: string | null;
}

export interface ImmunizationIntakeRecord {
  id: string;
  patientId: string;
  appointmentId?: string | null;
  childName: string;
  childNik?: string | null;
  childBirthDate: string;
  childSex: ChildSex;
  childAgeFormatted?: string | null;
  parentPhone: string;
  fatherName?: string | null;
  motherName?: string | null;
  childAddress?: string | null;
  line1?: string | null;
  provinceCode?: string | null;
  provinceName?: string | null;
  regencyCode?: string | null;
  regencyName?: string | null;
  districtCode?: string | null;
  districtName?: string | null;
  villageCode?: string | null;
  villageName?: string | null;
  previousVaccineHistory?: string | null;
  childAllergyHistory?: string | null;
  entries?: ImmunizationClinicalEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ImmunizationDocumentViewModel {
  header: {
    topCode: string;
    recordDigits: string[];
    title: string;
    subtitle: string;
  };
  identity: {
    childName: string;
    childNik: string;
    birthDateAndSex: string;
    phone: string;
    fatherName: string;
    motherName: string;
    address: string;
  };
  preTable: {
    previousVaccines: string;
    allergy: string;
  };
  vaccineRows: {
    rowIndex: number;
    vaccineDisplay: { left: string; right?: string }[];
    injectionDate: string;
    age: string;
    subjective: string[];
    objective: string[];
    planning: string;
    separatorAfter?: boolean;
    isFilled: boolean;
  }[];
}
