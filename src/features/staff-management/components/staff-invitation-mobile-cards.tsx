'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { STAFF_INVITATION_STATUS } from '../constants/staff.constants';
import { StaffRoleBadge, StaffInvitationStatusBadge } from './staff-card-atoms';
import type { StaffInvitation } from '../api/staff-management.api';

export interface StaffInvitationMobileCardsProps {
  invitations: StaffInvitation[];
  onRevoke: (id: string, email: string) => void;
  isRevoking?: boolean;
}

export function StaffInvitationMobileCards({
  invitations,
  onRevoke,
  isRevoking = false
}: StaffInvitationMobileCardsProps) {
  if (invitations.length === 0) {
    return (
      <div className='flex flex-1 min-h-[220px] flex-col items-center justify-center p-4'>
        <EmptyState
          icon={Icons.mail}
          title='Belum Ada Riwayat Undangan'
          description='Seluruh riwayat undangan calon staf via email akan tercatat di sini.'
        />
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-3.5 pb-20 pt-1 select-none font-sans'>
      {invitations.map((inv) => {
        const initials = inv.email.slice(0, 2).toUpperCase();

        const formattedCreatedAt = inv.createdAt
          ? new Date(inv.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })
          : '-';

        const formattedExpiresAt = inv.expiresAt
          ? new Date(inv.expiresAt).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })
          : '-';

        const isPending = inv.status === STAFF_INVITATION_STATUS.PENDING;

        return (
          <div
            key={inv.id}
            className='group relative w-full bg-gradient-to-t from-primary/[0.03] via-card to-card text-card-foreground border border-border/80 rounded-[20px] p-4 flex flex-col justify-between gap-3 select-none transition-all duration-200 shadow-2xs hover:border-primary/50 hover:shadow-xs'
          >
            {/* 1. Header: Avatar Inisial + Email + Role Badge + Status Badge */}
            <div className='flex items-start justify-between gap-2.5 min-w-0'>
              <div className='flex items-center gap-3 min-w-0 flex-1'>
                <div className='size-11 rounded-full overflow-hidden shrink-0 ring-1 ring-border/50 bg-primary/10 text-primary aspect-square shadow-2xs flex items-center justify-center font-bold text-xs uppercase'>
                  {initials}
                </div>

                <div className='min-w-0 flex-1 space-y-1'>
                  <h3
                    className='text-sm sm:text-[15px] font-bold tracking-tight text-foreground truncate font-mono'
                    title={inv.email}
                  >
                    {inv.email}
                  </h3>
                  <div className='flex items-center gap-1.5 flex-wrap'>
                    <StaffRoleBadge roleCode={inv.roleCode} roleName={inv.roleName} />
                  </div>
                </div>
              </div>

              {/* Status Badge di Pojok Kanan Atas */}
              <div className='shrink-0 self-start pt-0.5'>
                <StaffInvitationStatusBadge status={inv.status} />
              </div>
            </div>

            {/* 2. Metadata Slot: Tanggal Kirim & Tanggal Kedaluwarsa */}
            <div className='flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-muted/40 border border-border/40 text-muted-foreground'>
              <div className='flex items-center gap-1.5 min-w-0'>
                <Icons.calendar className='size-3.5 text-primary/70 shrink-0' />
                <span className='text-[11px] font-mono truncate'>Kirim: {formattedCreatedAt}</span>
              </div>

              <div className='flex items-center gap-1.5 min-w-0'>
                <Icons.clock className='size-3.5 text-amber-600/70 shrink-0' />
                <span className='text-[11px] font-mono truncate'>
                  Kedaluwarsa: {formattedExpiresAt}
                </span>
              </div>
            </div>

            {/* 3. Footer: Keterangan & Tombol Batalkan Undangan */}
            <div className='w-full flex items-center justify-between gap-3 pt-2.5 border-t border-border/40 min-w-0'>
              <span className='text-[11px] text-muted-foreground truncate'>
                {isPending ? 'Menunggu verifikasi email' : 'Tautan undangan tidak aktif'}
              </span>

              <div className='flex items-center gap-1.5 shrink-0'>
                {isPending && (
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    shape='pill'
                    disabled={isRevoking}
                    onClick={() => onRevoke(inv.id, inv.email)}
                    className='h-8 text-xs font-semibold px-3 text-destructive border-destructive/30 hover:bg-destructive/10 cursor-pointer gap-1.5'
                  >
                    <Icons.close className='size-3.5' />
                    <span>Batalkan</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
