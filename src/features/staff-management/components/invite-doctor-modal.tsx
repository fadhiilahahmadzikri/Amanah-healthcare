'use client';

import { useEffect, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { PolyclinicUnit, staffManagementApi } from '../api/staff-management.api';

interface InviteDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteDoctorModal({ isOpen, onClose, onSuccess }: InviteDoctorModalProps) {
  const [loading, setLoading] = useState(false);
  const [polyclinics, setPolyclinics] = useState<PolyclinicUnit[]>([]);
  const [fetchingPolis, setFetchingPolis] = useState(false);

  // Form states: only email and poliklinikId
  const [email, setEmail] = useState('');
  const [poliklinikId, setPoliklinikId] = useState('');

  // Result dialog state for showing generated temporary password
  const [credentialResult, setCredentialResult] = useState<{
    temporaryPassword: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) setFetchingPolis(true);
    });

    staffManagementApi
      .getPolyclinics()
      .then((res) => {
        if (cancelled) return;
        setPolyclinics(res);
        setPoliklinikId((prev) => prev || (res.length > 0 ? res[0].id : ''));
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Gagal memuat daftar poliklinik dari server.');
        }
      })
      .finally(() => {
        if (!cancelled) setFetchingPolis(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !poliklinikId) {
      toast.error('Harap masukkan alamat email dan pilih poliklinik.');
      return;
    }

    try {
      setLoading(true);
      const res = await staffManagementApi.inviteDoctor({
        email: email.trim().toLowerCase(),
        poliklinikId
      });

      toast.success(`Undangan berhasil dikirim ke ${email}! Kredensial login telah dibuat.`);
      setCredentialResult({
        email,
        temporaryPassword: res.temporaryPassword
      });
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirim undangan dokter.';
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
            Undang Dokter Baru
          </DialogTitle>
          <DialogDescription>
            Masukkan email dokter dan pilih poliklinik tujuan. Kredensial sementara akan dibuat
            otomatis dan dokter dapat melengkapi data profil secara mandiri.
          </DialogDescription>
        </DialogHeader>

        {credentialResult ? (
          <div className='space-y-4 py-4'>
            <div className='rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-200'>
              <h4 className='font-semibold text-base mb-1'>Undangan Dokter Berhasil Dibuat</h4>
              <p className='text-sm mb-3'>
                Email undangan dengan tautan login telah dikirimkan ke{' '}
                <strong>{credentialResult.email}</strong> via Mailpit / SMTP server.
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
              <Label htmlFor='email'>
                Alamat Email Dokter <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='email'
                type='email'
                placeholder='dokter@amanah.clinic'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='poliklinikId'>
                Poliklinik Penugasan <span className='text-destructive'>*</span>
              </Label>
              <Select value={poliklinikId} onValueChange={setPoliklinikId} disabled={fetchingPolis}>
                <SelectTrigger id='poliklinikId'>
                  <SelectValue placeholder='Pilih Poliklinik...' />
                </SelectTrigger>
                <SelectContent>
                  {polyclinics.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.namaPoli || p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className='pt-2'>
              <Button type='button' variant='outline' onClick={handleFinish}>
                Batal
              </Button>
              <Button type='submit' disabled={loading || fetchingPolis}>
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
