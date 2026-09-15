import type { Metadata } from 'next';
import { AmanahHomePage, PublicSiteRouteShell, homeMetadata } from '@/features/public-site';

export const metadata: Metadata = homeMetadata;

export default function Page() {
  return (
    <PublicSiteRouteShell>
      <AmanahHomePage locale='id' />
    </PublicSiteRouteShell>
  );
}
