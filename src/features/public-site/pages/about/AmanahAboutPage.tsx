import { Fragment } from 'react';
import { HealthcareShell, TechnicalDivider } from '@/features/public-site/components/shared';
import { AboutCarouselSection } from './components/organisms/AboutCarouselSection';
import { AboutHeroSection } from './components/organisms/AboutHeroSection';
import { AboutVisionMissionSection } from './components/organisms/AboutVisionMissionSection';
import { EditorialStorySection } from './components/organisms/EditorialStorySection';
import { StackedBlocksSection } from './components/organisms/StackedBlocksSection';
import {
  aboutEditorialStories,
  aboutHeroData,
  aboutVisionMissionData,
  aboutVisualBandData
} from './data';

type AmanahAboutPageProps = {
  locale?: string;
};

export function AmanahAboutPage({ locale }: AmanahAboutPageProps) {
  return (
    <HealthcareShell activePath='/tentang-kami' locale={locale}>
      <AboutHeroSection heroData={aboutHeroData} visualData={aboutVisualBandData} />
      <AboutCarouselSection />
      <TechnicalDivider />
      <AboutVisionMissionSection data={aboutVisionMissionData} />
      <TechnicalDivider />
      {aboutEditorialStories.map((story, index) => (
        <Fragment key={story.id}>
          {index > 0 && <TechnicalDivider />}
          <EditorialStorySection data={story} hasBorderBottom={false} />
        </Fragment>
      ))}
      <TechnicalDivider />
      <StackedBlocksSection />
    </HealthcareShell>
  );
}
