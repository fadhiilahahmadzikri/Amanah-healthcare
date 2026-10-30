import ChatViewPage from '@/features/chat/components/chat-view-page';
import { requireRouteAccess } from '@/lib/guard';

export const metadata = {
  title: 'Dashboard: Chat'
};

export default async function Page() {
  await requireRouteAccess('/admin/chat');
  return <ChatViewPage />;
}
