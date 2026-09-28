import { getUnifiedSession } from '@/lib/guard';
import { getRoleLandingPath } from '@/lib/safe-redirect';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const session = await getUnifiedSession();
  if (!session?.user) {
    redirect('/auth/sign-in');
  }
  redirect(getRoleLandingPath(session.user.role));
}
