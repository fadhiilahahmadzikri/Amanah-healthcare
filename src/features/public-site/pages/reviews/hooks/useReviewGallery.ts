'use client';

import type { ReviewImage } from '../types';
import { useCallback, useState } from 'react';

export function useReviewGallery() {
  const [selectedImage, setSelectedImage] = useState<ReviewImage | null>(null);

  const openImage = useCallback((image: ReviewImage) => {
    setSelectedImage(image);
  }, []);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      setSelectedImage(null);
    }
  }, []);

  return {
    handleOpenChange,
    isOpen: selectedImage !== null,
    openImage,
    selectedImage
  };
}
