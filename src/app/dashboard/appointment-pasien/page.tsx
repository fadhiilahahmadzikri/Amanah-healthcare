import PageContainer from '@/components/layout/page-container';
import { AppointmentExportButton, AppointmentListingPage } from '@/features/appointment-pasien';
import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';

import { getAdminAppointments } from '@/features/appointment-pasien/api/service';

export const metadata = {
  title: 'Dashboard: Appointment Pasien'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);
  const initialData = await getAdminAppointments({ limit: 1 });
  const hasAppointments = initialData.total_appointments > 0;

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Appointment Pasien'
      pageDescription='Daftar janji temu dan reservasi pasien dengan dokter klinik Amanah.'
      pageHeaderAction={hasAppointments ? <AppointmentExportButton /> : undefined}
    >
      <AppointmentListingPage />
    </PageContainer>
  );
}
