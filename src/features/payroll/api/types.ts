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
  checkInAt?: string | null;
  checkOutAt?: string | null;
  isEarlyDeparture?: boolean;
  notes?: string | null;
  createdAt: string;
}

export interface PayrollSummaryItem {
  staffId: string;
  staffCode?: string;
  fullName: string;
  avatarUrl?: string | null;
  staffType: StaffCategory;
  positionTitle?: string;
  departmentName?: string;
  practitionerId?: string | null;
  periodId?: string;
  periodName?: string;
  periodStart?: string;
  periodEnd?: string;
  periodStatus?: string;
  calculatedAt?: string | null;
  baseHours: number;
  deductionHours?: number;
  additionHours?: number;
  baseEarnings: number;
  grossEarnings?: number;
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

export interface PayrollFilterOptionsResponse {
  categories: Array<{ id: string; label: string }>;
  periods: Array<{
    id: string;
    name: string;
    status: PayrollPeriodStatus;
    periodStart: string;
    periodEnd: string;
  }>;
  statuses: Array<{ id: string; label: string }>;
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

export interface ReconcileLeaveResult {
  targetDate: string;
  processedCount: number;
  totalDeductionsAmount: number;
  staffProcessed: string[];
}
