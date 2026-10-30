import { Metadata } from 'next';
import SignUpViewPage from '@/features/auth/components/sign-up-view';
import { getSession } from '@/server/auth/session.dal';
import { getRoleLandingPath } from '@/core/routes';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Authentication | Sign Up',
  description: 'Sign Up page for authentication.'
};

export default async function Page() {
  const session = await getSession();
  if (session.status === 'authenticated') {
    redirect(getRoleLandingPath(session.audience));
  }
  return <SignUpViewPage />;
}
