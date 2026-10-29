import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { staffManagementApi, type StaffFilters } from './staff-management.api';
import { staffManagementKeys } from './query-keys';

export const staffsQueryOptions = (filters?: StaffFilters) =>
  queryOptions({
    queryKey: staffManagementKeys.staffs(filters),
    queryFn: () => staffManagementApi.getAllStaffs(filters),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000
  });

export const staffInvitationsQueryOptions = (status?: string) =>
  queryOptions({
    queryKey: staffManagementKeys.invitations(status),
    queryFn: () => staffManagementApi.getInvitations(status),
    staleTime: 15 * 1000,
    gcTime: 5 * 60 * 1000
  });

export const staffDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: staffManagementKeys.staffDetail(id),
    queryFn: () => staffManagementApi.getStaffById(id),
    staleTime: 30 * 1000,
    enabled: Boolean(id)
  });

export const staffRosterQueryOptions = (staffId: string) =>
  queryOptions({
    queryKey: staffManagementKeys.roster(staffId),
    queryFn: () => staffManagementApi.getStaffRoster(staffId),
    staleTime: 0,
    enabled: Boolean(staffId)
  });

export const scheduleSessionsQueryOptions = () =>
  queryOptions({
    queryKey: staffManagementKeys.scheduleSessions(),
    queryFn: () => staffManagementApi.getScheduleSessions(),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000
  });

export const polyclinicsQueryOptions = () =>
  queryOptions({
    queryKey: staffManagementKeys.polyclinics(),
    queryFn: () => staffManagementApi.getPolyclinics(),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  });

export const invitationOptionsQueryOptions = () =>
  queryOptions({
    queryKey: staffManagementKeys.invitationOptions(),
    queryFn: () => staffManagementApi.getInvitationOptions(),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  });

export { staffManagementKeys };
