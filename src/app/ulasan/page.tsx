import type { Metadata } from 'next';
import { AmanahReviewsPage } from '@/features/public-site/pages/reviews';
import { PublicSiteRouteShell } from '@/features/public-site/route-shell';
import { reviewsMetadata } from '@/features/public-site/lib/route-metadata';

export const metadata: Metadata = reviewsMetadata;

export default function Page() {
  return (
    <PublicSiteRouteShell>
      <AmanahReviewsPage locale='id' />
    </PublicSiteRouteShell>
  );
}
