import { HealthcareShell, TechnicalDivider } from '@/features/public-site/components/shared';
import type { ServiceCategoryCatalog } from '@/features/klinik/api/catalog.service';
import type { FacilityCarouselItem } from './types';
import { FacilitiesCarouselSection } from './components/organisms/FacilitiesCarouselSection';
import { ServicesHeroSection } from './components/organisms/ServicesHeroSection';
import { ServicesExperience } from './components/ServicesExperience';

type AmanahServicesPageProps = {
  activePath?: string;
  locale?: string;
  initialCategories?: ServiceCategoryCatalog[];
  initialFacilities?: FacilityCarouselItem[];
};

export function AmanahServicesPage({
  activePath = '/fasilitas',
  locale,
  initialCategories,
  initialFacilities
}: AmanahServicesPageProps) {
  return (
    <HealthcareShell activePath={activePath} locale={locale}>
      <ServicesHeroSection />
      <TechnicalDivider />
      <FacilitiesCarouselSection initialFacilities={initialFacilities} />
      <TechnicalDivider />
      <ServicesExperience initialCategories={initialCategories} />
    </HealthcareShell>
  );
}
