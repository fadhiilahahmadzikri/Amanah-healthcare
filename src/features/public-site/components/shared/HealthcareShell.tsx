import type { ReactNode } from 'react';
import { HealthcareFAQ } from './faq';
import { HealthcareChatFab } from './HealthcareChatFab';
import { HealthcareFooter } from './HealthcareFooter';
import { HealthcareHeader } from './HealthcareHeader';
import { MedicalClinicJsonLd } from './MedicalClinicJsonLd';
import { SmoothScroll } from './SmoothScroll';
import { TechnicalDivider } from './TechnicalDivider';

type HealthcareShellProps = {
  activePath: string;
  children: ReactNode;
  locale?: string;
};

export function HealthcareShell({ activePath, children, locale }: HealthcareShellProps) {
  return (
    <div className='min-h-screen overflow-x-clip bg-background text-foreground'>
      <MedicalClinicJsonLd />
      <SmoothScroll />
      <HealthcareHeader activePath={activePath} locale={locale} />
      <main
        className='
        mx-auto max-w-[1300px] overflow-x-clip border-x-2 border-line
      '
      >
        {children}
        <TechnicalDivider />
        <HealthcareFAQ activePath={activePath} locale={locale} />
      </main>
      <div className='mx-auto max-w-[1300px] border-x-2 border-line'>
        <TechnicalDivider />
      </div>
      <HealthcareChatFab />
      <HealthcareFooter locale={locale} />
    </div>
  );
}
