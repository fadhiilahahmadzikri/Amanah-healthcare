import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { ClinicalHistoryTables, ClinicalHistoryTableSkeleton } from '@/features/klinik';
import { requirePatient } from '@/lib/guard';

export const metadata = {
  title: 'Dashboard: Riwayat Medis'
};

export default async function ClinicalHistoryPage() {
  await requirePatient();

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Riwayat Medis'
      pageDescription='Arsip riwayat pengisian formulir medis dan rekam kesehatan keluarga'
    >
      <Suspense fallback={<ClinicalHistoryTableSkeleton />}>
        <ClinicalHistoryTables />
      </Suspense>
    </PageContainer>
  );
}
