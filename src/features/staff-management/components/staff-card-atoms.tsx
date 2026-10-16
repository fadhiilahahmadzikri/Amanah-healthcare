import type React from 'react';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import {
  STAFF_INVITATION_STATUS,
  STAFF_INVITATION_STATUS_LABELS,
  STAFF_ROLE_CODES,
  STAFF_ROLE_LABELS,
  STAFF_TYPES
} from '../constants/staff.constants';

export function StaffRoleBadge({ roleCode, staffType }: { roleCode?: string; staffType?: string }) {
  const effective = roleCode || staffType;
  if (effective === STAFF_ROLE_CODES.DOCTOR || effective === STAFF_TYPES.DOCTOR) {
    return (
      <Badge className='bg-blue-600/15 text-blue-700 dark:text-blue-400 border-blue-500/30 font-medium'>
        {STAFF_ROLE_LABELS[STAFF_ROLE_CODES.DOCTOR]}
      </Badge>
    );
  }
  if (effective === STAFF_ROLE_CODES.MIDWIFE || effective === STAFF_TYPES.MIDWIFE) {
    return (
      <Badge className='bg-teal-600/15 text-teal-700 dark:text-teal-400 border-teal-500/30 font-medium'>
        {STAFF_ROLE_LABELS[STAFF_ROLE_CODES.MIDWIFE]}
      </Badge>
    );
  }
  return (
    <Badge className='bg-amber-600/15 text-amber-700 dark:text-amber-400 border-amber-500/30 font-medium'>
      {STAFF_ROLE_LABELS[STAFF_ROLE_CODES.WORKER]}
    </Badge>
  );
}

export function StaffStatusBadgeItem({ isActive }: { isActive: boolean }) {
  return (
    <StatusBadge
      status={isActive ? 'Buka' : 'Tutup'}
      label={isActive ? 'Aktif' : 'Non-Aktif'}
      variant='pill'
      size='sm'
    />
  );
}

export function StaffIdentitySection({
  fullName,
  email
}: {
  fullName: string;
  email?: string | null;
}) {
  return (
    <div className='flex flex-col relative z-20 mt-3'>
      <h3
        title={fullName}
        className='text-[17px] sm:text-[18px] font-bold text-card-foreground tracking-tight leading-snug line-clamp-1'
      >
        {fullName}
      </h3>

      <p className='text-xs sm:text-[13px] font-medium text-muted-foreground tracking-tight line-clamp-1 mt-1 flex items-center gap-1.5'>
        <Icons.mail className='size-3 shrink-0 text-muted-foreground/70' />
        <span>{email || '-'}</span>
      </p>
    </div>
  );
}

export function StaffQuickRosterButton({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
  return (
    <Button
      type='button'
      variant='outline'
      size='icon'
      shape='pill'
      onClick={onClick}
      title='Atur Shift Roster Mingguan'
      aria-label='Atur Shift Roster Mingguan'
      className='size-8 shadow-2xs z-20 shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent/80'
    >
      <Icons.calendar className='size-3.5' />
    </Button>
  );
}

export function StaffInvitationStatusBadge({ status }: { status: string }) {
  switch (status) {
    case STAFF_INVITATION_STATUS.ACCEPTED:
      return (
        <Badge className='bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'>
          {STAFF_INVITATION_STATUS_LABELS[STAFF_INVITATION_STATUS.ACCEPTED]}
        </Badge>
      );
    case STAFF_INVITATION_STATUS.PENDING:
      return (
        <Badge className='bg-amber-600/15 text-amber-700 dark:text-amber-400 border-amber-500/30'>
          {STAFF_INVITATION_STATUS_LABELS[STAFF_INVITATION_STATUS.PENDING]}
        </Badge>
      );
    case STAFF_INVITATION_STATUS.REVOKED:
      return (
        <Badge className='bg-destructive/15 text-destructive border-destructive/30'>
          {STAFF_INVITATION_STATUS_LABELS[STAFF_INVITATION_STATUS.REVOKED]}
        </Badge>
      );
    case STAFF_INVITATION_STATUS.EXPIRED:
      return (
        <Badge variant='outline' className='text-muted-foreground'>
          {STAFF_INVITATION_STATUS_LABELS[STAFF_INVITATION_STATUS.EXPIRED]}
        </Badge>
      );
    default:
      return <Badge variant='outline'>{status}</Badge>;
  }
}
