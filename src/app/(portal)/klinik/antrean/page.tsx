import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { QueueView, QueueViewSkeleton } from '@/features/klinik';
import { requireRouteAccess } from '@/lib/guard';

export const metadata = {
  title: 'Dashboard: Cek Antrean'
};

export default async function AntreanPage() {
  await requireRouteAccess('/klinik/antrean');

  return (
    <PageContainer>
      <Suspense fallback={<QueueViewSkeleton />}>
        <QueueView />
      </Suspense>
    </PageContainer>
  );
}
