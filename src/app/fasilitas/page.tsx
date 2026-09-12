import type { Metadata } from 'next';
import { AmanahServicesPage } from '@/features/public-site/pages/services';
import { PublicSiteRouteShell } from '@/features/public-site/route-shell';
import { facilitiesMetadata } from '@/features/public-site/lib/route-metadata';

export const metadata: Metadata = facilitiesMetadata;

export default function Page() {
  return (
    <PublicSiteRouteShell>
      <AmanahServicesPage activePath='/fasilitas' locale='id' />
    </PublicSiteRouteShell>
  );
}
