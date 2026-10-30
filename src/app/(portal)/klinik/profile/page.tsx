import { ClinicProfileView } from '@/features/profile/components/clinic-profile-view';
import { requireRouteAccess } from '@/lib/guard';

export const metadata = {
  title: 'Dashboard: Profil Pasien Klinik'
};

export default async function Page() {
  await requireRouteAccess('/klinik/profile');
  return <ClinicProfileView />;
}
