import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import {
  AppointmentExportButton,
  AppointmentListingPage,
  AppointmentTableSkeleton
} from '@/features/appointment-pasien';
import { searchParamsCache } from '@/lib/searchparams';
import { SearchParams } from 'nuqs/server';
import { requireAdmin } from '@/lib/guard';

export const metadata = {
  title: 'Dashboard: Appointment Pasien'
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
      pageTitle='Appointment Pasien'
      pageDescription='Daftar janji temu dan reservasi pasien dengan dokter klinik Amanah.'
      pageHeaderAction={<AppointmentExportButton />}
    >
      <Suspense fallback={<AppointmentTableSkeleton />}>
        <AppointmentListingPage />
      </Suspense>
    </PageContainer>
  );
}
