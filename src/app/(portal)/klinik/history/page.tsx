import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { MedicalHistoryListing, MedicalHistoryListingSkeleton } from '@/features/riwayat-medis';
import { requireRouteAccess } from '@/lib/guard';

export const metadata = {
  title: 'Dashboard: Riwayat Medis'
};

export default async function ClinicalHistoryPage() {
  await requireRouteAccess('/klinik/history');

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Riwayat Medis'
      pageDescription='Catatan rekam jejak klinis, diagnosa, dan riwayat kunjungan kesehatan keluarga'
    >
      <Suspense fallback={<MedicalHistoryListingSkeleton />}>
        <MedicalHistoryListing />
      </Suspense>
    </PageContainer>
  );
}
