import React from 'react';
import PageContainer from '@/components/layout/page-container';
import { requireRouteAccess } from '@/lib/guard';
import { ClinicEssentialsView } from '@/features/clinic-essentials';

export const metadata = {
  title: 'Clinic Essentials - Amanah Healthcare',
  description:
    'Audit dan konfigurasi kanonik unit poliklinik, ruangan periksa, kategori layanan, tindakan medis, dan formulir klinis.'
};

export default async function ClinicEssentialsPage() {
  await requireRouteAccess('/admin/clinic-essentials');

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Clinic Essentials'
      pageDescription='Audit dan konfigurasi kanonik fasilitas, ruangan periksa, kategori layanan, tindakan medis, dan registri formulir klinis.'
    >
      <ClinicEssentialsView />
    </PageContainer>
  );
}
