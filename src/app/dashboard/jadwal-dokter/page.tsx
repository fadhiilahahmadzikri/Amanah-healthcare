import PageContainer from '@/components/layout/page-container';
import { DoctorScheduleListingPage } from '@/features/jadwal-dokter';
import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';

import { requireAdmin } from '@/lib/guard';

export const metadata = {
  title: 'Dashboard: Jadwal Dokter'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: PageProps) {
  await requireAdmin();
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Jadwal Dokter'
      pageDescription='Kelola jadwal praktik dokter, atur ketersediaan dan slot pasien.'
    >
      <DoctorScheduleListingPage />
    </PageContainer>
  );
}
