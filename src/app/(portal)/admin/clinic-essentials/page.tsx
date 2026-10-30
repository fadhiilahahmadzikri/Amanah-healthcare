import React from 'react';
import PageContainer from '@/components/layout/page-container';
import { requireAdmin } from '@/lib/guard';
import { ClinicEssentialsView } from '@/features/clinic-essentials';

export const metadata = {
  title: 'Clinic Essentials - Amanah Healthcare',
  description:
    'Audit dan konfigurasi kanonik unit poliklinik, ruangan periksa, kategori layanan, tindakan medis, dan formulir klinis.'
};

export default async function ClinicEssentialsPage() {
  await requireAdmin();

  return (
    <PageContainer
      scrollable={true}
      pageTitle='Clinic Essentials'
      pageDescription='Audit dan konfigurasi kanonik fasilitas, ruangan periksa, kategori layanan, tindakan medis, dan registri formulir klinis.'
    >
      <div className='pb-8'>
        <ClinicEssentialsView />
      </div>
    </PageContainer>
  );
}
