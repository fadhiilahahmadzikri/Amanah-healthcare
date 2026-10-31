'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Icons } from '@/components/icons';
import type { UserItem } from '../api/types';
import { useBulkPurgeUsersMutation, usePurgeUserMutation } from '../api/mutations';

export interface UserDeleteDialogProps {
  user?: UserItem | null;
  userIds?: string[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UserDeleteDialog({
  user,
  userIds,
  isOpen,
  onClose,
  onSuccess
}: UserDeleteDialogProps) {
  const isBulk = Boolean(userIds && userIds.length > 0);
  const purgeSingleMutation = usePurgeUserMutation();
  const purgeBulkMutation = useBulkPurgeUsersMutation();

  const isPending = purgeSingleMutation.isPending || purgeBulkMutation.isPending;

  const handleConfirm = () => {
    if (isBulk && userIds) {
      purgeBulkMutation.mutate(userIds, {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        }
      });
    } else if (user) {
      purgeSingleMutation.mutate(user.id, {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        }
      });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className='max-w-md'>
        <AlertDialogHeader>
          <div className='flex items-center gap-2 text-destructive'>
            <Icons.warning className='size-5 text-destructive' />
            <AlertDialogTitle className='text-base font-semibold'>
              {isBulk
                ? `Hapus Permanen ${userIds?.length} Pengguna?`
                : `Hapus Permanen Pengguna "${user?.name}"?`}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className='space-y-2 pt-2 text-xs leading-relaxed'>
            {isBulk ? (
              <p>
                Anda akan menghapus secara permanen <strong>{userIds?.length} akun pengguna</strong>{' '}
                beserta seluruh sesi, kredensial, dan rekam identitas terkait secara sistemik.
              </p>
            ) : (
              <p>
                Anda akan menghapus permanen akun <strong>{user?.name}</strong> (
                <span className='font-mono'>{user?.email}</span>).
              </p>
            )}
            <p className='text-amber-600 dark:text-amber-400 font-medium'>
              Tindakan ini tidak dapat dibatalkan melalui antarmuka sistem.
            </p>
            <p className='text-muted-foreground'>
              Sistem akan memverifikasi integritas audit dan mencegah penghapusan akun Anda sendiri
              atau administrator aktif terakhir.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending} onClick={onClose}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={handleConfirm}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer font-semibold gap-1.5'
          >
            {isPending ? (
              <>
                <Icons.spinner className='size-4 animate-spin' />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <Icons.trash className='size-4' />
                <span>Ya, Hapus Permanen</span>
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
