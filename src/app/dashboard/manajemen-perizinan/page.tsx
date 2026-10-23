import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { requireAdmin } from '@/lib/guard';
import { LeaveManagementView } from '@/features/manajemen-perizinan';

export const metadata = {
  title: 'Dashboard: Manajemen Perizinan'
};

export default async function Page() {
  await requireAdmin();

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Manajemen Perizinan'
      pageDescription='Kelola pengajuan dan persetujuan permohonan izin serta cuti staf klinik.'
    >
      <Suspense
        fallback={
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-20 pt-1'>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className='h-48 rounded-2xl bg-muted/20 animate-pulse border border-border/40'
              />
            ))}
          </div>
        }
      >
        <LeaveManagementView />
      </Suspense>
    </PageContainer>
  );
}
