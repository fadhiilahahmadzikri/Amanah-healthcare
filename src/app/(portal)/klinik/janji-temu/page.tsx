import PageContainer from '@/components/layout/page-container';
import { AppointmentsView } from '@/features/klinik';
import { requirePatient } from '@/lib/guard';

export const metadata = {
  title: 'Dashboard: Janji Temu'
};

export default async function JanjiTemuPage() {
  await requirePatient();

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Janji Temu'
      pageDescription='Kelola jadwal konsultasi dan reservasi poliklinik secara terpadu'
    >
      <AppointmentsView />
    </PageContainer>
  );
}
