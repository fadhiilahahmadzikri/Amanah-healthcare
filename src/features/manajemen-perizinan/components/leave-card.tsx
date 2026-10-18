import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { LeaveStatusBadge } from './leave-status-badge';
import type { LeaveRequestItem } from '../api/types';

interface LeaveCardProps {
  leave: LeaveRequestItem;
  onSelect: (leave: LeaveRequestItem) => void;
}

export function LeaveCard({ leave, onSelect }: LeaveCardProps) {
  const staff = leave.staff;
  const staffTypeLabel =
    staff?.staffType === 'doctor'
      ? 'Dokter'
      : staff?.staffType === 'midwife'
        ? 'Bidan'
        : 'Staf Operasional';

  const typeLabelMap: Record<string, string> = {
    annual_leave: 'Cuti Tahunan',
    sick_leave: 'Izin Sakit',
    seminar_symposium: 'Seminar / Simposium',
    family_matter: 'Keperluan Keluarga',
    external_assignment: 'Tugas Luar',
    other: 'Izin / Cuti Lainnya'
  };
  const leaveTypeLabel = typeLabelMap[leave.type] || leave.type;

  return (
    <Card
      onClick={() => onSelect(leave)}
      className='group relative cursor-pointer border border-border/60 hover:border-primary/50 transition-all duration-200 hover:shadow-md bg-card rounded-2xl overflow-hidden'
    >
      <CardContent className='p-5 flex flex-col gap-4'>
        {/* Header: Staff Info & Status */}
        <div className='flex items-start justify-between gap-3'>
          <div className='flex items-center gap-3 min-w-0'>
            <div className='size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0'>
              {staff?.fullName ? staff.fullName.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className='min-w-0'>
              <h4 className='font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors'>
                {staff?.fullName || 'Staf Klinik'}
              </h4>
              <p className='text-xs text-muted-foreground truncate'>
                {staffTypeLabel} {staff?.profession ? `• ${staff.profession}` : ''}
              </p>
            </div>
          </div>
          <LeaveStatusBadge status={leave.status} />
        </div>

        {/* Details: Date, Scope, Sessions */}
        <div className='bg-muted/40 rounded-xl p-3 flex flex-col gap-2 text-xs'>
          <div className='flex items-center gap-2 text-foreground font-medium'>
            <Icons.calendar className='size-3.5 text-muted-foreground shrink-0' />
            <span>
              {leave.startDate}
              {leave.endDate !== leave.startDate ? ` s.d ${leave.endDate}` : ''}
            </span>
            <span className='text-muted-foreground font-normal'>({leave.durationDays} hari)</span>
          </div>

          <div className='flex items-center gap-2 text-muted-foreground'>
            <Icons.clock className='size-3.5 shrink-0' />
            <span>
              {leave.scope === 'session' && leave.sessions && leave.sessions.length > 0
                ? `Sesi: ${leave.sessions.map((s) => s.sessionCode || s.sessionLabel || s.sessionId).join(', ')}`
                : '1 Hari Penuh'}
            </span>
            <span className='text-primary/80 font-medium ml-auto'>{leaveTypeLabel}</span>
          </div>
        </div>

        {/* Reason snippet */}
        <div className='text-xs text-muted-foreground line-clamp-2 italic'>
          &ldquo;{leave.reason}&rdquo;
        </div>

        {/* Footer: Date submitted & Action */}
        <div className='flex items-center justify-between pt-2 border-t border-border/40 text-xs'>
          <span className='text-muted-foreground'>Diajukan: {leave.createdAt.split('T')[0]}</span>
          <Button
            variant='ghost'
            size='sm'
            className='h-7 text-xs text-primary group-hover:bg-primary/10 gap-1 px-2'
          >
            Lihat Detail
            <Icons.chevronRight className='size-3.5' />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
