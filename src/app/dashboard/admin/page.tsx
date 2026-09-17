import { requireAdmin } from '@/lib/guard';
import { OperationalReportView } from '@/features/admin-dashboard';

export const metadata = {
  title: 'Dashboard Admin: Laporan Operasional Klinik'
};

export default async function AdminDashboardPage() {
  await requireAdmin();
  return <OperationalReportView />;
}
