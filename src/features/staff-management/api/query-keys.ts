import type { StaffFilters } from './staff-management.api';

export const staffManagementKeys = {
  all: ['staff-management'] as const,
  staffs: (filters?: StaffFilters) =>
    [...staffManagementKeys.all, 'staffs', filters || {}] as const,
  staffDetail: (id: string) => [...staffManagementKeys.all, 'staff', id] as const,
  invitations: (status?: string) =>
    [...staffManagementKeys.all, 'invitations', status || 'all'] as const,
  invitationOptions: () => [...staffManagementKeys.all, 'invitation-options'] as const,
  roster: (staffId: string) => [...staffManagementKeys.all, 'roster', staffId] as const,
  scheduleSessions: () => [...staffManagementKeys.all, 'schedule-sessions'] as const,
  polyclinics: () => [...staffManagementKeys.all, 'polyclinics'] as const
};
