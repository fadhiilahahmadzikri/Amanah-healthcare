import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { requireAdmin } from '@/lib/guard';
import { PayrollManagementView } from '@/features/payroll';

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
      <Suspense
        fallback={
          <div className='flex flex-col gap-4 p-4'>
            <div className='h-20 rounded-2xl bg-muted/20 animate-pulse border border-border/40' />
            <div className='grid grid-cols-4 gap-3'>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className='h-24 rounded-2xl bg-muted/20 animate-pulse border border-border/40'
                />
              ))}
            </div>
            <div className='h-96 rounded-2xl bg-muted/20 animate-pulse border border-border/40' />
          </div>
        }
      >
        <PayrollManagementView />
      </Suspense>
    </PageContainer>
  );
}
