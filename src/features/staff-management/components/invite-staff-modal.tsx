'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInviteStaffModal } from '../model/useInviteStaffModal';

export interface InviteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteStaffModal(props: InviteStaffModalProps) {
  const { isOpen } = props;
  const invite = useInviteStaffModal(props);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && invite.handleFinish()}>
      <DialogContent className='max-w-md max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-xl'>
            <Icons.userPlus className='h-5 w-5 text-primary' />
            Undang Staf Operasional
          </DialogTitle>
          <DialogDescription>
            Masukkan email staf operasional klinik (Front Desk, IT, Administrasi, Kasir). Kredensial
            login sementara akan dibuat otomatis dan dikirimkan via email.
          </DialogDescription>
        </DialogHeader>

        {invite.credentialResult ? (
          <div className='space-y-4 py-4'>
            <div className='rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-200'>
              <h4 className='font-semibold text-base mb-1'>Undangan Staf Berhasil Terkirim</h4>
              <p className='text-sm mb-3'>
                Kredensial akun telah dikirimkan ke <strong>{invite.credentialResult.email}</strong>{' '}
                via Mailpit / SMTP server.
              </p>
              <div className='rounded bg-background/80 p-3 border border-border space-y-1 font-mono text-sm'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Email:</span>
                  <span className='font-semibold'>{invite.credentialResult.email}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Password Sementara:</span>
                  <span className='font-bold text-primary select-all'>
                    {invite.credentialResult.temporaryPassword}
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={invite.handleFinish}>Tutup</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={invite.handleSubmit} className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <Label htmlFor='staffEmail'>
                Alamat Email Staf Operasional <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='staffEmail'
                type='email'
                placeholder='staf.operasional@amanah.clinic'
                value={invite.email}
                onChange={(e) => invite.setEmail(e.target.value)}
                required
              />
            </div>

            <DialogFooter className='pt-2'>
              <Button type='button' variant='outline' onClick={invite.handleFinish}>
                Batal
              </Button>
              <Button type='submit' disabled={invite.isLoading}>
                {invite.isLoading && <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />}
                Kirim Undangan
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
