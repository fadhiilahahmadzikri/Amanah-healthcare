'use client';

import type { HealthcareReview, ReviewImage } from '../../types';
import type { PixelMeshBackgroundHandle } from '@/features/public-site/pages/about/components/atoms/PixelMeshBackground';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RotateCcw, Search } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { SectionContainer, SectionHeader } from '@/features/public-site/components/shared';
import { PixelMeshBackground } from '@/features/public-site/pages/about/components/atoms/PixelMeshBackground';
import { MarqueeArrowIndicator } from '@/features/public-site/pages/home/components/atoms/MarqueeArrowIndicator';
import { useReviewsTable } from '../../hooks/useReviewsTable';
import { ReviewsToolbox } from '../molecules/ReviewsToolbox';
import { ReviewCard } from './ReviewCard';

gsap.registerPlugin(ScrollTrigger);

type ReviewsGridProps = {
  onImageOpen: (image: ReviewImage) => void;
  reviews: HealthcareReview[];
};

export function ReviewsGrid({ onImageOpen, reviews }: ReviewsGridProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const pixelMeshRef = useRef<PixelMeshBackgroundHandle>(null);
  const pixelContainerRef = useRef<HTMLDivElement>(null);

  const {
    filteredCount,
    hasMore,
    isFiltered,
    loadMore,
    photosFilter,
    ratingSort,
    resetFilters,
    responseFilter,
    reviews: visibleReviews,
    searchQuery,
    setPhotosFilter,
    setRatingSort,
    setResponseFilter,
    setSearchQuery,
    totalCount,
    visibleCount
  } = useReviewsTable(reviews);

  useEffect(() => {
    ScrollTrigger.refresh();
  }, [visibleCount]);

  useGSAP(
    () => {
      // 1. Hero entrance timeline: executes on load / reload
      const entranceTl = gsap.timeline({
        delay: 0.1,
        defaults: { ease: 'expo.out' }
      });

      // Pixel texture organic crawl from bottom to top
      const crawlState = { progress: 0 };
      entranceTl.to(
        crawlState,
        {
          duration: 1.2,
          ease: 'power2.out',
          onUpdate: () => {
            pixelMeshRef.current?.setProgress(crawlState.progress);
          },
          progress: 1
        },
        0
      );

      // Header mask text lines (eyebrow script, title heading, description lead)
      if (headerRef.current) {
        const maskLines = headerRef.current.querySelectorAll('[data-mask-text]');
        if (maskLines.length > 0) {
          entranceTl.fromTo(
            maskLines,
            { opacity: 0, yPercent: 120 },
            {
              duration: 1.2,
              opacity: 1,
              stagger: 0.12,
              yPercent: 0
            },
            0.1
          );
        }
      }

      entranceTl.call(() => {
        ScrollTrigger.refresh();
      });

      // 2. Parallax scrub for curved pixel background on scroll
      if (pixelContainerRef.current && sectionRef.current) {
        gsap.to(pixelContainerRef.current, {
          ease: 'none',
          scrollTrigger: {
            end: 'bottom top',
            scrub: true,
            start: 'top top',
            trigger: sectionRef.current
          },
          yPercent: 20
        });
      }

      // 3. Review cards grid animate on scroll (matching FacilitiesSection & ProfessionalDoctorsSection)
      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll('[data-review-card]');
        if (cards.length > 0) {
          gsap.fromTo(
            cards,
            { opacity: 0, y: 50 },
            {
              duration: 1,
              ease: 'expo.out',
              opacity: 1,
              scrollTrigger: {
                start: 'top 85%',
                toggleActions: 'play none none reverse',
                trigger: gridRef.current
              },
              stagger: 0.08,
              y: 0
            }
          );
        }
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className='
        relative overflow-hidden bg-background py-14
        sm:py-16
        md:py-20
      '
    >
      {/* Curved soft-blend pixel texture background */}
      <div
        ref={pixelContainerRef}
        data-pixel-background
        aria-hidden='true'
        className='
          pointer-events-none absolute inset-x-0 top-0 z-0 h-[480px]
          overflow-hidden select-none
          sm:h-[520px]
          md:h-[580px]
        '
      >
        <PixelMeshBackground
          ref={pixelMeshRef}
          initialProgress={0}
          maskGradient='radial-gradient(ellipse 80% 70% at 50% 15%, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.85) 40%, rgba(0, 0, 0, 0.45) 65%, rgba(0, 0, 0, 0.1) 85%, transparent 100%)'
          className='
            size-full opacity-35
            dark:opacity-55
          '
        />
      </div>

      <SectionContainer
        className='
        relative z-10 px-4
        sm:px-6
      '
      >
        {/* Header dengan margin bawah yang proporsional agar tidak mepet dengan toolbox */}
        <SectionHeader
          ref={headerRef}
          data-reviews-reveal
          className='
            mb-10
            sm:mb-12
            md:mb-14
          '
          eyebrow='Ulasan Pasien'
          headingAs='h1'
          headingSize='display'
          title={
            <>
              <span
                className='
                inline
                md:hidden
              '
              >
                Telah Dipercaya Banyak Keluarga
              </span>
              <span
                className='
                hidden
                md:inline
              '
              >
                Mereka yang Telah Mempercayai Klinik Pratama Amanah Healthcare
              </span>
            </>
          }
          description='Setiap kunjungan membawa cerita, dari pemeriksaan hingga momen penting bersama keluarga.'
          descriptionSize='lead'
        />

        {/* Pembungkus terpadu Toolbox dan Grid dengan jarak proporsional */}
        <div
          className='
          flex flex-col gap-6
          sm:gap-8
        '
        >
          <ReviewsToolbox
            filteredCount={filteredCount}
            isFiltered={isFiltered}
            onPhotosFilterChange={setPhotosFilter}
            onRatingSortChange={setRatingSort}
            onResetFilters={resetFilters}
            onResponseFilterChange={setResponseFilter}
            onSearchChange={setSearchQuery}
            photosFilter={photosFilter}
            ratingSort={ratingSort}
            responseFilter={responseFilter}
            searchQuery={searchQuery}
            totalCount={totalCount}
            visibleCount={visibleCount}
          />

          {visibleReviews.length > 0 ? (
            <>
              <div
                ref={gridRef}
                data-reviews-grid
                className='
                      grid grid-cols-1 gap-5
                      md:grid-cols-2 md:gap-6
                      xl:grid-cols-3
                      2xl:grid-cols-4
                    '
              >
                {visibleReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} onImageOpen={onImageOpen} />
                ))}
              </div>

              {hasMore && (
                <div
                  className='
                      mt-8 flex flex-col items-center justify-center gap-2.5
                      sm:mt-10
                    '
                >
                  <button
                    type='button'
                    onClick={() => loadMore()}
                    className='
                          group/load-more inline-flex cursor-pointer
                          items-center gap-3 border border-line bg-card px-6
                          py-3 text-xs font-bold tracking-wider text-foreground
                          uppercase shadow-xs transition-all duration-300
                          hover:border-amanah-blue/50 hover:bg-muted/30
                          hover:text-amanah-blue
                          focus-visible:ring-2 focus-visible:ring-ring
                          focus-visible:outline-none
                          sm:text-sm
                        '
                    aria-label='Muat ulasan lainnya'
                  >
                    <span className='relative'>
                      Muat Lainnya
                      <span
                        className='
                              absolute -bottom-0.5 left-0 h-px w-0
                              bg-amanah-blue transition-all duration-300
                              group-hover/load-more:w-full
                            '
                      />
                    </span>
                    <MarqueeArrowIndicator />
                  </button>
                  <span className='text-[11px] text-muted-foreground'>
                    Tersisa {filteredCount - visibleCount} ulasan lagi
                  </span>
                </div>
              )}

              {!hasMore && filteredCount > 12 && (
                <div className='mt-8 flex items-center justify-center'>
                  <span className='text-xs text-muted-foreground'>
                    Semua {filteredCount} ulasan telah ditampilkan
                  </span>
                </div>
              )}
            </>
          ) : (
            <div
              className='
                  flex flex-col items-center justify-center border border-dashed
                  border-line bg-card/40 px-6 py-16 text-center
                  sm:py-20
                '
            >
              <div
                className='
                    mb-4 flex size-12 items-center justify-center rounded-none
                    bg-muted text-muted-foreground
                  '
              >
                <Search className='size-6' />
              </div>
              <h3
                className='
                    text-base font-semibold text-foreground
                    sm:text-lg
                  '
              >
                Tidak ada ulasan yang sesuai
              </h3>
              <p
                className='
                    mt-2 max-w-md text-xs text-muted-foreground
                    sm:text-sm
                  '
              >
                Coba sesuaikan kata kunci pencarian Anda atau reset filter untuk melihat ulasan
                lainnya.
              </p>
              <button
                type='button'
                onClick={resetFilters}
                className='
                      mt-6 inline-flex cursor-pointer items-center gap-2 border
                      border-line bg-background px-4 py-2 text-xs font-semibold
                      text-foreground transition-colors
                      hover:bg-muted
                    '
              >
                <RotateCcw className='size-3.5' />
                <span>Reset Semua Filter</span>
              </button>
            </div>
          )}
        </div>
      </SectionContainer>
    </section>
  );
}
