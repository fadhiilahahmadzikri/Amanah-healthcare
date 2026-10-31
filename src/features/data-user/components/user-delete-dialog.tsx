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
      <AlertDialogContent className='max-w-md rounded-2xl border border-border shadow-2xl'>
        <AlertDialogHeader className='text-left pb-3 border-b border-border/40'>
          <AlertDialogTitle className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
            {isBulk
              ? `Hapus Permanen ${userIds?.length} Pengguna?`
              : `Hapus Permanen Pengguna "${user?.name}"?`}
          </AlertDialogTitle>
          <AlertDialogDescription className='space-y-2 pt-2 text-xs leading-relaxed text-muted-foreground'>
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
        <AlertDialogFooter className='shrink-0 pt-3.5 border-t border-border/40 flex flex-row items-center justify-end gap-2.5'>
          <AlertDialogCancel
            disabled={isPending}
            onClick={onClose}
            className='rounded-full h-10 px-6 text-[13px] font-semibold cursor-pointer border border-input bg-background hover:bg-accent'
          >
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={handleConfirm}
            className='rounded-full h-10 px-6 text-[13px] bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer font-bold gap-1.5 shadow-2xs'
          >
            {isPending ? (
              <>
                <Icons.spinner className='size-3.5 animate-spin' />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <Icons.trash className='size-3.5' />
                <span>Ya, Hapus Permanen</span>
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
