'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { accountSecurityApi, type LinkedProvidersResponse } from '../api/account-security.api';

export function AccountSecuritySettings() {
  const [data, setData] = React.useState<LinkedProvidersResponse | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Modal Ubah Kata Sandi
  const [passwordDialogOpen, setPasswordDialogOpen] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [submittingPassword, setSubmittingPassword] = React.useState(false);

  // Modal Ganti Email
  const [emailDialogOpen, setEmailDialogOpen] = React.useState(false);
  const [newEmail, setNewEmail] = React.useState('');
  const [emailPasswordConfirm, setEmailPasswordConfirm] = React.useState('');
  const [submittingEmail, setSubmittingEmail] = React.useState(false);

  // Tindakan Unlink / Pemutusan
  const [actionLoading, setActionLoading] = React.useState(false);

  const fetchProviders = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await accountSecurityApi.getLinkedProviders();
      setData(res);
    } catch (err) {
      toast.error('Gagal memuat status keamanan akun', {
        description: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Kata sandi baru minimal 6 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Ulangi kata sandi tidak cocok dengan kata sandi baru');
      return;
    }

    try {
      setSubmittingPassword(true);
      const res = await accountSecurityApi.changePassword({
        currentPassword,
        newPassword
      });
      toast.success('Kata sandi berhasil diperbarui', {
        description: res.message || 'Silakan gunakan kata sandi baru Anda saat masuk berikutnya.'
      });
      setPasswordDialogOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      await fetchProviders();
    } catch (err) {
      toast.error('Gagal memperbarui kata sandi', {
        description: err instanceof Error ? err.message : 'Periksa kembali kata sandi saat ini'
      });
    } finally {
      setSubmittingPassword(false);
    }
  };

  const handleRequestEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Silakan masukkan format alamat email yang valid');
      return;
    }

    try {
      setSubmittingEmail(true);
      const res = await accountSecurityApi.requestEmailChange({
        newEmail,
        currentPassword: emailPasswordConfirm || undefined
      });
      toast.success('Permintaan perubahan email berhasil diajukan', {
        description: res.message
      });
      setEmailDialogOpen(false);
      setNewEmail('');
      setEmailPasswordConfirm('');
    } catch (err) {
      toast.error('Gagal mengajukan perubahan email', {
        description: err instanceof Error ? err.message : 'Alamat email mungkin sudah terdaftar'
      });
    } finally {
      setSubmittingEmail(false);
    }
  };

  const handleUnlinkCredential = async () => {
    if (!data?.hasGoogle) {
      toast.error('Tidak dapat mematikan kata sandi', {
        description: 'Hubungkan akun Google Anda terlebih dahulu agar akun tidak terkunci.'
      });
      return;
    }

    const confirmAction = window.confirm(
      'Apakah Anda yakin ingin mematikan login dengan kata sandi? Setelah ini Anda hanya dapat masuk menggunakan tombol Google.'
    );
    if (!confirmAction) return;

    try {
      setActionLoading(true);
      const res = await accountSecurityApi.unlinkCredential();
      setData(res);
      toast.success('Login kata sandi dinonaktifkan', {
        description: 'Anda kini masuk sepenuhnya menggunakan Akun Google.'
      });
    } catch (err) {
      toast.error('Gagal mematikan kata sandi', {
        description: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnlinkGoogle = async () => {
    if (!data?.hasPassword) {
      toast.error('Tidak dapat melepas Akun Google', {
        description: 'Buat kata sandi akun terlebih dahulu agar Anda tetap bisa masuk.'
      });
      return;
    }

    const confirmAction = window.confirm(
      'Apakah Anda yakin ingin memutuskan Akun Google dari akun ini?'
    );
    if (!confirmAction) return;

    try {
      setActionLoading(true);
      const res = await accountSecurityApi.unlinkGoogle();
      setData(res);
      toast.success('Tautan Akun Google telah dilepas', {
        description: 'Anda kini masuk menggunakan email dan kata sandi.'
      });
    } catch (err) {
      toast.error('Gagal melepas akun Google', {
        description: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className='shadow-xs'>
        <CardContent className='p-6 flex items-center justify-center py-12 text-muted-foreground'>
          <Icons.spinner className='size-5 animate-spin mr-2' />
          <span>Memuat informasi keamanan akun...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='shadow-xs overflow-hidden'>
      <CardHeader className='pb-4 border-b bg-muted/20'>
        <div className='flex items-center gap-2.5 text-foreground'>
          <Icons.lock className='size-5 text-primary' />
          <CardTitle className='text-base sm:text-lg font-bold'>
            Keamanan Akun & Cara Masuk
          </CardTitle>
        </div>
        <CardDescription className='text-xs sm:text-sm text-muted-foreground pt-1'>
          Kelola alamat email, kata sandi, dan sambungan akun Google Anda untuk kemudahan masuk ke
          sistem.
        </CardDescription>
      </CardHeader>
      <CardContent className='p-6 space-y-6 divide-y divide-border/60'>
        {/* Seksi 1: Alamat Email Utama */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 first:pt-0'>
          <div className='space-y-1 max-w-xl'>
            <div className='flex items-center gap-2'>
              <h3 className='text-sm font-semibold text-foreground'>Alamat Email Utama</h3>
              <Badge variant='outline' className='text-xs font-normal text-muted-foreground'>
                Email Aktif
              </Badge>
            </div>
            <p className='text-sm text-foreground font-medium font-mono'>{data?.email || '-'}</p>
            <p className='text-xs text-muted-foreground leading-relaxed'>
              Digunakan untuk masuk ke sistem dan menerima surat pemberitahuan dari klinik.
            </p>
          </div>
          <div className='shrink-0'>
            <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
              <DialogTrigger asChild>
                <Button variant='outline' size='sm' className='cursor-pointer gap-2'>
                  <Icons.mail className='size-4' />
                  <span>Ganti Alamat Email</span>
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[440px]'>
                <form onSubmit={handleRequestEmailChange}>
                  <DialogHeader className='space-y-1.5'>
                    <DialogTitle className='text-base font-bold'>Ganti Alamat Email</DialogTitle>
                    <DialogDescription className='text-xs text-muted-foreground leading-relaxed'>
                      Tautan konfirmasi akan dikirimkan ke alamat email baru Anda. Email lama tetap
                      aktif hingga konfirmasi selesai.
                    </DialogDescription>
                  </DialogHeader>
                  <div className='space-y-4 py-4'>
                    <div className='space-y-1.5'>
                      <Label htmlFor='newEmail' className='text-xs font-medium'>
                        Alamat Email Baru
                      </Label>
                      <Input
                        id='newEmail'
                        type='email'
                        placeholder='nama.anda@gmail.com'
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        required
                        disabled={submittingEmail}
                      />
                    </div>
                    {data?.hasPassword && (
                      <div className='space-y-1.5'>
                        <Label htmlFor='confirmPass' className='text-xs font-medium'>
                          Kata Sandi Saat Ini (Untuk Konfirmasi)
                        </Label>
                        <Input
                          id='confirmPass'
                          type='password'
                          placeholder='Masukkan kata sandi akun Anda'
                          value={emailPasswordConfirm}
                          onChange={(e) => setEmailPasswordConfirm(e.target.value)}
                          required
                          disabled={submittingEmail}
                        />
                      </div>
                    )}
                  </div>
                  <DialogFooter className='gap-2 sm:gap-0'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => setEmailDialogOpen(false)}
                      disabled={submittingEmail}
                    >
                      Batal
                    </Button>
                    <Button type='submit' size='sm' disabled={submittingEmail} className='gap-2'>
                      {submittingEmail && <Icons.spinner className='size-4 animate-spin' />}
                      <span>Kirim Tautan Konfirmasi</span>
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Seksi 2: Kata Sandi */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6'>
          <div className='space-y-1 max-w-xl'>
            <div className='flex items-center gap-2'>
              <h3 className='text-sm font-semibold text-foreground'>Kata Sandi Akun</h3>
              {data?.hasPassword ? (
                <Badge variant='outline' className='text-xs text-emerald-600 border-emerald-300'>
                  Aktif
                </Badge>
              ) : (
                <Badge variant='outline' className='text-xs text-amber-600 border-amber-300'>
                  Dinonaktifkan
                </Badge>
              )}
            </div>
            <p className='text-xs text-muted-foreground leading-relaxed'>
              {data?.hasPassword
                ? 'Kata sandi rahasia yang digunakan untuk masuk ke akun Anda.'
                : 'Masuk dengan kata sandi dinonaktifkan. Anda saat ini menggunakan Akun Google.'}
            </p>
          </div>
          <div className='shrink-0 flex items-center gap-2'>
            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant='outline' size='sm' className='cursor-pointer gap-2'>
                  <Icons.lock className='size-4' />
                  <span>{data?.hasPassword ? 'Ubah Kata Sandi' : 'Pasang Kata Sandi Baru'}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[440px]'>
                <form onSubmit={handleChangePassword}>
                  <DialogHeader className='space-y-1.5'>
                    <DialogTitle className='text-base font-bold'>
                      {data?.hasPassword ? 'Ubah Kata Sandi' : 'Pasang Kata Sandi Baru'}
                    </DialogTitle>
                    <DialogDescription className='text-xs text-muted-foreground leading-relaxed'>
                      Demi keamanan, seluruh sesi login pada perangkat lain akan otomatis
                      dinonaktifkan setelah kata sandi diubah.
                    </DialogDescription>
                  </DialogHeader>
                  <div className='space-y-4 py-4'>
                    {data?.hasPassword && (
                      <div className='space-y-1.5'>
                        <Label htmlFor='currentPassword' className='text-xs font-medium'>
                          Kata Sandi Saat Ini
                        </Label>
                        <Input
                          id='currentPassword'
                          type='password'
                          placeholder='Masukkan kata sandi lama'
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                          disabled={submittingPassword}
                        />
                      </div>
                    )}
                    <div className='space-y-1.5'>
                      <Label htmlFor='newPassword' className='text-xs font-medium'>
                        Kata Sandi Baru
                      </Label>
                      <Input
                        id='newPassword'
                        type='password'
                        placeholder='Minimal 6 karakter'
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={submittingPassword}
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <Label htmlFor='confirmPassword' className='text-xs font-medium'>
                        Ulangi Kata Sandi Baru
                      </Label>
                      <Input
                        id='confirmPassword'
                        type='password'
                        placeholder='Ulangi kata sandi baru'
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={submittingPassword}
                      />
                    </div>
                  </div>
                  <DialogFooter className='gap-2 sm:gap-0'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => setPasswordDialogOpen(false)}
                      disabled={submittingPassword}
                    >
                      Batal
                    </Button>
                    <Button type='submit' size='sm' disabled={submittingPassword} className='gap-2'>
                      {submittingPassword && <Icons.spinner className='size-4 animate-spin' />}
                      <span>Simpan Kata Sandi</span>
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {data?.hasPassword && data?.hasGoogle && (
              <Button
                variant='ghost'
                size='sm'
                onClick={handleUnlinkCredential}
                disabled={actionLoading}
                className='text-xs text-muted-foreground hover:text-destructive cursor-pointer'
              >
                Matikan Login Sandi
              </Button>
            )}
          </div>
        </div>

        {/* Seksi 3: Akun Google */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6'>
          <div className='space-y-1 max-w-xl'>
            <div className='flex items-center gap-2'>
              <h3 className='text-sm font-semibold text-foreground'>Metode Masuk Google</h3>
              {data?.hasGoogle ? (
                <Badge className='text-xs bg-emerald-600 hover:bg-emerald-600'>Terhubung</Badge>
              ) : (
                <Badge variant='secondary' className='text-xs text-muted-foreground'>
                  Belum Terhubung
                </Badge>
              )}
            </div>
            <p className='text-xs text-muted-foreground leading-relaxed'>
              {data?.hasGoogle
                ? 'Akun Google Anda terhubung. Anda dapat masuk langsung menggunakan akun Google dengan sekali klik.'
                : 'Menghubungkan akun Google memungkinkan Anda masuk lebih praktis dan aman tanpa perlu mengetik kata sandi.'}
            </p>
          </div>
          <div className='shrink-0 flex items-center gap-2'>
            {data?.hasGoogle ? (
              <Button
                variant='outline'
                size='sm'
                onClick={handleUnlinkGoogle}
                disabled={actionLoading || !data?.hasPassword}
                className='text-xs text-destructive hover:bg-destructive/10 cursor-pointer'
              >
                Putuskan Akun Google
              </Button>
            ) : (
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  toast.info('Sambungan Akun Google', {
                    description:
                      'Silakan masuk melalui tombol Google pada halaman login untuk menautkan akun secara otomatis.'
                  });
                }}
                className='text-xs cursor-pointer gap-2'
              >
                <span>Tautkan Akun Google</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
