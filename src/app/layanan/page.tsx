import type { Metadata } from 'next';
import { AmanahServicesPage, PublicSiteRouteShell, servicesMetadata } from '@/features/public-site';

export const metadata: Metadata = servicesMetadata;

export default function Page() {
  return (
    <PublicSiteRouteShell>
      <AmanahServicesPage activePath='/layanan' locale='id' />
    </PublicSiteRouteShell>
  );
}
