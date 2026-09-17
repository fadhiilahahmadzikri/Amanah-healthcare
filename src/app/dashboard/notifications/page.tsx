import { NotificationsPage } from '@/features/notifications';
import { requirePatient } from '@/lib/guard';

export const metadata = {
  title: 'Dashboard: Notifications'
};

export default async function Page() {
  await requirePatient();
  return <NotificationsPage />;
}
