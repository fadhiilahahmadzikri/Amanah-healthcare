import type {
  HealthcareReview,
  HealthcareReviewJsonLdReview,
  HealthcareReviewsJsonLd,
  HealthcareReviewsPageContent,
  HealthcareReviewsSummary,
  RawGoogleReview,
  RawGoogleReviewsDataset,
  ReviewImage
} from './types';
import rawGoogleReviews from './data/google-reviews.json';

const MAX_REVIEW_RATING = 5;
const MIN_REVIEW_RATING = 0;
const REVIEW_PHOTO_START_INDEX = 1;
const INITIALS_PART_LIMIT = 2;

const indonesianDateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'long',
  timeZone: 'Asia/Jakarta'
});

export const googleReviewsDataset = rawGoogleReviews as RawGoogleReviewsDataset;

function parseLocalizedRating(value: string) {
  const parsedRating = Number.parseFloat(value.replace(',', '.'));

  if (Number.isNaN(parsedRating)) {
    return MIN_REVIEW_RATING;
  }

  return Math.min(MAX_REVIEW_RATING, Math.max(MIN_REVIEW_RATING, parsedRating));
}

function formatScrapedDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return indonesianDateFormatter.format(date);
}

function createAuthorInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, INITIALS_PART_LIMIT)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return initials || 'AH';
}

function createAuthorAvatar(rawReview: RawGoogleReview): ReviewImage {
  return {
    alt: `Foto profil ${rawReview.author_name}`,
    caption: rawReview.author_badge ?? 'Reviewer Google Maps',
    id: `${rawReview.review_id}-avatar`,
    src: rawReview.author_avatar,
    title: rawReview.author_name
  };
}

function createReviewPhotos(rawReview: RawGoogleReview): ReviewImage[] {
  return rawReview.photos.map((src, photoIndex) => {
    const photoNumber = photoIndex + REVIEW_PHOTO_START_INDEX;

    return {
      alt: `Foto ulasan ${photoNumber} dari ${rawReview.author_name}`,
      caption: `${rawReview.relative_date} · ${rawReview.photos_count} foto`,
      id: `${rawReview.review_id}-photo-${photoNumber}`,
      src,
      title: `Foto ulasan ${rawReview.author_name}`
    };
  });
}

function toHealthcareReview(rawReview: RawGoogleReview): HealthcareReview {
  const trimmedText = rawReview.review_text?.trim() || null;

  return {
    author: {
      avatar: createAuthorAvatar(rawReview),
      badge: rawReview.author_badge,
      initials: createAuthorInitials(rawReview.author_name),
      name: rawReview.author_name,
      url: rawReview.author_url
    },
    id: rawReview.review_id,
    index: rawReview.index,
    likes: rawReview.likes,
    ownerResponse: rawReview.owner_response,
    photos: createReviewPhotos(rawReview),
    photosCount: rawReview.photos_count,
    rating: rawReview.rating,
    raw: rawReview,
    relativeDate: rawReview.relative_date,
    text: trimmedText
  };
}

function toJsonLdReview(review: HealthcareReview): HealthcareReviewJsonLdReview {
  const baseReview = {
    '@type': 'Review',
    author: {
      '@type': 'Person',
      name: review.author.name
    },
    reviewRating: {
      '@type': 'Rating',
      bestRating: MAX_REVIEW_RATING,
      ratingValue: review.rating,
      worstRating: MIN_REVIEW_RATING
    }
  } satisfies HealthcareReviewJsonLdReview;

  if (!review.text) {
    return baseReview;
  }

  return {
    ...baseReview,
    reviewBody: review.text
  };
}

export const healthcareReviews = googleReviewsDataset.reviews.map(toHealthcareReview);

export const healthcareReviewsSummary = {
  overallRatingLabel: googleReviewsDataset.overall_rating,
  overallRatingValue: parseLocalizedRating(googleReviewsDataset.overall_rating),
  placeTitle: googleReviewsDataset.place_title,
  scrapedAtLabel: formatScrapedDate(googleReviewsDataset.scraped_at),
  sourceUrl: googleReviewsDataset.source_url,
  totalReviewsClaimed: googleReviewsDataset.total_reviews_claimed,
  totalReviewsScraped: googleReviewsDataset.total_reviews_scraped
} satisfies HealthcareReviewsSummary;

export const healthcareReviewsJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalClinic',
  aggregateRating: {
    '@type': 'AggregateRating',
    bestRating: MAX_REVIEW_RATING,
    ratingValue: healthcareReviewsSummary.overallRatingValue,
    reviewCount: healthcareReviewsSummary.totalReviewsScraped,
    worstRating: MIN_REVIEW_RATING
  },
  name: healthcareReviewsSummary.placeTitle,
  review: healthcareReviews.map(toJsonLdReview),
  sameAs: healthcareReviewsSummary.sourceUrl
} satisfies HealthcareReviewsJsonLd;

export const reviewsPageContent = {
  jsonLd: healthcareReviewsJsonLd,
  reviews: healthcareReviews,
  summary: healthcareReviewsSummary
} satisfies HealthcareReviewsPageContent;
