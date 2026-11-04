'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { DeletingState } from '../../hooks/useClinicEssentialsMutations';

export interface ClinicEssentialsDeleteDialogsProps {
  deletingItem: DeletingState | null;
  onCloseSingleDelete: () => void;
  onConfirmSingleDelete: () => void;
  isSingleDeletePending: boolean;
  isBulkDeleteOpen: boolean;
  onCloseBulkDelete: () => void;
  onConfirmBulkDelete: () => void;
  isBulkDeletePending: boolean;
  selectedCount: number;
}

export function ClinicEssentialsDeleteDialogs({
  deletingItem,
  onCloseSingleDelete,
  onConfirmSingleDelete,
  isSingleDeletePending,
  isBulkDeleteOpen,
  onCloseBulkDelete,
  onConfirmBulkDelete,
  isBulkDeletePending,
  selectedCount,
}: ClinicEssentialsDeleteDialogsProps) {
  return (
    <>
      {/* Single Item Deletion Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(deletingItem)}
        onOpenChange={(open) => !open && onCloseSingleDelete()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Permanen {deletingItem?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus data tersebut secara fisik dan permanen dari basis data
              klinik. Data yang sudah dihapus tidak dapat dipulihkan kembali.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSingleDeletePending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmSingleDelete}
              disabled={isSingleDeletePending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isSingleDeletePending ? 'Menghapus...' : 'Ya, Hapus Permanen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={isBulkDeleteOpen}
        onOpenChange={(open) => !open && onCloseBulkDelete()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Permanen {selectedCount} Data Terpilih?</AlertDialogTitle>
            <AlertDialogDescription>
              Semua item yang dipilih akan dihapus secara fisik dan permanen dari basis data klinik
              jika tidak memiliki data relasi aktif. Data yang terhapus tidak dapat dipulihkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkDeletePending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmBulkDelete}
              disabled={isBulkDeletePending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isBulkDeletePending ? 'Menghapus...' : 'Ya, Hapus Permanen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
