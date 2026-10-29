import { GuideView } from '@/features/klinik/components/guide-view';
import { requirePatient } from '@/lib/guard';

export const metadata = {
  title: 'Dashboard: Panduan Penggunaan'
};

export default async function Page() {
  await requirePatient();
  return <GuideView />;
}
