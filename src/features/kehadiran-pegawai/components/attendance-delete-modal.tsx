'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import { useDeleteAttendanceMutation } from '../api/mutations';
import type { StaffAttendance } from '../api/types';

export interface AttendanceDeleteModalProps {
  attendance: StaffAttendance | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AttendanceDeleteModal({ attendance, isOpen, onClose }: AttendanceDeleteModalProps) {
  const deleteMutation = useDeleteAttendanceMutation();

  if (!attendance) return null;

  const initials = attendance.nama_staf
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleConfirmDelete = () => {
    deleteMutation.mutate(attendance.id, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[460px]'
      showCloseButton={false}
    >
      <div className='relative font-sans space-y-4'>
        {/* Header with Danger Icon */}
        <div className='flex items-start gap-3.5 pb-3 border-b border-border/40'>
          <div className='size-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0 ring-4 ring-destructive/5'>
            <Icons.trash className='size-5' />
          </div>
          <div className='space-y-1 min-w-0 flex-1'>
            <h3 className='text-base font-bold text-foreground tracking-tight'>
              Hapus Data Presensi Pegawai
            </h3>
            <p className='text-xs text-muted-foreground'>
              Tindakan ini akan menghapus riwayat kehadiran staf terpilih secara permanen.
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='Tutup'
            className='rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors cursor-pointer shrink-0'
          >
            <Icons.close className='size-4' />
          </button>
        </div>

        {/* Staff Target Information Box */}
        <div className='p-3.5 rounded-xl border border-border/60 bg-muted/20 flex items-center gap-3 select-none'>
          <Avatar className='size-11 rounded-full border border-border/40 shrink-0'>
            {attendance.avatar && (
              <AvatarImage src={attendance.avatar} alt={attendance.nama_staf} />
            )}
            <AvatarFallback className='bg-primary/10 text-primary font-bold text-xs'>
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className='flex flex-col min-w-0 flex-1 space-y-0.5'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-bold text-foreground truncate'>
                {attendance.nama_staf}
              </span>
              <span className='inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-muted text-muted-foreground border border-border/50 shrink-0'>
                {attendance.kategori}
              </span>
            </div>
            <p className='text-xs text-muted-foreground font-mono'>
              ID: {attendance.id_staf} • Shift: {attendance.shift} ({attendance.waktu})
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='pt-2 flex items-center justify-end gap-2.5'>
          <Button
            type='button'
            variant='outline'
            shape='pill'
            size='sm'
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className='px-4 font-medium text-xs'
          >
            Batal
          </Button>

          <Button
            type='button'
            variant='destructive'
            shape='pill'
            size='sm'
            onClick={handleConfirmDelete}
            disabled={deleteMutation.isPending}
            className='px-5 font-semibold text-xs gap-1.5'
          >
            {deleteMutation.isPending ? (
              <Icons.spinner className='size-3.5 animate-spin' />
            ) : (
              <Icons.trash className='size-3.5' />
            )}
            <span>Hapus Presensi</span>
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
