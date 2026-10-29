import ProfileViewPage from '@/features/profile/components/profile-view-page';
import { requireSession } from '@/lib/guard';

export const metadata = {
  title: 'Dashboard : Profile'
};

export default async function Page() {
  await requireSession();
  return <ProfileViewPage />;
}
