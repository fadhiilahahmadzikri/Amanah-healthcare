export {
  STAFF_TYPES,
  type StaffType,
  STAFF_TYPE_LABELS,
  CANONICAL_ROLES,
  type CanonicalRole,
  SYSTEM_ROLES,
  type SystemRole
} from '@/constants/staff-types.constant';
import { CANONICAL_ROLES, STAFF_TYPES, type StaffType } from '@/constants/staff-types.constant';

export const STAFF_ROLE_CODES = {
  DOCTOR: CANONICAL_ROLES.STAFF_DOCTOR,
  MIDWIFE: CANONICAL_ROLES.STAFF_MIDWIFE,
  WORKER: CANONICAL_ROLES.STAFF_WORKER
} as const;

export type StaffRoleCode = (typeof STAFF_ROLE_CODES)[keyof typeof STAFF_ROLE_CODES];

export const STAFF_INVITATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  EXPIRED: 'expired',
  REVOKED: 'revoked'
} as const;

export type StaffInvitationStatus =
  (typeof STAFF_INVITATION_STATUS)[keyof typeof STAFF_INVITATION_STATUS];

export const STAFF_ROLE_LABELS: Record<string, string> = {
  [STAFF_ROLE_CODES.DOCTOR]: 'Dokter',
  [STAFF_TYPES.DOCTOR]: 'Dokter',
  [STAFF_ROLE_CODES.MIDWIFE]: 'Bidan',
  [STAFF_TYPES.MIDWIFE]: 'Bidan',
  [STAFF_ROLE_CODES.WORKER]: 'Staf Operasional',
  [STAFF_TYPES.WORKER]: 'Staf Operasional'
};

export const STAFF_OPERATIONAL_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  ON_LEAVE: 'on_leave',
  INACTIVE: 'inactive'
} as const;

export type StaffOperationalStatus =
  (typeof STAFF_OPERATIONAL_STATUS)[keyof typeof STAFF_OPERATIONAL_STATUS];

export const STAFF_OPERATIONAL_STATUS_CONFIG: Record<
  StaffOperationalStatus,
  {
    label: string;
    dotColor: string;
    badgeBg: string;
    badgeText: string;
    description: string;
  }
> = {
  [STAFF_OPERATIONAL_STATUS.ACTIVE]: {
    label: 'Aktif',
    dotColor: '#10B981',
    badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    description: 'Staf aktif bertugas dalam layanan operasional klinik'
  },
  [STAFF_OPERATIONAL_STATUS.PENDING]: {
    label: 'Menunggu Verifikasi',
    dotColor: '#F59E0B',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    badgeText: 'text-amber-700 dark:text-amber-300',
    description: 'Calon staf dalam proses aktivasi atau menunggu verifikasi undangan'
  },
  [STAFF_OPERATIONAL_STATUS.ON_LEAVE]: {
    label: 'Sedang Cuti',
    dotColor: '#3B82F6',
    badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    badgeText: 'text-blue-700 dark:text-blue-300',
    description: 'Staf sedang dalam masa cuti kerja yang telah disetujui'
  },
  [STAFF_OPERATIONAL_STATUS.INACTIVE]: {
    label: 'Non-Aktif',
    dotColor: '#6B7280',
    badgeBg: 'bg-muted',
    badgeText: 'text-muted-foreground',
    description: 'Profil staf dinonaktifkan dari jadwal dan akses sistem'
  }
};

export interface StaffRoleKanbanColumnDef {
  id: StaffType;
  title: string;
  roleCode: StaffRoleCode;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
  description: string;
}

export const STAFF_ROLE_KANBAN_COLUMNS: StaffRoleKanbanColumnDef[] = [
  {
    id: STAFF_TYPES.DOCTOR,
    title: 'Dokter',
    roleCode: STAFF_ROLE_CODES.DOCTOR,
    dotColor: '#0D9488',
    badgeBg: 'bg-teal-500/10 dark:bg-teal-500/20',
    badgeText: 'text-teal-700 dark:text-teal-300',
    description: 'Dokter umum dan dokter spesialis pelayanan medis'
  },
  {
    id: STAFF_TYPES.MIDWIFE,
    title: 'Bidan',
    roleCode: STAFF_ROLE_CODES.MIDWIFE,
    dotColor: '#8B5CF6',
    badgeBg: 'bg-violet-500/10 dark:bg-violet-500/20',
    badgeText: 'text-violet-700 dark:text-violet-300',
    description: 'Tenaga medis kebidanan dan kesehatan ibu & anak (KIA)'
  },
  {
    id: STAFF_TYPES.WORKER,
    title: 'Staf Operasional',
    roleCode: STAFF_ROLE_CODES.WORKER,
    dotColor: '#F59E0B',
    badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    badgeText: 'text-amber-700 dark:text-amber-300',
    description: 'Staf administrasi, perawat, resepsionis, dan farmasi'
  }
];

export const STAFF_INVITATION_STATUS_LABELS: Record<StaffInvitationStatus, string> = {
  [STAFF_INVITATION_STATUS.ACCEPTED]: 'Diterima',
  [STAFF_INVITATION_STATUS.PENDING]: 'Menunggu',
  [STAFF_INVITATION_STATUS.REVOKED]: 'Dibatalkan',
  [STAFF_INVITATION_STATUS.EXPIRED]: 'Kedaluwarsa'
};
