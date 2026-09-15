import type { Metadata } from 'next';
import {
  AmanahServicesPage,
  PublicSiteRouteShell,
  facilitiesMetadata
} from '@/features/public-site';

export const metadata: Metadata = facilitiesMetadata;

export default function Page() {
  return (
    <PublicSiteRouteShell>
      <AmanahServicesPage activePath='/fasilitas' locale='id' />
    </PublicSiteRouteShell>
  );
}
