import { TechnicalDivider } from '@/features/public-site/components/shared';
import {
  FacilitiesCarouselSection,
  ServicesExperience,
  ServicesHeroSection
} from '@/features/public-site/pages/services';

export function ServicesSection() {
  return (
    <section id='layanan' className='bg-background'>
      <ServicesHeroSection />
      <TechnicalDivider />
      <FacilitiesCarouselSection />
      <TechnicalDivider />
      <ServicesExperience />
    </section>
  );
}
