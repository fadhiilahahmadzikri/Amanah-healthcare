import PageContainer from '@/components/layout/page-container';
import { requireAdmin } from '@/lib/guard';
import { StaffManagementView } from '@/features/staff-management';

export const metadata = {
  title: 'Dashboard: Manajemen Staf'
};

export default async function StaffManagementPage() {
  await requireAdmin();

  return (
    <PageContainer
      scrollable={false}
      pageTitle='Manajemen Staf'
      pageDescription='Kelola data profil staf operasional dan jadwal shift kerja klinik.'
    >
      <StaffManagementView />
    </PageContainer>
  );
}
