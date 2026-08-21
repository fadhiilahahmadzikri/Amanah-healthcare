import React from 'react';
import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QRConfigSettings } from '@/features/settings/components/qr-config-settings';
import { SimulationSettings } from '@/features/settings/components/simulation-settings';
import { Icons } from '@/components/icons';

export const metadata = {
  title: 'Pengaturan Sistem - Amanah Healthcare',
  description: 'Kelola preferensi gaya QR code presensi, interval rotasi, dan pengaturan sistem.'
};

export default function SettingsPage() {
  return (
    <PageContainer scrollable={true}>
      <div className='space-y-4 font-sans pb-10 select-none'>
        {/* Header Title & Description */}
        <div className='flex flex-col gap-1 pb-1'>
          <h1 className='text-xl sm:text-2xl font-bold tracking-tight text-foreground'>
            Pengaturan & Konfigurasi
          </h1>
          <p className='text-xs sm:text-sm text-muted-foreground'>
            Kelola preferensi estetika pola QR presensi, interval rotasi, dan simulasi sistem.
          </p>
        </div>

        {/* Segmented Tabs */}
        <Tabs defaultValue='qr-style' className='flex flex-col gap-4'>
          <TabsList className='bg-muted/50 p-1 rounded-xl w-fit'>
            <TabsTrigger
              value='qr-style'
              className='rounded-lg text-xs font-semibold px-4 py-2 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-2xs'
            >
              <Icons.qrCode className='size-3.5 text-primary' />
              <span>Konfigurasi QR Presensi</span>
            </TabsTrigger>
            <TabsTrigger
              value='simulation'
              className='rounded-lg text-xs font-semibold px-4 py-2 gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-2xs'
            >
              <Icons.settings className='size-3.5 text-primary' />
              <span>Simulasi & Operasional</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: QR Code Config & Styling */}
          <TabsContent value='qr-style' className='focus-visible:outline-none m-0'>
            <QRConfigSettings />
          </TabsContent>

          {/* Tab 2: System & Simulation Settings */}
          <TabsContent value='simulation' className='focus-visible:outline-none m-0 max-w-3xl'>
            <SimulationSettings />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
