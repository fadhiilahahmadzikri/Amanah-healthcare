import { parseAsArrayOf, parseAsInteger, parseAsString } from 'nuqs';
import { getSortingStateParser } from '@/lib/parsers';
import type { ExtendedColumnSort } from '@/types/data-table';
import type { Patient } from '../api/types';

export const patientSearchParamsParsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  search: parseAsString.withDefault(''),
  name: parseAsString.withDefault(''),
  patient: parseAsString.withDefault(''),
  gender: parseAsArrayOf(parseAsString, ',').withDefault([]),
  account_status: parseAsArrayOf(parseAsString, ',').withDefault([]),
  status: parseAsArrayOf(parseAsString, ',').withDefault([]),
  blood_type: parseAsArrayOf(parseAsString, ',').withDefault([]),
  profile_type: parseAsArrayOf(parseAsString, ',').withDefault([]),
  sort: getSortingStateParser<Patient>().withDefault([]),
};

export type PatientSearchParams = {
  page: number;
  perPage: number;
  search: string;
  name: string;
  patient: string;
  gender: string[];
  account_status: string[];
  status: string[];
  blood_type: string[];
  profile_type: string[];
  sort: ExtendedColumnSort<Patient>[];
};

export const PATIENT_RESET_PARAMS = {
  page: 1,
  search: null,
  name: null,
  patient: null,
  gender: null,
  account_status: null,
  status: null,
  blood_type: null,
  profile_type: null,
  sort: null,
} as const;
