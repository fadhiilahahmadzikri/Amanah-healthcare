import type { Metadata } from 'next';
import { AmanahAboutPage } from '@/features/public-site/pages/about';
import { PublicSiteRouteShell } from '@/features/public-site/route-shell';
import { aboutMetadata } from '@/features/public-site/lib/route-metadata';

export const metadata: Metadata = aboutMetadata;

export default function Page() {
  return (
    <PublicSiteRouteShell>
      <AmanahAboutPage locale='id' />
    </PublicSiteRouteShell>
  );
}
