'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deletePatientMutation, bulkDeletePatientsMutation } from '../api/mutations';
import type { Patient } from '../api/types';

export interface PatientDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient | null;
  patientIds?: string[];
  onSuccess?: () => void;
}

export function PatientDeleteDialog({
  isOpen,
  onClose,
  patient,
  patientIds,
  onSuccess,
}: PatientDeleteDialogProps) {
  const isBulk = Boolean(patientIds && patientIds.length > 0 && !patient);
  const count = patientIds?.length ?? 0;

  const singleDelete = useMutation({
    ...deletePatientMutation,
    onSuccess: () => {
      toast.success('Data pasien berhasil dinonaktifkan');
      onSuccess?.();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Gagal menonaktifkan data pasien');
    },
  });

  const bulkDelete = useMutation({
    ...bulkDeletePatientsMutation,
    onSuccess: (data) => {
      toast.success(data?.message || `${count} pasien berhasil dinonaktifkan`);
      onSuccess?.();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Gagal menonaktifkan data pasien terpilih');
    },
  });

  const isPending = singleDelete.isPending || bulkDelete.isPending;

  const handleConfirm = async () => {
    if (isBulk && patientIds && patientIds.length > 0) {
      await bulkDelete.mutateAsync(patientIds);
    } else if (patient?.id) {
      await singleDelete.mutateAsync(patient.id);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !isPending && !open && onClose()}>
      <AlertDialogContent className='sm:max-w-[480px] p-6 border-destructive/30 shadow-2xl font-sans'>
        <AlertDialogHeader className='space-y-3 text-left'>
          <div className='flex items-center gap-3'>
            <div className='size-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0'>
              <Icons.warning className='size-5' />
            </div>
            <div>
              <AlertDialogTitle className='text-lg font-bold text-destructive'>
                {isBulk
                  ? `Nonaktifkan ${count} Pasien Terpilih`
                  : 'Nonaktifkan Data Pasien'}
              </AlertDialogTitle>
              <p className='text-xs text-muted-foreground'>
                Status pasien akan diubah menjadi nonaktif dari operasional
              </p>
            </div>
          </div>

          <AlertDialogDescription className='text-sm text-foreground/90 leading-relaxed pt-1'>
            {isBulk ? (
              <span>
                Anda akan menonaktifkan <strong className='text-foreground'>{count} data pasien</strong> secara massal.
              </span>
            ) : (
              <span>
                Anda akan menonaktifkan rekam data pasien{' '}
                <strong className='text-foreground'>{patient?.name}</strong>{' '}
                <span className='font-mono text-xs text-muted-foreground'>
                  ({patient?.patient_id || 'Tanpa No. RM'})
                </span>.
              </span>
            )}
          </AlertDialogDescription>

          <div className='rounded-lg bg-destructive/5 border border-destructive/15 p-3 space-y-1.5 text-xs text-foreground/80'>
            <div className='flex items-start gap-2'>
              <Icons.check className='size-3.5 text-destructive shrink-0 mt-0.5' />
              <span>Status akun pasien diubah menjadi Nonaktif di sistem klinik.</span>
            </div>
            <div className='flex items-start gap-2'>
              <Icons.check className='size-3.5 text-destructive shrink-0 mt-0.5' />
              <span>Seluruh riwayat janji temu dan data rekam medis tetap tersimpan secara aman.</span>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className='gap-2 sm:gap-0 pt-3'>
          <Button
            type='button'
            variant='outline'
            shape='pill'
            onClick={onClose}
            disabled={isPending}
            className='cursor-pointer font-medium'
          >
            Batal
          </Button>
          <Button
            type='button'
            variant='destructive'
            shape='pill'
            onClick={handleConfirm}
            disabled={isPending}
            className='cursor-pointer gap-2 font-semibold'
          >
            {isPending ? (
              <>
                <Icons.spinner className='size-4 animate-spin' />
                <span>Menonaktifkan...</span>
              </>
            ) : (
              <>
                <Icons.trash className='size-4' />
                <span>{isBulk ? `Nonaktifkan (${count})` : 'Ya, Nonaktifkan'}</span>
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
