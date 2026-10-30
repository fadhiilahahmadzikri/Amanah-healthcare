import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { MedicalHistoryListing, MedicalHistoryListingSkeleton } from '@/features/riwayat-medis';
import { requireRouteAccess } from '@/lib/guard';

export const metadata = {
  title: 'Dashboard: Riwayat Medis Pasien'
};

export default async function MedicalHistoryPage() {
  await requireRouteAccess('/admin/riwayat-medis');

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Riwayat Medis'
      pageDescription='Catatan rekam jejak klinis, diagnosa ICD-10, dan berkas medis seluruh pasien klinik Amanah.'
    >
      <Suspense fallback={<MedicalHistoryListingSkeleton />}>
        <MedicalHistoryListing />
      </Suspense>
    </PageContainer>
  );
}
