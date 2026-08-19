import PageContainer from '@/components/layout/page-container';
import DoctorScheduleListingPage from '@/features/jadwal-dokter/components/doctor-schedule-listing';
import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';

export const metadata = {
  title: 'Dashboard: Jadwal Dokter'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Jadwal Dokter'
      pageDescription='Manajemen jadwal praktik dokter, kalender ketersediaan kuota slot, pengaturan cuti, dan penutupan operasional poli klinik.'
    >
      <DoctorScheduleListingPage />
    </PageContainer>
  );
}
