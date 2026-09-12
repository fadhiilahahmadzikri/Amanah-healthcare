import { HealthcareShell, TechnicalDivider } from '@/features/public-site/components/shared';
import { FacilitiesCarouselSection } from './components/organisms/FacilitiesCarouselSection';
import { ServicesHeroSection } from './components/organisms/ServicesHeroSection';
import { ServicesExperience } from './components/ServicesExperience';

type AmanahServicesPageProps = {
  activePath?: string;
  locale?: string;
};

export function AmanahServicesPage({ activePath = '/fasilitas', locale }: AmanahServicesPageProps) {
  return (
    <HealthcareShell activePath={activePath} locale={locale}>
      <ServicesHeroSection />
      <TechnicalDivider />
      <FacilitiesCarouselSection />
      <TechnicalDivider />
      <ServicesExperience />
    </HealthcareShell>
  );
}
