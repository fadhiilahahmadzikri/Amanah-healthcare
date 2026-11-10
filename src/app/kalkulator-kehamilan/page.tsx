import type { Metadata } from 'next';
import { PublicSiteRouteShell } from '@/features/public-site';
import {
  HealthcareShell,
  PixelMeshBackground,
  SectionContainer,
  SectionHeader,
  TechnicalDivider,
} from '@/features/public-site/components/shared';
import { PregnancyCalculatorForm } from '@/features/pregnancy-calculator';

export const metadata: Metadata = {
  title: 'Kalkulator Kehamilan dan HPL | Amanah Healthcare',
  description:
    'Hitung perkiraan tanggal lahir dan usia kehamilan Bunda secara akurat berdasarkan standar medis ACOG.',
};

export default function KalkulatorKehamilanPage() {
  return (
    <PublicSiteRouteShell>
      <HealthcareShell activePath="/kalkulator-kehamilan" showFaq={false}>
        <section className="relative overflow-hidden bg-background py-14 sm:py-16 md:py-20 min-h-[calc(100vh-14rem)]">
          {/* Header pixel texture with seamless downward gradient */}
          <div
            data-pixel-background
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[480px] overflow-hidden select-none sm:h-[520px] md:h-[580px]"
          >
            <PixelMeshBackground
              initialProgress={1}
              progress={1}
              maskGradient="linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.75) 35%, rgba(0, 0, 0, 0.2) 70%, transparent 100%)"
              className="size-full opacity-35 dark:opacity-55"
            />
          </div>

          <SectionContainer className="relative z-10 px-4 sm:px-6">
            <SectionHeader
              eyebrow="Layanan edukasi kesehatan ibu dan anak"
              headingAs="h1"
              headingSize="display"
              title="Kalkulator Kehamilan & HPL"
              description="Pantau perkembangan janin Bunda dan ketahui estimasi hari persalinan dengan panduan medis terpercaya dari Klinik Amanah Healthcare."
              descriptionSize="lead"
              className="mx-auto max-w-4xl text-center"
              maskAnimation={false}
            />

            <div className="mt-10 sm:mt-12">
              <PregnancyCalculatorForm variant="page" showHeader={false} />
            </div>
          </SectionContainer>
        </section>
        <TechnicalDivider />
      </HealthcareShell>
    </PublicSiteRouteShell>
  );
}
