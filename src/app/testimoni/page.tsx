import type { Metadata } from 'next';
import { AmanahTestimonialsPage } from '@/features/public-site/pages/testimonials';
import { PublicSiteRouteShell } from '@/features/public-site/route-shell';
import { testimonialsMetadata } from '@/features/public-site/lib/route-metadata';

export const metadata: Metadata = testimonialsMetadata;

export default function Page() {
  return (
    <PublicSiteRouteShell>
      <AmanahTestimonialsPage locale='id' />
    </PublicSiteRouteShell>
  );
}
