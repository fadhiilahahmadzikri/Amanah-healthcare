import React from 'react';
import PageContainer from '@/components/layout/page-container';
import { QRConfigSettings } from '@/features/settings/components/qr-config-settings';

import { requireAdmin } from '@/lib/guard';

export const metadata = {
  title: 'Pengaturan Sistem - Amanah Healthcare',
  description: 'Kelola preferensi gaya QR code presensi, interval rotasi, dan pengaturan sistem.'
};

export default async function SettingsPage() {
  await requireAdmin();
  return (
    <PageContainer scrollable={true}>
      <div className='space-y-4 font-sans pb-10 select-none'>
        {/* Header Title & Description */}
        <div className='flex flex-col gap-1 pb-1'>
          <h1 className='text-xl sm:text-2xl font-bold tracking-tight text-foreground'>
            Pengaturan & Konfigurasi
          </h1>
          <p className='text-xs sm:text-sm text-muted-foreground'>
            Kelola preferensi estetika pola QR presensi dan interval rotasi keamanan kehadiran.
          </p>
        </div>

        {/* QR Code Config & Styling */}
        <div className='pt-2'>
          <QRConfigSettings />
        </div>
      </div>
    </PageContainer>
  );
}
