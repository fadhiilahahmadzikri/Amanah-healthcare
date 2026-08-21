'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import { useDeleteAttendanceMutation } from '../api/mutations';
import type { StaffAttendance } from '../api/types';

export interface AttendanceDeleteModalProps {
  attendance?: StaffAttendance | null;
  attendances?: StaffAttendance[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AttendanceDeleteModal({
  attendance,
  attendances,
  isOpen,
  onClose,
  onSuccess
}: AttendanceDeleteModalProps) {
  const deleteMutation = useDeleteAttendanceMutation();

  const targetList =
    attendances && attendances.length > 0 ? attendances : attendance ? [attendance] : [];

  if (targetList.length === 0) return null;

  const isBulk = targetList.length > 1;
  const single = targetList[0];

  const initials = single.nama_staf
    .replace('dr. ', '')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleConfirmDelete = () => {
    if (isBulk) {
      // Execute deletion for all targets
      targetList.forEach((item) => {
        deleteMutation.mutate(item.id);
      });
      onClose();
      onSuccess?.();
    } else {
      deleteMutation.mutate(single.id, {
        onSuccess: () => {
          onClose();
          onSuccess?.();
        }
      });
    }
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
              {isBulk
                ? `Hapus ${targetList.length} Data Presensi Pegawai`
                : 'Hapus Data Presensi Pegawai'}
            </h3>
            <p className='text-xs text-muted-foreground'>
              {isBulk
                ? `Tindakan ini akan menghapus ${targetList.length} riwayat kehadiran staf terpilih secara permanen.`
                : 'Tindakan ini akan menghapus riwayat kehadiran staf terpilih secara permanen.'}
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
        {isBulk ? (
          <div className='p-3 rounded-xl border border-border/60 bg-muted/20 space-y-2 max-h-48 overflow-y-auto select-none'>
            <p className='text-xs font-semibold text-foreground'>Daftar staf yang akan dihapus:</p>
            <div className='space-y-1.5'>
              {targetList.map((item) => (
                <div
                  key={item.id}
                  className='flex items-center justify-between text-xs py-1 border-b border-border/30 last:border-0'
                >
                  <span className='font-medium text-foreground truncate max-w-[240px]'>
                    {item.nama_staf}
                  </span>
                  <span className='text-muted-foreground font-mono text-[11px]'>
                    {item.id_staf} • {item.shift}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className='p-3.5 rounded-xl border border-border/60 bg-muted/20 flex items-center gap-3 select-none'>
            <Avatar className='size-11 rounded-full border border-border/40 shrink-0'>
              {single.avatar && <AvatarImage src={single.avatar} alt={single.nama_staf} />}
              <AvatarFallback className='bg-primary/10 text-primary font-bold text-xs'>
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className='flex flex-col min-w-0 flex-1 space-y-0.5'>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-bold text-foreground truncate'>
                  {single.nama_staf}
                </span>
                <span className='inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-muted text-muted-foreground border border-border/50 shrink-0'>
                  {single.kategori}
                </span>
              </div>
              <p className='text-xs text-muted-foreground font-mono'>
                ID: {single.id_staf} • Shift: {single.shift} ({single.waktu})
              </p>
            </div>
          </div>
        )}

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
            <span>{isBulk ? `Hapus ${targetList.length} Presensi` : 'Hapus Presensi'}</span>
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
