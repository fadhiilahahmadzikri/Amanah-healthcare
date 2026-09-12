import type { TestimonialShowcaseItem } from '../../types';
import {
  AmanahScriptText,
  ArrowCtaButton,
  HealthcareHeading,
  HealthcareText
} from '@/features/public-site/components/shared';

type TestimonialStoryContentProps = {
  item: TestimonialShowcaseItem;
};

export function TestimonialStoryContent({ item }: TestimonialStoryContentProps) {
  return (
    <div
      className='
        flex flex-1 flex-col justify-between p-6
        sm:p-8
        md:p-10
        lg:p-12
        xl:p-14
      '
    >
      {/* Group Atas: Pengalaman Nyata & Narasi Cerita */}
      <div className='flex flex-col'>
        <div
          data-content-item
          className='
            mb-3.5 overflow-hidden
            sm:mb-5
          '
        >
          <AmanahScriptText
            size='accent'
            className='
              inline-block font-semibold text-amanah-blue
              dark:text-amanah-sky
            '
          >
            {item.eyebrow}
          </AmanahScriptText>
        </div>

        {/* Headline Kutipan */}
        <div
          data-content-item
          className='
            mb-5 overflow-hidden
            sm:mb-6
          '
        >
          <HealthcareHeading
            as='h2'
            size='subsection'
            className='leading-snug font-medium text-foreground'
          >
            {item.quote}
          </HealthcareHeading>
        </div>

        {/* Isi teks narasi */}
        <div
          data-content-item
          className='
            flex flex-col gap-4 text-muted-foreground
            sm:gap-5
          '
        >
          {item.paragraphs.map((paragraph, pIndex) => (
            <HealthcareText
              key={paragraph.slice(0, 32)}
              size={pIndex === 0 ? 'body' : 'small'}
              className={`
                leading-relaxed
                ${pIndex === 0 ? 'text-muted-foreground' : 'text-muted-foreground/85'}
              `}
            >
              {paragraph}
            </HealthcareText>
          ))}
        </div>
      </div>

      {/* Identitas Pasien & Tombol Reservasi / Jadwalkan */}
      <div
        data-content-item
        className='
          mt-10 flex flex-col gap-5 border-t border-line pt-6
          sm:mt-12 sm:flex-row sm:items-center sm:justify-between sm:pt-8
        '
      >
        <div>
          <HealthcareText size='small' className='font-semibold text-foreground'>
            {item.authorName}
          </HealthcareText>
          <HealthcareText size='caption' className='text-muted-foreground'>
            {item.authorRole}
          </HealthcareText>
        </div>

        <div>
          <ArrowCtaButton href={item.ctaHref} treatment='primary'>
            {item.ctaLabel}
          </ArrowCtaButton>
        </div>
      </div>
    </div>
  );
}
