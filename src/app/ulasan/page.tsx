import type { Metadata } from 'next';
import { AmanahReviewsPage, PublicSiteRouteShell, reviewsMetadata } from '@/features/public-site';

export const metadata: Metadata = reviewsMetadata;

export default function Page() {
  return (
    <PublicSiteRouteShell>
      <AmanahReviewsPage locale='id' />
    </PublicSiteRouteShell>
  );
}
