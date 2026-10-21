export const payrollKeys = {
  all: ['payroll'] as const,
  filterOptions: () => [...payrollKeys.all, 'filter-options'] as const,
  periods: () => [...payrollKeys.all, 'periods'] as const,
  periodDetail: (id: string) => [...payrollKeys.all, 'period', id] as const,
  staff: (staffId: string, periodId?: string) =>
    [...payrollKeys.all, 'staff', staffId, { periodId }] as const,
  rates: () => [...payrollKeys.all, 'rates'] as const
};
