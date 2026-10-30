import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { DoctorScheduleListingPage, DoctorScheduleCardsSkeleton } from '@/features/jadwal-dokter';
import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';

import { requireRouteAccess } from '@/lib/guard';

export const metadata = {
  title: 'Dashboard: Jadwal Praktisi'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: PageProps) {
  await requireRouteAccess('/admin/jadwal-dokter');
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Jadwal Praktisi'
      pageDescription='Kelola kalender dinas, sesi praktik, dan status operasional praktisi medis.'
    >
      <Suspense fallback={<DoctorScheduleCardsSkeleton />}>
        <DoctorScheduleListingPage />
      </Suspense>
    </PageContainer>
  );
}
