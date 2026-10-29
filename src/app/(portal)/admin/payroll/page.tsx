import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { requireAdmin } from '@/lib/guard';
import { PayrollManagementView, PayrollSkeleton } from '@/features/payroll';

export const metadata = {
  title: 'Dashboard: Manajemen Penggajian'
};

export default async function Page() {
  await requireAdmin();

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Manajemen Penggajian'
      pageDescription='Rekapitulasi gaji pokok, pemotongan izin/cuti, dan insentif dinas pengganti dokter, bidan, dan staf operasional.'
    >
      <Suspense fallback={<PayrollSkeleton />}>
        <PayrollManagementView />
      </Suspense>
    </PageContainer>
  );
}
