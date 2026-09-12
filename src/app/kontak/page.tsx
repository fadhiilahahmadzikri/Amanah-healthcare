import type { Metadata } from 'next';
import { AmanahContactPage } from '@/features/public-site/pages/contact';
import { PublicSiteRouteShell } from '@/features/public-site/route-shell';
import { contactMetadata } from '@/features/public-site/lib/route-metadata';

export const metadata: Metadata = contactMetadata;

export default function Page() {
  return (
    <PublicSiteRouteShell>
      <AmanahContactPage locale='id' />
    </PublicSiteRouteShell>
  );
}
