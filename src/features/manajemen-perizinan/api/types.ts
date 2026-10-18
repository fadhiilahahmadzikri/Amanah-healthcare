export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type LeaveScope = 'session' | 'full_day';
export type LeaveDecisionSource = 'admin' | 'auto';
export type StaffCategory = 'doctor' | 'midwife' | 'worker';

export interface LeaveRequestSession {
  id: string;
  sessionId: string;
  sessionCode?: string;
  sessionLabel?: string;
  workDate: string;
}

export interface LeaveStaffProfile {
  id: string;
  fullName: string;
  profession?: string;
  idCardNumber?: string;
  staffType: StaffCategory;
}

export interface LeaveRequestItem {
  id: string;
  staffId: string;
  practitionerId?: string | null;
  startDate: string;
  endDate: string;
  durationDays: number;
  reason: string;
  type: string;
  scope: LeaveScope;
  decisionSource: LeaveDecisionSource;
  substituteStaffId?: string | null;
  documentUrl?: string | null;
  status: LeaveStatus;
  approvedBy?: string | null;
  approvalNotes?: string | null;
  cancelledAt?: string | null;
  sessions?: LeaveRequestSession[];
  staff?: LeaveStaffProfile | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeavePolicyItem {
  id: string;
  policyName?: string;
  limitMode: 'unlimited' | 'monthly_limit';
  monthlyLimit: number;
  approvalRequired: boolean;
  noticeDaysRequired?: number;
  quotaCountingPolicy?: 'per_request' | 'per_session';
  effectiveFrom: string;
  isActive: boolean;
}

export interface CompensationRateItem {
  id: string;
  category: StaffCategory;
  hourlyRate: number;
  overtimeHourlyRate: number;
  currency?: string;
  effectiveFrom: string;
  isActive: boolean;
}

export interface ReplacementOpportunityItem {
  id: string;
  leaveRequestId: string;
  sessionId: string;
  workDate: string;
  originalStaffProfileId: string;
  claimedByStaffProfileId?: string | null;
  status: 'open' | 'claimed' | 'cancelled';
  claimedAt?: string | null;
  createdAt: string;
}

export interface PayrollEntryItem {
  id: string;
  entryType: 'base_scheduled' | 'leave_deduction' | 'replacement_addition' | 'overtime_addition';
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
  staffType: string;
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
  status: string;
  totalPayout: number;
  calculatedAt?: string | null;
  calculatedBy?: string | null;
  notes?: string | null;
}
