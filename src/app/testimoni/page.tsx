import type { Metadata } from 'next';
import {
  AmanahTestimonialsPage,
  PublicSiteRouteShell,
  testimonialsMetadata
} from '@/features/public-site';

export const metadata: Metadata = testimonialsMetadata;

export default function Page() {
  return (
    <PublicSiteRouteShell>
      <AmanahTestimonialsPage locale='id' />
    </PublicSiteRouteShell>
  );
}
