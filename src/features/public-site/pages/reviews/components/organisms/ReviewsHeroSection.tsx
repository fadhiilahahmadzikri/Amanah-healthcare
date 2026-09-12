import type { HealthcareReviewsSummary } from '../../types';
import {
  CalendarClockIcon,
  ExternalLinkIcon,
  MapPinnedIcon,
  MessageCircleIcon,
  StarIcon
} from 'lucide-react';
import { SectionContainer, SectionHeader } from '@/features/public-site/components/shared';
import { Badge } from '@/features/public-site/components/ui/badge';
import { ReviewStars } from '../atoms/ReviewStars';

type ReviewsHeroSectionProps = {
  summary: HealthcareReviewsSummary;
};

export function ReviewsHeroSection({ summary }: ReviewsHeroSectionProps) {
  return (
    <section
      className='
      relative overflow-hidden bg-background py-14
      sm:py-16
      md:py-20
    '
    >
      <SectionContainer
        className='
        relative px-4
        sm:px-6
      '
      >
        <SectionHeader
          data-reviews-reveal
          eyebrow='Ulasan Pasien'
          headingAs='h1'
          headingSize='display'
          headingClassName='max-w-5xl'
          title='Dipercaya Pasien dan Keluarga'
          description='Lihat pengalaman pasien yang sudah berkunjung ke Klinik Amanah HealthCare, langsung dari ulasan Google Maps.'
          descriptionSize='lead'
        />

        <div
          data-review-summary
          className='
            mt-10 overflow-hidden border border-line bg-surface
            shadow-amanah-card
          '
        >
          <div
            className='
            grid gap-px bg-line
            md:grid-cols-[1.2fr_0.9fr_0.9fr_1fr]
          '
          >
            <div
              className='
              bg-background p-5
              sm:p-6
            '
            >
              <div className='flex items-center gap-2 text-muted-foreground'>
                <MapPinnedIcon aria-hidden className='size-4' />
                <span className='amanah-type-caption font-semibold uppercase'>Google Maps</span>
              </div>
              <p className='mt-3 amanah-type-card-title text-foreground'>{summary.placeTitle}</p>
              <a
                href={summary.sourceUrl}
                target='_blank'
                rel='noreferrer'
                className='
                  mt-4 inline-flex items-center gap-2 amanah-type-small
                  font-semibold text-amanah-blue underline-offset-4
                  transition-colors
                  hover:text-foreground hover:underline
                '
              >
                Buka sumber ulasan
                <ExternalLinkIcon aria-hidden className='size-4' />
              </a>
            </div>

            <div
              className='
              bg-background p-5
              sm:p-6
            '
            >
              <div className='flex items-center gap-2 text-muted-foreground'>
                <StarIcon aria-hidden className='size-4' />
                <span className='amanah-type-caption font-semibold uppercase'>Rating</span>
              </div>
              <div className='mt-3 flex items-end gap-3'>
                <span
                  className='
                  text-5xl leading-none font-semibold text-foreground
                '
                >
                  {summary.overallRatingLabel}
                </span>
                <span className='pb-1 amanah-type-small text-muted-foreground'>/ 5</span>
              </div>
              <ReviewStars
                rating={Math.round(summary.overallRatingValue)}
                className='mt-3'
                iconClassName='size-5'
              />
            </div>

            <div
              className='
              bg-background p-5
              sm:p-6
            '
            >
              <div className='flex items-center gap-2 text-muted-foreground'>
                <MessageCircleIcon aria-hidden className='size-4' />
                <span className='amanah-type-caption font-semibold uppercase'>Total</span>
              </div>
              <p
                className='
                mt-3 text-4xl leading-none font-semibold text-foreground
              '
              >
                {summary.totalReviewsScraped}
              </p>
              <Badge variant='secondary' className='mt-4'>
                {summary.totalReviewsClaimed}
              </Badge>
            </div>

            <div
              className='
              bg-background p-5
              sm:p-6
            '
            >
              <div className='flex items-center gap-2 text-muted-foreground'>
                <CalendarClockIcon aria-hidden className='size-4' />
                <span className='amanah-type-caption font-semibold uppercase'>Diperbarui</span>
              </div>
              <p className='mt-3 amanah-type-card-title text-foreground'>
                {summary.scrapedAtLabel}
              </p>
              <p className='mt-3 amanah-type-caption text-muted-foreground'>
                Ringkasan ini membantu pasien mengenali kualitas layanan sebelum menentukan jadwal
                kunjungan.
              </p>
            </div>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
