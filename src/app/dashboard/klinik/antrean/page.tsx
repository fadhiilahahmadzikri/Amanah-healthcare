import PageContainer from '@/components/layout/page-container';
import { QueueView } from '@/features/klinik/components/queue-view';

export const metadata = {
  title: 'Dashboard: Cek Antrean'
};

export default function AntreanPage() {
  return (
    <PageContainer>
      <QueueView />
    </PageContainer>
  );
}
