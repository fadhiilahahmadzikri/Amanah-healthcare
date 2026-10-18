import { clientFetch } from '@/lib/client-fetch';
import type {
  CalculatePayrollPayload,
  CompensationRateItem,
  PayrollPeriodDetailResponse,
  PayrollPeriodItem,
  PayrollSummaryItem,
  UpdateCompensationRatesPayload
} from './types';

export async function fetchPayrollPeriods(): Promise<PayrollPeriodItem[]> {
  return clientFetch<PayrollPeriodItem[]>('/api/v1/payroll/periods', {
    method: 'GET'
  });
}

export async function fetchPayrollPeriodDetail(id: string): Promise<PayrollPeriodDetailResponse> {
  return clientFetch<PayrollPeriodDetailResponse>(`/api/v1/payroll/periods/${id}`, {
    method: 'GET'
  });
}

export async function calculatePayroll(
  payload: CalculatePayrollPayload
): Promise<PayrollPeriodDetailResponse> {
  return clientFetch<PayrollPeriodDetailResponse>('/api/v1/payroll/calculate', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function finalizePayrollPeriod(id: string): Promise<PayrollPeriodItem> {
  return clientFetch<PayrollPeriodItem>(`/api/v1/payroll/periods/${id}/finalize`, {
    method: 'PATCH'
  });
}

export async function fetchCompensationRates(): Promise<CompensationRateItem[]> {
  const res = await clientFetch<{
    rates: CompensationRateItem[];
  }>('/api/v1/work-policies/current', {
    method: 'GET'
  });
  return res.rates || [];
}

export async function updateCompensationRates(
  payload: UpdateCompensationRatesPayload
): Promise<CompensationRateItem[]> {
  return clientFetch<CompensationRateItem[]>('/api/v1/work-policies/compensation-rates', {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function fetchStaffPayroll(
  staffId: string,
  periodId?: string
): Promise<PayrollSummaryItem> {
  const query: Record<string, unknown> = {};
  if (periodId) query.periodId = periodId;

  return clientFetch<PayrollSummaryItem>(`/api/v1/payroll/staff/${staffId}`, {
    method: 'GET',
    query
  });
}
