'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { staffManagementApi } from '../api/staff-management.api';

interface InviteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteStaffModal({ isOpen, onClose, onSuccess }: InviteStaffModalProps) {
  const [loading, setLoading] = useState(false);

  // Form states: only email
  const [email, setEmail] = useState('');

  const [credentialResult, setCredentialResult] = useState<{
    temporaryPassword: string;
    email: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Harap masukkan alamat email staf.');
      return;
    }

    try {
      setLoading(true);
      const res = await staffManagementApi.inviteStaff({
        email: email.trim().toLowerCase()
      });

      toast.success(
        `Undangan staf berhasil dikirim ke ${email}! Kredensial sementara telah dikirim via email.`
      );
      setCredentialResult({
        email,
        temporaryPassword: res.temporaryPassword
      });
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirim undangan staf.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    setCredentialResult(null);
    setEmail('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleFinish()}>
      <DialogContent className='max-w-md max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-xl'>
            <Icons.userPlus className='h-5 w-5 text-primary' />
            Undang Staf Operasional
          </DialogTitle>
          <DialogDescription>
            Masukkan email staf operasional klinik. Kredensial login sementara akan dibuat otomatis
            dan dikirimkan via email. Staf dapat mengisi profil lengkap secara mandiri.
          </DialogDescription>
        </DialogHeader>

        {credentialResult ? (
          <div className='space-y-4 py-4'>
            <div className='rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-200'>
              <h4 className='font-semibold text-base mb-1'>Undangan Staf Berhasil Terkirim</h4>
              <p className='text-sm mb-3'>
                Kredensial akun telah dikirimkan ke <strong>{credentialResult.email}</strong> via
                Mailpit / SMTP server.
              </p>
              <div className='rounded bg-background/80 p-3 border border-border space-y-1 font-mono text-sm'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Email:</span>
                  <span className='font-semibold'>{credentialResult.email}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Password Sementara:</span>
                  <span className='font-bold text-primary select-all'>
                    {credentialResult.temporaryPassword}
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleFinish}>Tutup</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <Label htmlFor='staffEmail'>
                Alamat Email Staf <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='staffEmail'
                type='email'
                placeholder='staf@amanah.clinic'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <DialogFooter className='pt-2'>
              <Button type='button' variant='outline' onClick={handleFinish}>
                Batal
              </Button>
              <Button type='submit' disabled={loading}>
                {loading && <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />}
                Kirim Undangan
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
