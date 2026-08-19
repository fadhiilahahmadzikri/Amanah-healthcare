import PageContainer from '@/components/layout/page-container';
import DoctorScheduleListingPage from '@/features/jadwal-dokter/components/doctor-schedule-listing';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
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
      pageDescription='Kelola jadwal praktik dokter, atur ketersediaan dan slot pasien.'
      pageHeaderAction={
        <Button
          type='button'
          variant='default'
          className='bg-[#0B0F3B] hover:bg-[#151A66] text-white font-semibold text-xs sm:text-sm h-10 px-4 rounded-xl shadow-2xs gap-1.5 cursor-pointer'
        >
          <Icons.add className='size-4' />
          <span>Tambah Dokter</span>
        </Button>
      }
    >
      <DoctorScheduleListingPage />
    </PageContainer>
  );
}
