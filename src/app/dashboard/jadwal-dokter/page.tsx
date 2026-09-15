import PageContainer from '@/components/layout/page-container';
import { DoctorScheduleListingPage } from '@/features/jadwal-dokter';
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
        <Button type='button' variant='default' className='shrink-0 text-xs md:text-sm'>
          <Icons.add className='mr-2 h-4 w-4' />
          <span>Tambah Dokter</span>
        </Button>
      }
    >
      <DoctorScheduleListingPage />
    </PageContainer>
  );
}
