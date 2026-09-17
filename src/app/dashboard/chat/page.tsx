import ChatViewPage from '@/features/chat/components/chat-view-page';
import { requireAdmin } from '@/lib/guard';

export const metadata = {
  title: 'Dashboard: Chat'
};

export default async function Page() {
  await requireAdmin();
  return <ChatViewPage />;
}
