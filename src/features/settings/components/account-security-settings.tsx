'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
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
import { clientEnv } from '@/core/config/env.client';
import { accountSecurityApi, type LinkedProvidersResponse } from '../api/account-security.api';

export function AccountSecuritySettings() {
  const router = useRouter();
  const [data, setData] = React.useState<LinkedProvidersResponse | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Modal Ubah / Pasang Kata Sandi
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

  // Modal Konfirmasi Pemutusan Akun
  const [unlinkGoogleDialogOpen, setUnlinkGoogleDialogOpen] = React.useState(false);
  const [unlinkCredentialDialogOpen, setUnlinkCredentialDialogOpen] = React.useState(false);

  // Tindakan Unlink / Pemutusan / Tautkan
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

  // Listener pesan dari popup OAuth Google
  React.useEffect(() => {
    const handleOAuthMessage = async (event: MessageEvent) => {
      if (typeof window === 'undefined' || event.origin !== window.location.origin) return;

      if (event.data?.type === 'GOOGLE_AUTH_CODE') {
        const { code, state, redirectUri } = event.data;
        const expectedState = sessionStorage.getItem('google_link_oauth_state');
        sessionStorage.removeItem('google_link_oauth_state');

        if (expectedState && state !== expectedState) {
          toast.error('Keamanan Tautan Gagal', {
            description: 'State token otorisasi tidak cocok atau telah kedaluwarsa.'
          });
          setActionLoading(false);
          return;
        }

        try {
          setActionLoading(true);
          const res = await accountSecurityApi.linkGoogle({ code, redirectUri });
          setData(res);
          router.refresh();
          toast.success('Akun Google berhasil ditautkan', {
            description: 'Anda kini dapat masuk langsung menggunakan tombol Google.'
          });
        } catch (err) {
          toast.error('Gagal menautkan Akun Google', {
            description: err instanceof Error ? err.message : String(err)
          });
        } finally {
          setActionLoading(false);
        }
      } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
        sessionStorage.removeItem('google_link_oauth_state');
        setActionLoading(false);
        toast.error('Tautan Akun Google Dibatalkan', {
          description: event.data.error || 'Proses otorisasi Google tidak diselesaikan.'
        });
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [router]);

  const handleLinkGoogle = () => {
    if (typeof window === 'undefined') return;

    const clientId = data?.googleClientId || clientEnv.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      toast.error('Konfigurasi Google Client ID tidak ditemukan');
      return;
    }

    const state =
      'link_' +
      (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2));
    sessionStorage.setItem('google_link_oauth_state', state);

    const redirectUri = `${window.location.origin}/api/auth/callback/google`;
    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&state=${encodeURIComponent(state)}` +
      `&scope=${encodeURIComponent('openid email profile')}` +
      `&access_type=offline` +
      `&prompt=select_account`;

    const width = 520;
    const height = 640;
    const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2);
    const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2);

    const popup = window.open(
      authUrl,
      'google_oauth_link_popup',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,status=no`
    );

    if (!popup) {
      toast.error('Jendela Popup Diblokir', {
        description:
          'Mohon izinkan jendela pop-up di peramban Anda agar halaman otorisasi Google dapat dibuka.'
      });
      return;
    }

    setActionLoading(true);

    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        setActionLoading(false);
      }
    }, 600);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (data?.hasPassword && !currentPassword) {
      toast.error('Kata sandi saat ini wajib diisi');
      return;
    }
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
        currentPassword: data?.hasPassword ? currentPassword : '',
        newPassword
      });
      toast.success(
        data?.hasPassword ? 'Kata sandi berhasil diperbarui' : 'Kata sandi baru berhasil dipasang',
        {
          description: res.message || 'Silakan gunakan kata sandi baru Anda saat masuk berikutnya.'
        }
      );
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

  const executeUnlinkCredential = async () => {
    try {
      setActionLoading(true);
      const res = await accountSecurityApi.unlinkCredential();
      setData(res);
      setUnlinkCredentialDialogOpen(false);
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

  const executeUnlinkGoogle = async () => {
    try {
      setActionLoading(true);
      const res = await accountSecurityApi.unlinkGoogle();
      setData(res);
      router.refresh();
      setUnlinkGoogleDialogOpen(false);
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
        <CardTitle className='text-base sm:text-lg font-bold text-foreground'>
          Keamanan Akun & Cara Masuk
        </CardTitle>
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
                    {data?.hasPassword ? (
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
                    ) : (
                      <p className='text-xs text-muted-foreground italic bg-muted/40 p-2.5 rounded-md'>
                        Akun Anda saat ini masuk menggunakan Akun Google. Tautan konfirmasi aman
                        akan dikirim langsung ke alamat email baru.
                      </p>
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
                  Belum Dibuat
                </Badge>
              )}
            </div>
            <p className='text-xs text-muted-foreground leading-relaxed'>
              {data?.hasPassword
                ? 'Kata sandi rahasia yang digunakan untuk masuk ke akun Anda.'
                : 'Akun ini belum memiliki kata sandi atau masuk dengan kata sandi dinonaktifkan. Anda saat ini masuk menggunakan Akun Google.'}
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
                      {data?.hasPassword
                        ? 'Demi keamanan, seluruh sesi login pada perangkat lain akan otomatis dinonaktifkan setelah kata sandi diubah.'
                        : 'Pasang kata sandi baru untuk mengaktifkan opsi masuk menggunakan email dan kata sandi di samping akun Google Anda.'}
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
                onClick={() => setUnlinkCredentialDialogOpen(true)}
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
                <Badge className='text-xs bg-emerald-600 hover:bg-emerald-600 text-white'>
                  Terhubung
                </Badge>
              ) : (
                <Badge variant='secondary' className='text-xs text-muted-foreground'>
                  Belum Terhubung
                </Badge>
              )}
            </div>
            <p className='text-xs text-muted-foreground leading-relaxed'>
              {data?.hasGoogle
                ? 'Akun Google Anda terhubung. Anda dapat masuk langsung menggunakan tombol Google dengan sekali klik.'
                : 'Menghubungkan akun Google memungkinkan Anda masuk lebih praktis dan aman dengan sekali klik.'}
            </p>
          </div>
          <div className='shrink-0 flex items-center gap-2'>
            {data?.hasGoogle ? (
              <Button
                variant='outline'
                size='sm'
                onClick={() => setUnlinkGoogleDialogOpen(true)}
                disabled={actionLoading || !data?.hasPassword}
                title={
                  !data?.hasPassword
                    ? 'Buat kata sandi akun terlebih dahulu agar akun Anda tidak terkunci'
                    : undefined
                }
                className='text-xs text-destructive hover:bg-destructive/10 cursor-pointer gap-2'
              >
                {actionLoading && <Icons.spinner className='size-3.5 animate-spin' />}
                <span>Putuskan Akun Google</span>
              </Button>
            ) : (
              <Button
                variant='outline'
                size='sm'
                onClick={handleLinkGoogle}
                disabled={actionLoading}
                className='text-xs cursor-pointer gap-2'
              >
                {actionLoading ? (
                  <Icons.spinner className='size-4 animate-spin' />
                ) : (
                  <Icons.google className='size-4' />
                )}
                <span>Tautkan Akun Google</span>
              </Button>
            )}
          </div>
        </div>

        {/* Modal Konfirmasi Putuskan Akun Google */}
        <Dialog open={unlinkGoogleDialogOpen} onOpenChange={setUnlinkGoogleDialogOpen}>
          <DialogContent className='sm:max-w-[420px]'>
            <DialogHeader className='space-y-1.5'>
              <DialogTitle className='text-base font-bold'>
                Putuskan Sambungan Akun Google
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground leading-relaxed'>
                Setelah diputuskan, Anda tidak dapat lagi masuk ke sistem dengan sekali klik
                menggunakan tombol Google. Anda tetap dapat masuk seperti biasa menggunakan alamat
                email dan kata sandi akun Anda.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className='gap-2 sm:gap-0'>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => setUnlinkGoogleDialogOpen(false)}
                disabled={actionLoading}
              >
                Batal
              </Button>
              <Button
                type='button'
                variant='destructive'
                size='sm'
                onClick={executeUnlinkGoogle}
                disabled={actionLoading}
                className='gap-2'
              >
                {actionLoading && <Icons.spinner className='size-4 animate-spin' />}
                <span>Putuskan Sambungan</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Konfirmasi Matikan Login Sandi */}
        <Dialog open={unlinkCredentialDialogOpen} onOpenChange={setUnlinkCredentialDialogOpen}>
          <DialogContent className='sm:max-w-[420px]'>
            <DialogHeader className='space-y-1.5'>
              <DialogTitle className='text-base font-bold'>
                Matikan Masuk dengan Kata Sandi
              </DialogTitle>
              <DialogDescription className='text-xs text-muted-foreground leading-relaxed'>
                Setelah dinonaktifkan, Anda hanya dapat masuk ke sistem menggunakan tombol Akun
                Google yang telah terhubung. Kata sandi lama tidak lagi dapat digunakan.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className='gap-2 sm:gap-0'>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => setUnlinkCredentialDialogOpen(false)}
                disabled={actionLoading}
              >
                Batal
              </Button>
              <Button
                type='button'
                variant='destructive'
                size='sm'
                onClick={executeUnlinkCredential}
                disabled={actionLoading}
                className='gap-2'
              >
                {actionLoading && <Icons.spinner className='size-4 animate-spin' />}
                <span>Matikan Kata Sandi</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
