'use client';

import type { HealthcareReview, HealthcareReviewsSummary } from '../types';
import { useReviewGallery } from '../hooks/useReviewGallery';
import { ReviewImageDialog } from './molecules/ReviewImageDialog';
import { ReviewsGrid } from './organisms/ReviewsGrid';

type ReviewsExperienceProps = {
  reviews: HealthcareReview[];
  summary?: HealthcareReviewsSummary;
};

export function ReviewsExperience({ reviews }: ReviewsExperienceProps) {
  const { handleOpenChange, isOpen, openImage, selectedImage } = useReviewGallery();

  return (
    <div>
      <ReviewsGrid reviews={reviews} onImageOpen={openImage} />
      <ReviewImageDialog image={selectedImage} isOpen={isOpen} onOpenChange={handleOpenChange} />
    </div>
  );
}
