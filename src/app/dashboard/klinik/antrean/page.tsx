import PageContainer from '@/components/layout/page-container';
import { QueueView } from '@/features/klinik';

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
