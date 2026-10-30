import { GuideView } from '@/features/klinik/components/guide-view';
import { requireRouteAccess } from '@/lib/guard';

export const metadata = {
  title: 'Dashboard: Panduan Penggunaan'
};

export default async function Page() {
  await requireRouteAccess('/klinik/panduan');
  return <GuideView />;
}
