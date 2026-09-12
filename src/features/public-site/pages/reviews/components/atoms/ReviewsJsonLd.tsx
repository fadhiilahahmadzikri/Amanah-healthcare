import type { HealthcareReviewsJsonLd } from '../../types';

type ReviewsJsonLdProps = {
  schema: HealthcareReviewsJsonLd;
};

export function ReviewsJsonLd({ schema }: ReviewsJsonLdProps) {
  return (
    <script
      type='application/ld+json'
      // eslint-disable-next-line react/dom-no-dangerously-set-innerhtml
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replaceAll('<', '\\u003c')
      }}
    />
  );
}
