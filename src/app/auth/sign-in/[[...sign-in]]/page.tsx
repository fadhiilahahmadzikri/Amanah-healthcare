import { Metadata } from 'next';
import SignInViewPage from '@/features/auth/components/sign-in-view';
import { getSession } from '@/server/auth/session.dal';
import { getRoleLandingPath } from '@/core/routes';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Authentication | Sign In',
  description: 'Sign In page for authentication.'
};

export default async function Page() {
  const session = await getSession();
  if (session.status === 'authenticated') {
    redirect(getRoleLandingPath(session.role));
  }
  return <SignInViewPage />;
}
