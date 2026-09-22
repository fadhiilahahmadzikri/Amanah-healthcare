'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { useDeleteAccount } from '../hooks/use-delete-account';

const CONFIRMATION_KEYWORD = 'HAPUS';

interface DeleteAccountDialogProps {
  userEmail?: string | null;
  trigger?: React.ReactNode;
}

export function DeleteAccountDialog({ userEmail, trigger }: DeleteAccountDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [confirmationInput, setConfirmationInput] = React.useState('');
  const { isDeleting, handleDeleteAccount } = useDeleteAccount();

  const isConfirmed = confirmationInput.trim().toUpperCase() === CONFIRMATION_KEYWORD;

  const handleOpenChange = (nextOpen: boolean) => {
    if (isDeleting) return; // Prevent closing while deleting
    setOpen(nextOpen);
    if (!nextOpen) {
      setConfirmationInput('');
    }
  };

  const onConfirmDelete = async () => {
    if (!isConfirmed || isDeleting) return;
    await handleDeleteAccount();
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant='destructive' className='gap-2 shadow-xs cursor-pointer font-medium'>
            <Icons.trash className='size-4' />
            <span>Hapus Akun Permanen</span>
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className='sm:max-w-[480px] p-6 border-destructive/30 shadow-2xl'>
        <AlertDialogHeader className='space-y-3 text-left'>
          <div className='flex items-center gap-3'>
            <div className='size-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0'>
              <Icons.warning className='size-5' />
            </div>
            <div>
              <AlertDialogTitle className='text-lg font-bold text-destructive'>
                Hapus Akun Permanen (Purge)
              </AlertDialogTitle>
              <p className='text-xs text-muted-foreground'>
                Tindakan ini bersifat final dan tidak dapat dibatalkan
              </p>
            </div>
          </div>

          <AlertDialogDescription className='text-sm text-foreground/90 leading-relaxed pt-1'>
            Anda akan menghapus akun{' '}
            <strong className='text-foreground'>{userEmail || 'Anda'}</strong> secara permanen.
            Sesuai standar perlindungan privasi data (GDPR Right to Erasure), sistem kami akan
            menghapus seluruh data berikut secara menyeluruh (*hard-purge*):
          </AlertDialogDescription>

          <div className='rounded-lg bg-destructive/5 border border-destructive/15 p-3.5 space-y-2 text-xs text-foreground/80'>
            <div className='flex items-start gap-2'>
              <Icons.check className='size-3.5 text-destructive shrink-0 mt-0.5' />
              <span>Profil pengguna, kredensial masuk, dan akun sosial Google yang terhubung.</span>
            </div>
            <div className='flex items-start gap-2'>
              <Icons.check className='size-3.5 text-destructive shrink-0 mt-0.5' />
              <span>Profil pasien, nomor rekam medis resmi, dan seluruh riwayat pendaftaran.</span>
            </div>
            <div className='flex items-start gap-2'>
              <Icons.check className='size-3.5 text-destructive shrink-0 mt-0.5' />
              <span>Seluruh riwayat janji temu klinik, nomor antrean, dan catatan konsultasi.</span>
            </div>
            <div className='flex items-start gap-2'>
              <Icons.check className='size-3.5 text-destructive shrink-0 mt-0.5' />
              <span>Sesi login aktif di seluruh perangkat dan cache sistem.</span>
            </div>
          </div>

          <div className='space-y-2 pt-2'>
            <Label
              htmlFor='confirm-deletion-input'
              className='text-xs font-semibold text-foreground'
            >
              Ketik{' '}
              <span className='text-destructive font-mono font-bold'>{CONFIRMATION_KEYWORD}</span>{' '}
              untuk mengonfirmasi:
            </Label>
            <Input
              id='confirm-deletion-input'
              type='text'
              autoComplete='off'
              placeholder={`Ketik ${CONFIRMATION_KEYWORD}`}
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              disabled={isDeleting}
              className='font-mono uppercase tracking-wider text-sm border-destructive/40 focus-visible:ring-destructive'
            />
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className='gap-2 sm:gap-0 pt-3'>
          <Button
            type='button'
            variant='outline'
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
            className='cursor-pointer'
          >
            Batal
          </Button>
          <Button
            type='button'
            variant='destructive'
            onClick={onConfirmDelete}
            disabled={!isConfirmed || isDeleting}
            className='cursor-pointer gap-2'
          >
            {isDeleting ? (
              <>
                <Icons.spinner className='size-4 animate-spin' />
                <span>Menghapus Akun...</span>
              </>
            ) : (
              <>
                <Icons.trash className='size-4' />
                <span>Ya, Hapus Akun Saya</span>
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
