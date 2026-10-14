import PageContainer from '@/components/layout/page-container';
import { teamInfoContent } from '@/config/infoconfig';
import { requireAdmin } from '@/lib/guard';
import { StaffManagementView } from '@/features/staff-management';

export const metadata = {
  title: 'Dashboard: Manajemen Tim'
};

export default async function TeamPage() {
  await requireAdmin();

  return (
    <PageContainer
      pageTitle='Manajemen Tim'
      pageDescription='Kelola anggota tim, staf medis, peran operasional dan keamanan'
      infoContent={teamInfoContent}
    >
      <StaffManagementView />
    </PageContainer>
  );
}
