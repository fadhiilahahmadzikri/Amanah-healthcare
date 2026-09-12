import type { Metadata } from 'next';
import { AmanahHomePage } from '@/features/public-site/pages/home';
import { PublicSiteRouteShell } from '@/features/public-site/route-shell';
import { homeMetadata } from '@/features/public-site/lib/route-metadata';

export const metadata: Metadata = homeMetadata;

export default function Page() {
  return (
    <PublicSiteRouteShell>
      <AmanahHomePage locale='id' />
    </PublicSiteRouteShell>
  );
}
