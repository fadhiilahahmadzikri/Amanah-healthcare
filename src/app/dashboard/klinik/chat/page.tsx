import PageContainer from '@/components/layout/page-container';
import { requirePatient } from '@/lib/guard';
import { PatientChatView } from '@/features/chat/components/patient-chat-view';

export const metadata = {
  title: 'Dashboard: Chat Konsultasi'
};

export default async function PatientChatPage() {
  await requirePatient();

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Konsultasi Online'
      pageDescription='Ruang konsultasi langsung dengan staf administrasi dan tenaga medis Klinik Amanah.'
    >
      <div className='flex-1 h-full min-h-0 flex flex-col pb-4'>
        <PatientChatView />
      </div>
    </PageContainer>
  );
}
