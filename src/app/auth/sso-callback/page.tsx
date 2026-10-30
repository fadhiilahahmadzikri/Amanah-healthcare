import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Authentication | SSO Callback',
  robots: {
    index: false,
    follow: false
  }
};

import { getUnifiedSession } from '@/lib/guard';
import { getRoleLandingPath } from '@/lib/safe-redirect';

export default async function SsoCallbackPage() {
  const session = await getUnifiedSession();
  const audience = (session?.user as { audience?: string })?.audience;
  const target = getRoleLandingPath(audience);
  redirect(target);
}
