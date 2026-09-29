import { NotificationsPage } from '@/features/notifications';
import { requireRouteAccess } from '@/lib/guard';

export const metadata = {
  title: 'Dashboard: Notifications'
};

export default async function Page() {
  await requireRouteAccess('/dashboard/notifications');
  return <NotificationsPage />;
}
