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
      <TestimonialsHeroSection data={testimonialsHeroData} />
      <TechnicalDivider />
      <TestimonialsList items={testimonialShowcaseItems} />
      <TechnicalDivider />
    </HealthcareShell>
  );
}
