import { clientFetch } from '@/lib/client-fetch';
import type { Gender } from '@/constants/gender.constants';
import type { StaffInvitationStatus, StaffRoleCode, StaffType } from '../constants/staff.constants';

export interface PolyclinicUnit {
  id: string;
  code: string;
  name: string;
  location?: string | null;
  isActive?: boolean;
}

export interface StaffAddressData {
  provinceCode?: string | null;
  provinceName?: string | null;
  regencyCode?: string | null;
  regencyName?: string | null;
  districtCode?: string | null;
  districtName?: string | null;
  villageCode?: string | null;
  villageName?: string | null;
  line1?: string | null;
  fullAddress?: string | null;
}

export interface StaffLeaveInfo {
  isOnLeave: boolean;
  requestType?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  reason?: string | null;
  substituteName?: string | null;
  replacementStatus?: string | null;
}

export interface StaffTodayAttendance {
  status: 'present' | 'late' | 'missed' | 'leave' | 'absent' | 'not_checked_in';
  checkInAt?: string | null;
  checkOutAt?: string | null;
  shift?: string | null;
}

export interface StaffMember {
  id: string;
  userId: string;
  poliklinikId: string;
  poliklinikName?: string | null;
  fullName: string;
  profession: string;
  staffType: StaffType;
  staffCode: string;
  licenseNumber?: string | null;
  birthPlace?: string | null;
  birthDate?: string | null;
  gender?: Gender;
  nationalId?: string | null;
  email?: string | null;
  phoneNumber: string;
  photoUrl?: string | null;
  isActive: boolean;
  status: 'active' | 'inactive' | 'on_leave' | 'pending';
  isPendingVerification?: boolean;
  invitationId?: string | null;
  address?: StaffAddressData | null;
  leaveInfo?: StaffLeaveInfo | null;
  todayAttendance?: StaffTodayAttendance | null;
  createdAt: string;
  updatedAt: string;
}

export interface StaffFilters {
  status?: string;
  staffType?: string;
  profession?: string;
  poliklinikId?: string;
  search?: string;
}

export interface StaffInvitation {
  id: string;
  email: string;
  roleCode: StaffRoleCode | string;
  staffType: StaffType;
  status: StaffInvitationStatus;
  expiresAt: string;
  acceptedAt?: string | null;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface StaffRosterItem {
  id: string;
  staffProfileId: string;
  sessionId: string;
  dow: number;
  isActive: boolean;
  notes?: string | null;
  isOverride?: boolean;
  session?: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
  };
  day?: {
    dow: number;
    code: string;
    nameId: string;
    nameEn: string;
  };
}

export interface PractitionerRoleOption {
  code: string;
  name: string;
  description?: string | null;
}

export interface InvitationOptionsResponse {
  practitionerRoles: PractitionerRoleOption[];
  polyclinics: PolyclinicUnit[];
}

export interface InviteDoctorPayload {
  email: string;
  poliklinikId: string;
  fullName?: string;
  roleCode?: string;
}

export interface InviteStaffPayload {
  email: string;
  fullName?: string;
  roleCode?: StaffRoleCode | string;
}

export interface BulkReplaceRosterPayload {
  rosters: Array<{
    sessionId: string;
    dow: number;
    notes?: string;
  }>;
}

export const staffManagementApi = {
  getInvitationOptions: () =>
    clientFetch<InvitationOptionsResponse>('/api/v1/admin/invitations/options'),

  getPolyclinics: () => clientFetch<PolyclinicUnit[]>('/api/v1/clinics/poliklinik'),

  getAllStaffs: (filters?: StaffFilters) => {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.set('status', filters.status);
    if (filters?.staffType) params.set('staffType', filters.staffType);
    if (filters?.profession) params.set('profession', filters.profession);
    if (filters?.poliklinikId) params.set('poliklinikId', filters.poliklinikId);
    if (filters?.search?.trim()) params.set('search', filters.search.trim());
    const queryStr = params.toString();
    return clientFetch<StaffMember[]>(`/api/v1/staffs${queryStr ? `?${queryStr}` : ''}`);
  },

  getStaffById: (id: string) => clientFetch<StaffMember>(`/api/v1/staffs/${id}`),

  updateStaff: (id: string, payload: Partial<StaffMember>) =>
    clientFetch<StaffMember>(`/api/v1/staffs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),

  getStaffRoster: (staffId: string) =>
    clientFetch<StaffRosterItem[]>(`/api/v1/staffs/${staffId}/roster`),

  updateStaffRoster: (staffId: string, payload: BulkReplaceRosterPayload) =>
    clientFetch<StaffRosterItem[]>(`/api/v1/staffs/${staffId}/roster`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  deleteStaffRosterItem: (staffId: string, rosterId: string) =>
    clientFetch<void>(`/api/v1/staffs/${staffId}/roster/${rosterId}`, {
      method: 'DELETE'
    }),

  resetStaffRoster: (staffId: string) =>
    clientFetch<StaffRosterItem[]>(`/api/v1/staffs/${staffId}/roster`, {
      method: 'DELETE'
    }),

  getInvitations: (status?: string) =>
    clientFetch<StaffInvitation[]>(`/api/v1/admin/invitations${status ? `?status=${status}` : ''}`),

  inviteDoctor: (payload: InviteDoctorPayload) =>
    clientFetch<{
      invitation: StaffInvitation;
      temporaryPassword: string;
      loginUrl: string;
    }>('/api/v1/admin/invitations/doctor', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  inviteStaff: (payload: InviteStaffPayload) =>
    clientFetch<{
      invitation: StaffInvitation;
      temporaryPassword: string;
      loginUrl: string;
    }>('/api/v1/admin/invitations/staff', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  revokeInvitation: (id: string) =>
    clientFetch<StaffInvitation>(`/api/v1/admin/invitations/${id}`, {
      method: 'DELETE'
    }),

  getScheduleSessions: () =>
    clientFetch<{
      days: Array<{
        dow: number;
        label: string;
        isActive: boolean;
      }>;
      sessionDefs: Array<{
        id: string;
        code: string;
        name?: string;
        label: string;
        timeRange?: string;
        isActive: boolean;
      }>;
      weeklyTemplates: Array<{
        id: string;
        sessionId: string;
        sessionCode: string;
        sessionLabel: string;
        dow: number;
        dowLabel: string;
        startsAt: string;
        endsAt: string;
        isActive: boolean;
      }>;
    }>('/api/v1/admin/schedule-configuration')
};
