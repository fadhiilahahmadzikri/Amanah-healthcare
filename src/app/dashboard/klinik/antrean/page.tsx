import PageContainer from '@/components/layout/page-container';
import { QueueView } from '@/features/klinik';
import { requirePatient } from '@/lib/guard';

export const metadata = {
  title: 'Dashboard: Cek Antrean'
};

export default async function AntreanPage() {
  await requirePatient();

  return (
    <PageContainer>
      <QueueView />
    </PageContainer>
  );
}
