import { useQuery } from '@tanstack/react-query';
import { payrollKeys } from './query-keys';
import {
  fetchPayrollFilterOptions,
  fetchPayrollPeriods,
  fetchPayrollPeriodDetail,
  fetchStaffPayroll,
  fetchCompensationRates
} from './payroll.api';

export function usePayrollFilterOptionsQuery() {
  return useQuery({
    queryKey: payrollKeys.filterOptions(),
    queryFn: () => fetchPayrollFilterOptions()
  });
}

export function usePayrollPeriodsQuery() {
  return useQuery({
    queryKey: payrollKeys.periods(),
    queryFn: () => fetchPayrollPeriods()
  });
}

export function usePayrollPeriodDetailQuery(periodId?: string | null) {
  return useQuery({
    queryKey: payrollKeys.periodDetail(periodId ?? ''),
    queryFn: () => fetchPayrollPeriodDetail(periodId!),
    enabled: Boolean(periodId)
  });
}

export function useCompensationRatesQuery() {
  return useQuery({
    queryKey: payrollKeys.rates(),
    queryFn: () => fetchCompensationRates()
  });
}

export function useStaffPayrollQuery(staffId: string, periodId?: string) {
  return useQuery({
    queryKey: payrollKeys.staff(staffId, periodId),
    queryFn: () => fetchStaffPayroll(staffId, periodId),
    enabled: Boolean(staffId)
  });
}
