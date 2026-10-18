export type StaffCategory = 'doctor' | 'midwife' | 'worker';
export type PayrollPeriodStatus = 'draft' | 'calculated' | 'finalized';
export type PayrollEntryType =
  | 'base_scheduled'
  | 'leave_deduction'
  | 'replacement_addition'
  | 'overtime_addition';

export interface PayrollEntryItem {
  id: string;
  payrollPeriodId: string;
  staffProfileId: string;
  practitionerId?: string | null;
  entryType: PayrollEntryType;
  sourceType: string;
  sourceId?: string | null;
  quantityHours: number;
  hourlyRate: number;
  amount: number;
  description?: string | null;
  createdAt: string;
}

export interface PayrollSummaryItem {
  staffId: string;
  fullName: string;
  staffType: StaffCategory;
  positionTitle?: string;
  practitionerId?: string | null;
  baseHours: number;
  baseEarnings: number;
  leaveDeductions: number;
  replacementAdditions: number;
  netPayroll: number;
  entries: PayrollEntryItem[];
}

export interface PayrollPeriodItem {
  id: string;
  periodName: string;
  periodStart: string;
  periodEnd: string;
  status: PayrollPeriodStatus;
  totalPayout: number;
  calculatedAt?: string | null;
  calculatedBy?: string | null;
  ruleVersion?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PayrollPeriodDetailResponse {
  period: PayrollPeriodItem;
  summaries: PayrollSummaryItem[];
}

export interface CalculatePayrollPayload {
  periodStart: string;
  periodEnd: string;
  periodName: string;
}

export interface PayrollFilterState {
  category: 'all' | StaffCategory;
  search: string;
}

export interface CompensationRateItem {
  id?: string;
  category: StaffCategory;
  hourlyRate: number;
  overtimeHourlyRate: number;
  notes?: string | null;
}

export interface UpdateCompensationRatesPayload {
  rates: {
    category: StaffCategory;
    hourlyRate: number;
    overtimeHourlyRate: number;
    notes?: string;
  }[];
}
