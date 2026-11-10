import type { ReactNode } from 'react';
import { HealthcareFAQ } from './faq';
import { HealthcareFooter } from './HealthcareFooter';
import { HealthcareHeader } from './HealthcareHeader';
import { MedicalClinicJsonLd } from './MedicalClinicJsonLd';
import { SmoothScroll } from './SmoothScroll';
import { TechnicalDivider } from './TechnicalDivider';
import { ConsultationWidget } from '@/features/chat/components/consultation-widget';
import {
  PromotionsProvider,
  PromoBanner,
  PromoModal,
} from '@/features/promotions';

type HealthcareShellProps = {
  activePath: string;
  children: ReactNode;
  locale?: string;
  showFaq?: boolean;
};

export function HealthcareShell({
  activePath,
  children,
  locale,
  showFaq = true
}: HealthcareShellProps) {
  return (
    <PromotionsProvider>
      <div className='min-h-screen overflow-x-clip bg-background text-foreground'>
        <MedicalClinicJsonLd />
        <SmoothScroll />
        <div className='sticky top-0 z-50 w-full'>
          <PromoBanner />
          <HealthcareHeader activePath={activePath} locale={locale} />
        </div>
        <main
          className='
          mx-auto max-w-[1300px] overflow-x-clip border-x-2 border-line
        '
        >
          {children}
          {showFaq ? (
            <>
              <TechnicalDivider />
              <HealthcareFAQ activePath={activePath} locale={locale} />
            </>
          ) : null}
        </main>
        <div className='mx-auto max-w-[1300px] border-x-2 border-line'>
          {showFaq ? <TechnicalDivider /> : null}
        </div>
        <ConsultationWidget />
        <HealthcareFooter locale={locale} />
        <PromoModal />
      </div>
    </PromotionsProvider>
  );
}
