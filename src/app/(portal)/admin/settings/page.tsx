import React from 'react';
import PageContainer from '@/components/layout/page-container';
import { QRConfigSettings } from '@/features/settings/components/qr-config-settings';
import { AccountSecuritySettings } from '@/features/settings/components/account-security-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteAccountDialog } from '@/features/profile/components/delete-account-dialog';

import { requireRouteAccess } from '@/lib/guard';

export const metadata = {
  title: 'Pengaturan Sistem - Amanah Healthcare',
  description: 'Kelola preferensi estetika gaya QR code presensi dan keamanan akun sistem.'
};

export default async function SettingsPage() {
  await requireRouteAccess('/admin/settings');
  return (
    <PageContainer scrollable={true}>
      <div className='space-y-6 font-sans pb-12 select-none'>
        {/* Header Title & Description */}
        <div className='flex flex-col gap-1 pb-1'>
          <h1 className='text-xl sm:text-2xl font-bold tracking-tight text-foreground'>
            Pengaturan & Konfigurasi
          </h1>
          <p className='text-xs sm:text-sm text-muted-foreground'>
            Kelola preferensi estetika pola dan warna QR presensi serta keamanan akun sistem.
          </p>
        </div>

        {/* QR Code Config & Styling */}
        <div className='pt-2'>
          <QRConfigSettings />
        </div>

        {/* Account Security & Sign-in Methods */}
        <div className='pt-2'>
          <AccountSecuritySettings />
        </div>

        {/* Account Privacy / Danger Zone */}
        <div className='pt-4'>
          <Card className='border-destructive/30 bg-card shadow-xs overflow-hidden'>
            <CardHeader className='pb-3 bg-destructive/5 border-b border-destructive/15'>
              <CardTitle className='text-base sm:text-lg font-bold text-destructive'>
                Zona Bahaya Akun (Danger Zone)
              </CardTitle>
              <CardDescription className='text-xs sm:text-sm text-foreground/75 pt-1'>
                Penghapusan akun mandiri secara sistemik sesuai hak perlindungan data (GDPR Right to
                Erasure).
              </CardDescription>
            </CardHeader>
            <CardContent className='p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
              <div className='space-y-1 max-w-xl'>
                <h3 className='text-sm font-semibold text-foreground'>Hapus Akun Administrator</h3>
                <p className='text-xs text-muted-foreground leading-relaxed'>
                  Menghapus akun Anda dan seluruh data sesi aktif secara permanen dari basis data
                  dan cache sistem.
                </p>
              </div>
              <div className='shrink-0'>
                <DeleteAccountDialog />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
