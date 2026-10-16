import { queryOptions } from '@tanstack/react-query';
import { kiaIntakeService } from './kia-intake-service';

export const CLINICAL_HISTORY_TAB = {
  MATERNITY: 'maternity',
  IMMUNIZATION: 'immunization'
} as const;

export type ClinicalHistoryTabType =
  (typeof CLINICAL_HISTORY_TAB)[keyof typeof CLINICAL_HISTORY_TAB];

export interface MaternalHistoryItem {
  id: string;
  intakeSubmissionId: string;
  patientId: string;
  appointmentId: string | null;
  motherName: string;
  motherNik: string;
  motherBirthDate: string | null;
  motherAge: number | null;
  gestationalAgeWeeks: string | null;
  gestationalAgeFormatted: string | null;
  hpht: string | null;
  estimatedDueDate: string | null;
  partnerName: string | null;
  gravidaCount: number | null;
  parityCount: number | null;
  abortionCount: number | null;
  livingChildrenCount: number | null;
  createdAt: string;
}

export interface ImmunizationHistoryItem {
  id: string;
  intakeSubmissionId: string;
  patientId: string;
  appointmentId: string | null;
  childName: string;
  childNik: string;
  childBirthDate: string;
  childSex: string;
  childAgeFormatted: string | null;
  parentPhone: string;
  fatherName: string | null;
  motherName: string | null;
  previousVaccineHistory: string | null;
  childAllergyHistory: string | null;
  scheduledVaccinesCount: number;
  createdAt: string;
}

export interface PaginatedHistoryResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ClinicalHistoryFilters {
  page?: number;
  limit?: number;
  patientId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export const clinicalHistoryKeys = {
  all: ['clinical-history'] as const,
  maternal: (filters: ClinicalHistoryFilters) =>
    [...clinicalHistoryKeys.all, 'maternal', filters] as const,
  immunization: (filters: ClinicalHistoryFilters) =>
    [...clinicalHistoryKeys.all, 'immunization', filters] as const
};

export function maternalHistoryQueryOptions(filters: ClinicalHistoryFilters) {
  return queryOptions<PaginatedHistoryResponse<MaternalHistoryItem>>({
    queryKey: clinicalHistoryKeys.maternal(filters),
    queryFn: () => kiaIntakeService.getMaternalHistory(filters),
    staleTime: 30_000,
    placeholderData: (prev) => prev
  });
}

export const maternityHistoryQueryOptions = maternalHistoryQueryOptions;

export function immunizationHistoryQueryOptions(filters: ClinicalHistoryFilters) {
  return queryOptions<PaginatedHistoryResponse<ImmunizationHistoryItem>>({
    queryKey: clinicalHistoryKeys.immunization(filters),
    queryFn: () => kiaIntakeService.getImmunizationHistory(filters),
    staleTime: 30_000,
    placeholderData: (prev) => prev
  });
}
