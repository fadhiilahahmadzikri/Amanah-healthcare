'use client';

import React, { useEffect, useRef, useState } from 'react';
import { isUUID } from 'class-validator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Icons } from '@/components/icons';
import { useRecordManualAttendanceMutation } from '../api/mutations';
import { toast } from 'sonner';

export interface ManualAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatStaffCode(value: string): string {
  // If user pastes a valid full UUID, preserve it
  if (isUUID(value.trim())) {
    return value.trim();
  }

  const raw = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (raw.length <= 3) {
    return raw;
  }
  if (raw.length <= 6) {
    return `${raw.slice(0, 3)}-${raw.slice(3)}`;
  }
  return `${raw.slice(0, 3)}-${raw.slice(3, 6)}-${raw.slice(6, 10)}`;
}

export function ManualAttendanceModal({ isOpen, onClose }: ManualAttendanceModalProps) {
  const mutation = useRecordManualAttendanceMutation();
  const [staffId, setStaffId] = useState('');
  const staffIdInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      staffIdInputRef.current?.focus();
    }
  }, [isOpen]);

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

        {/* 2. Input ID Staf */}
        <div className='space-y-3 py-0.5'>
          <div className='relative'>
            <Icons.user className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none' />
            <Input
              ref={staffIdInputRef}
              value={staffId}
              onChange={(e) => setStaffId(formatStaffCode(e.target.value))}
              placeholder='Contoh: STF-DOK-001...'
              className='pl-9 h-10 text-xs font-mono font-semibold tracking-wider'
            />
          </div>
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
