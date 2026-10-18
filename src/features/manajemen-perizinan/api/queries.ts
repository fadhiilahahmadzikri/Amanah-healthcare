import { useQuery } from '@tanstack/react-query';
import { leaveManagementKeys } from './query-keys';
import {
  fetchAllLeaves,
  fetchCompensationRates,
  fetchLeavePolicies,
  fetchPayrollPeriods,
  fetchReplacements
} from './service';

export function useAllLeavesQuery(filters?: { status?: string; staffType?: string }) {
  return useQuery({
    queryKey: leaveManagementKeys.list(filters),
    queryFn: () => fetchAllLeaves(filters)
  });
}

export function useLeavePoliciesQuery() {
  return useQuery({
    queryKey: leaveManagementKeys.policies(),
    queryFn: () => fetchLeavePolicies()
  });
}

export function useCompensationRatesQuery() {
  return useQuery({
    queryKey: leaveManagementKeys.compensationRates(),
    queryFn: () => fetchCompensationRates()
  });
}

export function useReplacementsQuery(status?: string) {
  return useQuery({
    queryKey: leaveManagementKeys.replacements(status),
    queryFn: () => fetchReplacements(status)
  });
}

export function usePayrollPeriodsQuery() {
  return useQuery({
    queryKey: leaveManagementKeys.payrollPeriods(),
    queryFn: () => fetchPayrollPeriods()
  });
}
