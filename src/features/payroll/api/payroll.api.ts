import { clientFetch } from '@/lib/client-fetch';
import type {
  AttendanceTimingConfig,
  CalculatePayrollPayload,
  CompensationRateItem,
  PayrollFilterOptionsResponse,
  PayrollPeriodDetailResponse,
  PayrollPeriodItem,
  PayrollSummaryItem,
  ReconcileLeaveResult,
  UpdateCompensationRatesPayload
} from './types';

export async function fetchPayrollFilterOptions(): Promise<PayrollFilterOptionsResponse> {
  return clientFetch<PayrollFilterOptionsResponse>('/api/v1/payroll/filter-options', {
    method: 'GET'
  });
}

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

export async function fetchWorkPoliciesCurrent(): Promise<{
  rates: CompensationRateItem[];
  timing: AttendanceTimingConfig;
}> {
  const res = await clientFetch<{
    rates: CompensationRateItem[];
    timing: AttendanceTimingConfig;
  }>('/api/v1/work-policies/current', {
    method: 'GET'
  });
  return {
    rates: res.rates || [],
    timing: res.timing || { minBillableShiftMinutes: 30, roundingIncrementMinutes: 15 }
  };
}

export async function updateCompensationRates(
  payload: UpdateCompensationRatesPayload
): Promise<CompensationRateItem[]> {
  return clientFetch<CompensationRateItem[]>('/api/v1/work-policies/compensation-rates', {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function updateAttendanceTiming(
  payload: AttendanceTimingConfig
): Promise<AttendanceTimingConfig> {
  return clientFetch<AttendanceTimingConfig>('/api/v1/work-policies/attendance-timing', {
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

export async function reconcileDailyLeave(targetDate?: string): Promise<ReconcileLeaveResult> {
  const query: Record<string, unknown> = {};
  if (targetDate) query.targetDate = targetDate;

  return clientFetch<ReconcileLeaveResult>('/api/v1/payroll/reconcile-leave', {
    method: 'POST',
    query
  });
}

export interface PayrollExportRequestPayload {
  periodId: string;
  staffProfileId?: string;
  format?: 'pdf' | 'xlsx' | 'csv';
}

export interface PayrollExportJobResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  statusUrl: string;
}

export interface PayrollExportStatusResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  exportType: string;
  format: string;
  totalRows?: number;
  processedRows?: number;
  percent: number;
  phase: string;
  errorMessage?: string | null;
  downloadUrl: string | null;
}

export async function requestPayrollExport(
  payload: PayrollExportRequestPayload
): Promise<PayrollExportJobResponse> {
  const parameters: Record<string, unknown> = {
    periodId: payload.periodId
  };
  if (payload.staffProfileId) {
    parameters.staffProfileId = payload.staffProfileId;
  }

  return clientFetch<PayrollExportJobResponse>('/api/v1/exports', {
    method: 'POST',
    body: JSON.stringify({
      exportType: 'payroll',
      format: payload.format ?? 'pdf',
      parameters
    })
  });
}

export async function fetchExportJobStatus(jobId: string): Promise<PayrollExportStatusResponse> {
  return clientFetch<PayrollExportStatusResponse>(`/api/v1/exports/${jobId}`, {
    method: 'GET'
  });
}
