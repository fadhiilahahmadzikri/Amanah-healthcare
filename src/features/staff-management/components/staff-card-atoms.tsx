import type React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
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

export function StaffOperationalStatusBadge({
  status
}: {
  status: 'active' | 'inactive' | 'on_leave' | 'pending' | string;
}) {
  switch (status) {
    case 'active':
      return (
        <Badge className='bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-medium'>
          Aktif
        </Badge>
      );
    case 'pending':
      return (
        <Badge className='bg-amber-600/15 text-amber-700 dark:text-amber-400 border-amber-500/30 font-medium'>
          Menunggu Verifikasi
        </Badge>
      );
    case 'on_leave':
      return (
        <Badge className='bg-sky-600/15 text-sky-700 dark:text-sky-400 border-sky-500/30 font-medium'>
          Sedang Cuti
        </Badge>
      );
    case 'inactive':
    default:
      return (
        <Badge variant='outline' className='text-muted-foreground font-medium'>
          Non-Aktif
        </Badge>
      );
  }
}

export function StaffLeaveBadge({
  leaveInfo
}: {
  leaveInfo?: { isOnLeave: boolean; requestType?: string | null; reason?: string | null } | null;
}) {
  if (!leaveInfo?.isOnLeave) return null;
  return (
    <span
      className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
      title={leaveInfo.reason ? `Cuti: ${leaveInfo.reason}` : 'Sedang Cuti'}
    >
      <Icons.calendar className='size-3 text-sky-500' />
      <span>Cuti</span>
      {leaveInfo.requestType && (
        <span className='opacity-80 font-medium capitalize'>({leaveInfo.requestType})</span>
      )}
    </span>
  );
}

export function StaffAttendanceBadge({
  attendance,
  className
}: {
  attendance?: { status: string; checkInAt?: string | null } | null;
  className?: string;
}) {
  if (!attendance) return null;
  if (attendance.status === 'present' || attendance.status === 'checked_in') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] sm:text-[9.5px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 leading-none select-none',
          className
        )}
      >
        <span className='size-1.5 rounded-full bg-emerald-500 shrink-0' />
        <span>Hadir</span>
      </span>
    );
  }
  if (attendance.status === 'late') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] sm:text-[9.5px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0 leading-none select-none',
          className
        )}
      >
        <span className='size-1.5 rounded-full bg-amber-500 shrink-0' />
        <span>Terlambat</span>
      </span>
    );
  }
  if (attendance.status === 'leave') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] sm:text-[9.5px] font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shrink-0 leading-none select-none',
          className
        )}
      >
        <span className='size-1.5 rounded-full bg-sky-500 shrink-0' />
        <span>Cuti</span>
      </span>
    );
  }
  return null;
}

export function StaffLeaveBanner({
  leaveInfo,
  className
}: {
  leaveInfo?: {
    isOnLeave: boolean;
    requestType?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    reason?: string | null;
    substituteName?: string | null;
  } | null;
  className?: string;
}) {
  if (!leaveInfo?.isOnLeave) return null;
  return (
    <div
      className={cn(
        'p-3.5 rounded-xl border border-sky-500/20 bg-sky-500/5 space-y-2 text-xs',
        className
      )}
    >
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2 font-bold text-sky-700 dark:text-sky-300'>
          <Icons.calendar className='size-4 text-sky-500 shrink-0' />
          <span>Staf Sedang Cuti</span>
        </div>
        {leaveInfo.requestType && (
          <span className='px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-sky-500/15 text-sky-600 dark:text-sky-400 capitalize'>
            {leaveInfo.requestType}
          </span>
        )}
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground'>
        {leaveInfo.startDate && leaveInfo.endDate && (
          <div>
            <span className='text-[11px] block font-medium text-muted-foreground/80'>
              Periode Cuti:
            </span>
            <span className='font-semibold text-foreground'>
              {leaveInfo.startDate} s/d {leaveInfo.endDate}
            </span>
          </div>
        )}
        {leaveInfo.reason && (
          <div>
            <span className='text-[11px] block font-medium text-muted-foreground/80'>Alasan:</span>
            <span className='font-semibold text-foreground'>{leaveInfo.reason}</span>
          </div>
        )}
        {leaveInfo.substituteName && (
          <div className='sm:col-span-2'>
            <span className='text-[11px] block font-medium text-muted-foreground/80'>
              Pengganti:
            </span>
            <span className='font-semibold text-foreground'>{leaveInfo.substituteName}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function StaffIdentitySection({
  fullName,
  email,
  photoUrl,
  profession: _profession
}: {
  fullName: string;
  email?: string | null;
  photoUrl?: string | null;
  profession?: string | null;
}) {
  return (
    <div className='flex items-start gap-3 min-w-0 relative z-20 mt-2.5'>
      <Avatar className='size-10 sm:size-11 rounded-full ring-2 ring-primary/20 shrink-0 shadow-2xs overflow-hidden'>
        <AvatarImage
          src={photoUrl || DEFAULT_AVATAR_PATH}
          alt={fullName}
          className='object-cover size-full aspect-square'
        />
        <AvatarFallback className='p-0 bg-transparent overflow-hidden'>
          <Image
            src={DEFAULT_AVATAR_PATH}
            alt={fullName}
            width={44}
            height={44}
            unoptimized
            className='size-full object-cover rounded-full aspect-square'
          />
        </AvatarFallback>
      </Avatar>

      <div className='flex flex-col min-w-0 flex-1 justify-center'>
        <h3
          title={fullName}
          className='text-[15px] sm:text-[16.5px] font-bold text-card-foreground tracking-tight leading-snug line-clamp-1 hover:text-primary transition-colors'
        >
          {fullName}
        </h3>

        <p className='text-xs font-medium text-muted-foreground tracking-tight line-clamp-1 mt-0.5 flex items-center gap-1.5'>
          <Icons.mail className='size-3 shrink-0 text-muted-foreground/70' />
          <span>{email || '-'}</span>
        </p>
      </div>
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
