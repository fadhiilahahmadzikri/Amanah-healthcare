import PageContainer from '@/components/layout/page-container';
import AppointmentListingPage from '@/features/appointment-pasien/components/appointment-listing';
import { AppointmentExportButton } from '@/features/appointment-pasien/components/appointment-export-button';
import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';

export const metadata = {
  title: 'Dashboard: Appointment Pasien'
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
      pageTitle='Appointment Pasien'
      pageDescription='Daftar janji temu dan reservasi pasien dengan dokter klinik Amanah.'
      pageHeaderAction={<AppointmentExportButton />}
    >
      <AppointmentListingPage />
    </PageContainer>
  );
}
