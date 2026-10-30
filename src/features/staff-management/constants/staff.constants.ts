export const STAFF_INVITATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  EXPIRED: 'expired',
  REVOKED: 'revoked'
} as const;

export type StaffInvitationStatus =
  (typeof STAFF_INVITATION_STATUS)[keyof typeof STAFF_INVITATION_STATUS];

export const STAFF_INVITATION_STATUS_LABELS: Record<StaffInvitationStatus, string> = {
  [STAFF_INVITATION_STATUS.ACCEPTED]: 'Diterima',
  [STAFF_INVITATION_STATUS.PENDING]: 'Menunggu',
  [STAFF_INVITATION_STATUS.REVOKED]: 'Dibatalkan',
  [STAFF_INVITATION_STATUS.EXPIRED]: 'Kedaluwarsa'
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
