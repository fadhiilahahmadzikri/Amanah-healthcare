import { NotificationsPage } from '@/features/notifications';
import { requireRouteAccess } from '@/lib/guard';

export const metadata = {
  title: 'Admin: Notifikasi'
};

export default async function Page() {
  await requireRouteAccess('/admin/notifications');
  return <NotificationsPage />;
}
