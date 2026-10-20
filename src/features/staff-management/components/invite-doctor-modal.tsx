'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  type PolyclinicUnit,
  type PractitionerRoleOption,
  staffManagementApi
} from '../api/staff-management.api';

interface InviteDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteDoctorModal({ isOpen, onClose, onSuccess }: InviteDoctorModalProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingOptions, setFetchingOptions] = useState(false);
  const [practitionerRoles, setPractitionerRoles] = useState<PractitionerRoleOption[]>([]);
  const [polyclinics, setPolyclinics] = useState<PolyclinicUnit[]>([]);

  // Form states: email, roleCode, and poliklinikId
  const [email, setEmail] = useState('');
  const [roleCode, setRoleCode] = useState('staff_doctor');
  const [poliklinikId, setPoliklinikId] = useState('');

  // Result dialog state for showing generated temporary password
  const [credentialResult, setCredentialResult] = useState<{
    temporaryPassword: string;
    email: string;
    roleTitle: string;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) setFetchingOptions(true);
    });

    staffManagementApi
      .getInvitationOptions()
      .then((res) => {
        if (cancelled) return;
        const roles = res.practitionerRoles || [];
        const polis = res.polyclinics || [];
        setPractitionerRoles(roles);
        setPolyclinics(polis);

        const initialRole = roles.length > 0 ? roles[0].code : 'staff_doctor';
        setRoleCode((prev) => prev || initialRole);

        if (polis.length > 0) {
          setPoliklinikId((prev) => {
            if (prev) return prev;
            // Smart default: if doctor, pick poli_umum; if midwife, pick poli_kia
            const defaultPoli =
              initialRole === 'staff_midwife'
                ? polis.find((p) => p.code?.toLowerCase().includes('kia')) || polis[0]
                : polis.find((p) => p.code?.toLowerCase().includes('umum')) || polis[0];
            return defaultPoli.id;
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Gagal memuat opsi form praktisi medis dari server.');
        }
      })
      .finally(() => {
        if (!cancelled) setFetchingOptions(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const handleRoleChange = (selectedRole: string) => {
    setRoleCode(selectedRole);
    // Intelligent auto-suggest poliklinik matching clinical role
    if (selectedRole === 'staff_midwife') {
      const kiaPoli = polyclinics.find(
        (p) =>
          p.code?.toLowerCase().includes('kia') ||
          p.namaPoli?.toLowerCase().includes('kia') ||
          p.name?.toLowerCase().includes('kia')
      );
      if (kiaPoli) {
        setPoliklinikId(kiaPoli.id);
      }
    } else if (selectedRole === 'staff_doctor') {
      const umumPoli = polyclinics.find(
        (p) =>
          p.code?.toLowerCase().includes('umum') ||
          p.namaPoli?.toLowerCase().includes('umum') ||
          p.name?.toLowerCase().includes('umum')
      );
      if (umumPoli) {
        setPoliklinikId(umumPoli.id);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !poliklinikId) {
      toast.error('Harap masukkan alamat email dan pilih poliklinik penugasan.');
      return;
    }

    try {
      setLoading(true);
      const res = await staffManagementApi.inviteDoctor({
        email: email.trim().toLowerCase(),
        poliklinikId,
        roleCode
      });

      const roleObj = practitionerRoles.find((r) => r.code === roleCode);
      const roleTitle = roleObj?.name || (roleCode === 'staff_midwife' ? 'Bidan' : 'Dokter');

      toast.success(
        `Undangan ${roleTitle} berhasil dikirim ke ${email}! Kredensial login telah dibuat.`
      );
      setCredentialResult({
        email,
        temporaryPassword: res.temporaryPassword,
        roleTitle
      });
      onSuccess?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirim undangan praktisi medis.';
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
            Undang Praktisi Medis (Dokter / Bidan)
          </DialogTitle>
          <DialogDescription>
            Masukkan email praktisi medis poliklinik. Praktisi akan otomatis terdaftar pada sistem
            jadwal harian, roster, dan antrean layanan pasien.
          </DialogDescription>
        </DialogHeader>

        {credentialResult ? (
          <div className='space-y-4 py-4'>
            <div className='rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-200'>
              <h4 className='font-semibold text-base mb-1'>
                Undangan {credentialResult.roleTitle} Berhasil Dibuat
              </h4>
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
              <Label htmlFor='practitionerEmail'>
                Alamat Email Praktisi <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='practitionerEmail'
                type='email'
                placeholder='praktisi@amanah.clinic'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='roleCode'>
                Peran Praktisi Medis <span className='text-destructive'>*</span>
              </Label>
              <Select value={roleCode} onValueChange={handleRoleChange} disabled={fetchingOptions}>
                <SelectTrigger id='roleCode'>
                  <SelectValue placeholder='Pilih Peran Praktisi...' />
                </SelectTrigger>
                <SelectContent>
                  {practitionerRoles.map((role) => (
                    <SelectItem key={role.code} value={role.code}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='poliklinikId'>
                Poliklinik Penugasan <span className='text-destructive'>*</span>
              </Label>
              <Select
                value={poliklinikId}
                onValueChange={setPoliklinikId}
                disabled={fetchingOptions}
              >
                <SelectTrigger id='poliklinikId'>
                  <SelectValue placeholder='Pilih Poliklinik...' />
                </SelectTrigger>
                <SelectContent>
                  {polyclinics.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name || p.namaPoli}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className='pt-2'>
              <Button type='button' variant='outline' onClick={handleFinish}>
                Batal
              </Button>
              <Button type='submit' disabled={loading || fetchingOptions}>
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
