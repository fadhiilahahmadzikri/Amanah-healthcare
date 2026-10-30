import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { requireRouteAccess } from '@/lib/guard';
import { searchParamsCache } from '@/lib/searchparams';
import type { SearchParams } from 'nuqs/server';
import {
  StaffManagementListingPage,
  StaffScheduleCardsSkeleton
} from '@/features/staff-management';

export const metadata = {
  title: 'Dashboard: Manajemen Staf'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function StaffManagementPage(props: PageProps) {
  await requireRouteAccess('/admin/staff');
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Manajemen Staf'
      pageDescription='Kelola data profil staf operasional dan jadwal shift kerja klinik.'
    >
      <Suspense fallback={<StaffScheduleCardsSkeleton />}>
        <StaffManagementListingPage />
      </Suspense>
    </PageContainer>
  );
}
