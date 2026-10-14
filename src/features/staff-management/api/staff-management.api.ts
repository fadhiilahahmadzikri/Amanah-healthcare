import { clientFetch } from '@/lib/client-fetch';

export interface PolyclinicUnit {
  id: string;
  name?: string;
  namaPoli?: string;
  code?: string;
  kodePoli?: string;
  unitType?: string;
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

export interface StaffMember {
  id: string;
  userId: string;
  poliklinikId: string;
  fullName: string;
  profession: string;
  staffType: 'doctor' | 'midwife' | 'worker';
  idCardNumber: string;
  birthPlace?: string | null;
  birthDate?: string | null;
  gender?: 'male' | 'female' | null;
  nationalId?: string | null;
  email?: string | null;
  phoneNumber: string;
  photoUrl?: string | null;
  isActive: boolean;
  address?: StaffAddressData | null;
  createdAt: string;
  updatedAt: string;
}

export interface StaffInvitation {
  id: string;
  email: string;
  roleCode: string;
  staffType: 'doctor' | 'midwife' | 'worker';
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
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

export interface InviteDoctorPayload {
  email: string;
  poliklinikId: string;
  fullName?: string;
}

export interface InviteStaffPayload {
  email: string;
  fullName?: string;
  roleCode?: 'staff_worker' | 'staff_midwife';
}

export interface BulkReplaceRosterPayload {
  rosters: Array<{
    sessionId: string;
    dow: number;
    notes?: string;
  }>;
}

export const staffManagementApi = {
  getPolyclinics: () => clientFetch<PolyclinicUnit[]>('/api/v1/clinics/poliklinik'),

  getAllStaffs: () => clientFetch<StaffMember[]>('/api/v1/staffs'),

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
