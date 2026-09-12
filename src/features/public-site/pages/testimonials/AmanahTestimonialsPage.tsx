import { HealthcareShell, TechnicalDivider } from '@/features/public-site/components/shared';
import { TestimonialsHeroSection } from './components/organisms/TestimonialsHeroSection';
import { TestimonialsList } from './components/organisms/TestimonialsList';
import { testimonialsHeroData, testimonialShowcaseItems } from './data';

type AmanahTestimonialsPageProps = {
  locale?: string;
};

export function AmanahTestimonialsPage({ locale }: AmanahTestimonialsPageProps) {
  return (
    <HealthcareShell activePath='/testimoni' locale={locale}>
      {/* DNS Prefetch & Preconnect untuk akselerasi YouTube player CDN */}
      <link rel='preconnect' href='https://www.youtube-nocookie.com' />
      <link rel='preconnect' href='https://i.ytimg.com' />
      <link rel='dns-prefetch' href='https://www.youtube-nocookie.com' />
      <link rel='dns-prefetch' href='https://i.ytimg.com' />

      <TestimonialsHeroSection data={testimonialsHeroData} />
      <TechnicalDivider />
      <TestimonialsList items={testimonialShowcaseItems} />
      <TechnicalDivider />
    </HealthcareShell>
  );
}
