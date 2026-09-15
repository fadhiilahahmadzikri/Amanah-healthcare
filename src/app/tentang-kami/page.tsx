import type { Metadata } from 'next';
import { AmanahAboutPage, PublicSiteRouteShell, aboutMetadata } from '@/features/public-site';

export const metadata: Metadata = aboutMetadata;

export default function Page() {
  return (
    <PublicSiteRouteShell>
      <AmanahAboutPage locale='id' />
    </PublicSiteRouteShell>
  );
}
