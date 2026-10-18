export const leaveManagementKeys = {
  all: ['leaves'] as const,
  lists: () => [...leaveManagementKeys.all, 'list'] as const,
  list: (filters?: { status?: string; staffType?: string }) =>
    [...leaveManagementKeys.lists(), filters] as const,
  policies: () => ['leave-policies'] as const,
  compensationRates: () => ['compensation-rates'] as const,
  replacements: (status?: string) => ['replacements', status] as const,
  payrollPeriods: () => ['payroll-periods'] as const
};
