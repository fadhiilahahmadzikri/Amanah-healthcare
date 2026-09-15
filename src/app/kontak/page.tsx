import type { Metadata } from 'next';
import { AmanahContactPage, PublicSiteRouteShell, contactMetadata } from '@/features/public-site';

export const metadata: Metadata = contactMetadata;

export default function Page() {
  return (
    <PublicSiteRouteShell>
      <AmanahContactPage locale='id' />
    </PublicSiteRouteShell>
  );
}
