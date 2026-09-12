import type { Metadata } from 'next';
import { AmanahServicesPage } from '@/features/public-site/pages/services';
import { PublicSiteRouteShell } from '@/features/public-site/route-shell';
import { servicesMetadata } from '@/features/public-site/lib/route-metadata';

export const metadata: Metadata = servicesMetadata;

export default function Page() {
  return (
    <PublicSiteRouteShell>
      <AmanahServicesPage activePath='/layanan' locale='id' />
    </PublicSiteRouteShell>
  );
}
