import { NotificationsPage } from '@/features/notifications';
import { requireRouteAccess } from '@/lib/guard';

export const metadata = {
  title: 'Klinik: Notifikasi'
};

export default async function ClinicNotificationsPage() {
  await requireRouteAccess('/klinik/notifications');
  return <NotificationsPage />;
}
