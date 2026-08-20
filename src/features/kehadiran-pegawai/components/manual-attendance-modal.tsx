'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import { useRecordManualAttendanceMutation } from '../api/mutations';
import { INITIAL_STAFF_ATTENDANCE } from '../constants/mock-data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface ManualAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManualAttendanceModal({ isOpen, onClose }: ManualAttendanceModalProps) {
  const mutation = useRecordManualAttendanceMutation();
  const [staffId, setStaffId] = useState('');

  // Lookup matched staff
  const matchedStaff = INITIAL_STAFF_ATTENDANCE.find(
    (s) =>
      s.id_staf.toUpperCase() === staffId.trim().toUpperCase() ||
      s.id.toUpperCase() === staffId.trim().toUpperCase()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId.trim()) {
      toast.error('Masukkan ID staf terlebih dahulu.');
      return;
    }

    mutation.mutate(
      {
        staffIdOrCode: staffId.trim()
      },
      {
        onSuccess: () => {
          setStaffId('');
          onClose();
        }
      }
    );
  };

  const initials = matchedStaff
    ? matchedStaff.nama_staf
        .replace('dr. ', '')
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'ST';

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[460px]'
      showCloseButton={false}
    >
      <form onSubmit={handleSubmit} className='relative font-sans space-y-4'>
        {/* 1. Header Tetap Ada */}
        <div className='pb-3 border-b border-border/40'>
          <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
            Presensi Manual Pegawai
          </h3>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Masukkan ID staf untuk memproses kehadiran presensi secara langsung.
          </p>
        </div>

        {/* 2. Input ID Staf (Tanpa label text di atasnya) */}
        <div className='space-y-3 py-0.5'>
          <div className='relative'>
            <Icons.user className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none' />
            <Input
              value={staffId}
              onChange={(e) => setStaffId(e.target.value.toUpperCase())}
              placeholder='Masukkan ID staf...'
              className='pl-9 h-10 text-xs font-mono font-semibold'
              autoFocus
            />
          </div>

          {/* Matched Staff Preview Card */}
          {matchedStaff && (
            <div className='p-3 rounded-xl border border-border/40 bg-muted/20 flex items-center justify-between gap-3'>
              <div className='flex items-center gap-2.5 min-w-0'>
                <Avatar className='size-9 rounded-full ring-1 ring-border/40 shrink-0'>
                  {matchedStaff.avatar && (
                    <AvatarImage src={matchedStaff.avatar} alt={matchedStaff.nama_staf} />
                  )}
                  <AvatarFallback className='bg-primary/10 text-primary font-bold text-xs'>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className='min-w-0'>
                  <span className='text-xs font-bold text-foreground block truncate'>
                    {matchedStaff.nama_staf}
                  </span>
                  <span className='text-[11px] text-muted-foreground block truncate'>
                    {matchedStaff.id_staf} • {matchedStaff.kategori}
                  </span>
                </div>
              </div>

              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-[10.5px] font-semibold border shrink-0',
                  matchedStaff.status === 'Hadir'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30'
                )}
              >
                {matchedStaff.status}
              </span>
            </div>
          )}
        </div>

        {/* 3. Footer Actions */}
        <div className='pt-3 border-t border-border/40 flex items-center justify-end gap-3'>
          <Button
            type='button'
            variant='outline'
            shape='pill'
            size='default'
            onClick={onClose}
            className='px-6 font-medium text-xs sm:text-sm'
          >
            Batal
          </Button>
          <Button
            type='submit'
            variant='default'
            shape='pill'
            size='default'
            disabled={mutation.isPending || !staffId.trim()}
            className='px-7 font-semibold text-xs sm:text-sm'
          >
            {mutation.isPending ? (
              <Icons.spinner className='mr-1.5 size-3.5 animate-spin' />
            ) : (
              <Icons.check className='mr-1.5 size-3.5' />
            )}
            Proses Presensi
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
