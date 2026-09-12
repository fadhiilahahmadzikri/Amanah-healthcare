import { HealthcareShell, TechnicalDivider } from '@/features/public-site/components/shared';
import { ReviewsJsonLd } from './components/atoms/ReviewsJsonLd';
import { ReviewsExperience } from './components/ReviewsExperience';
import { reviewsPageContent } from './data';

type AmanahReviewsPageProps = {
  locale?: string;
};

export function AmanahReviewsPage({ locale }: AmanahReviewsPageProps) {
  return (
    <HealthcareShell activePath='/ulasan' locale={locale}>
      <ReviewsJsonLd schema={reviewsPageContent.jsonLd} />
      <ReviewsExperience
        summary={reviewsPageContent.summary}
        reviews={reviewsPageContent.reviews}
      />
      <TechnicalDivider />
    </HealthcareShell>
  );
}
