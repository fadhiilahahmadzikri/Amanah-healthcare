import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { requireRouteAccess } from '@/lib/guard';
import { PatientChatView } from '@/features/chat/components/patient-chat-view';

export const metadata = {
  title: 'Dashboard: Chat Konsultasi'
};

export default async function PatientChatPage() {
  await requireRouteAccess('/klinik/chat');

  return (
    <PageContainer scrollable={false} className='p-0 md:px-6 md:pt-4 md:pb-4'>
      <div className='flex-1 h-full min-h-0 flex flex-col'>
        <Suspense fallback={null}>
          <PatientChatView />
        </Suspense>
      </div>
    </PageContainer>
  );
}
