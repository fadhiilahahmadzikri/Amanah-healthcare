export type RawGoogleReviewOwnerResponse = {
  date: string;
  text: string;
};

export type RawGoogleReview = {
  author_avatar: string;
  author_badge: string | null;
  author_name: string;
  author_url: string;
  index: number;
  likes: number;
  owner_response: RawGoogleReviewOwnerResponse | null;
  photos: string[];
  photos_count: number;
  rating: number;
  relative_date: string;
  review_id: string;
  review_text: string | null;
};

export type RawGoogleReviewsDataset = {
  overall_rating: string;
  place_title: string;
  reviews: RawGoogleReview[];
  scraped_at: string;
  source_url: string;
  total_reviews_claimed: string;
  total_reviews_scraped: number;
};

export type ReviewImage = {
  alt: string;
  caption: string;
  id: string;
  src: string;
  title: string;
};

export type HealthcareReviewAuthor = {
  avatar: ReviewImage;
  badge: string | null;
  initials: string;
  name: string;
  url: string;
};

export type HealthcareReview = {
  author: HealthcareReviewAuthor;
  id: string;
  index: number;
  likes: number;
  ownerResponse: RawGoogleReviewOwnerResponse | null;
  photos: ReviewImage[];
  photosCount: number;
  rating: number;
  raw: RawGoogleReview;
  relativeDate: string;
  text: string | null;
};

export type HealthcareReviewsSummary = {
  overallRatingLabel: string;
  overallRatingValue: number;
  placeTitle: string;
  scrapedAtLabel: string;
  sourceUrl: string;
  totalReviewsClaimed: string;
  totalReviewsScraped: number;
};

export type HealthcareReviewJsonLdReview = {
  '@type': 'Review';
  author: {
    '@type': 'Person';
    name: string;
  };
  reviewBody?: string;
  reviewRating: {
    '@type': 'Rating';
    bestRating: number;
    ratingValue: number;
    worstRating: number;
  };
};

export type HealthcareReviewsJsonLd = {
  '@context': 'https://schema.org';
  '@type': 'MedicalClinic';
  aggregateRating: {
    '@type': 'AggregateRating';
    bestRating: number;
    ratingValue: number;
    reviewCount: number;
    worstRating: number;
  };
  name: string;
  review: HealthcareReviewJsonLdReview[];
  sameAs: string;
};

export type HealthcareReviewsPageContent = {
  jsonLd: HealthcareReviewsJsonLd;
  reviews: HealthcareReview[];
  summary: HealthcareReviewsSummary;
};
