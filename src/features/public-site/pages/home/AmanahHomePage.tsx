import { HealthcareShell, TechnicalDivider } from '@/features/public-site/components/shared';
import { AppointmentSection } from './components/AppointmentSection';
import { FacilitiesSection } from './components/FacilitiesSection';
import { HeroSection } from './components/HeroSection';
import { KhitanShowcaseSection } from './components/KhitanShowcaseSection';
import { ProfessionalDoctorsSection } from './components/ProfessionalDoctorsSection';
import { ReviewsMarqueeSection } from './components/organisms/ReviewsMarqueeSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { TrustHighlights } from './components/TrustHighlights';

type AmanahHomePageProps = {
  locale?: string;
};

export function AmanahHomePage({ locale }: AmanahHomePageProps) {
  return (
    <HealthcareShell activePath='/' locale={locale}>
      <HeroSection />
      <TechnicalDivider className='lg:hidden' />
      <TrustHighlights />
      <TechnicalDivider />
      <ReviewsMarqueeSection />
      <TechnicalDivider />
      <FacilitiesSection />
      <TechnicalDivider />
      <ProfessionalDoctorsSection />
      <TechnicalDivider />
      <KhitanShowcaseSection />
      <TechnicalDivider />
      <AppointmentSection />
      <TechnicalDivider />
      <TestimonialsSection />
    </HealthcareShell>
  );
}
