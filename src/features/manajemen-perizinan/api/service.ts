import { clientFetch } from '@/lib/client-fetch';
import type {
  CompensationRateItem,
  LeavePolicyItem,
  LeaveRequestItem,
  PayrollPeriodItem,
  PayrollSummaryItem,
  ReplacementOpportunityItem
} from './types';

export async function fetchAllLeaves(filters?: {
  status?: string;
  roleId?: string;
}): Promise<LeaveRequestItem[]> {
  const query: Record<string, unknown> = {};
  if (filters?.status) query.status = filters.status;
  if (filters?.roleId) query.roleId = filters.roleId;

  return clientFetch<LeaveRequestItem[]>('/api/v1/leaves/all', {
    method: 'GET',
    query
  });
}

export async function reviewLeave(
  id: string,
  status: 'approved' | 'rejected',
  approvalNotes?: string
): Promise<LeaveRequestItem> {
  return clientFetch<LeaveRequestItem>(`/api/v1/leaves/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, approvalNotes })
  });
}

export async function fetchLeavePolicies(): Promise<LeavePolicyItem[]> {
  const res = await clientFetch<{
    policy: LeavePolicyItem;
    rates: CompensationRateItem[];
  }>('/api/v1/work-policies/current', {
    method: 'GET'
  });
  return res?.policy ? [res.policy] : [];
}

export async function updateLeavePolicy(data: Partial<LeavePolicyItem>): Promise<LeavePolicyItem> {
  return clientFetch<LeavePolicyItem>('/api/v1/work-policies/leave-policy', {
    method: 'PATCH',
    body: JSON.stringify({
      approvalRequired: data.approvalRequired,
      limitMode: data.limitMode,
      monthlyLimit: data.monthlyLimit,
      quotaCountingPolicy: data.quotaCountingPolicy,
      periodPolicy: data.periodPolicy
    })
  });
}

export async function fetchCompensationRates(): Promise<CompensationRateItem[]> {
  const res = await clientFetch<{
    policy: LeavePolicyItem;
    rates: CompensationRateItem[];
  }>('/api/v1/work-policies/current', {
    method: 'GET'
  });
  return res?.rates || [];
}

export async function updateCompensationRate(
  roleId: string,
  hourlyRate: number,
  overtimeHourlyRate: number
): Promise<CompensationRateItem> {
  const res = await clientFetch<CompensationRateItem[]>(
    '/api/v1/work-policies/compensation-rates',
    {
      method: 'PUT',
      body: JSON.stringify({
        rates: [{ roleId, hourlyRate, overtimeHourlyRate }]
      })
    }
  );
  return res.find((r) => r.roleId === roleId) || res[0];
}

export async function fetchReplacements(status?: string): Promise<ReplacementOpportunityItem[]> {
  const query: Record<string, unknown> = {};
  if (status) query.status = status;

  return clientFetch<ReplacementOpportunityItem[]>('/api/v1/replacements', {
    method: 'GET',
    query
  });
}

export async function fetchPayrollPeriods(): Promise<PayrollPeriodItem[]> {
  return clientFetch<PayrollPeriodItem[]>('/api/v1/payroll/periods', {
    method: 'GET'
  });
}

export async function calculatePayroll(
  periodStart: string,
  periodEnd: string,
  periodName: string
): Promise<{
  period: PayrollPeriodItem;
  summaries: PayrollSummaryItem[];
}> {
  return clientFetch<{
    period: PayrollPeriodItem;
    summaries: PayrollSummaryItem[];
  }>('/api/v1/payroll/calculate', {
    method: 'POST',
    body: JSON.stringify({ periodStart, periodEnd, periodName })
  });
}
