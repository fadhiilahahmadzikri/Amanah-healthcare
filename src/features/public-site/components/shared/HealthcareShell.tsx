import type { ReactNode } from 'react';
import { HealthcareFAQ } from './faq';
import { HealthcareChatFab } from './HealthcareChatFab';
import { HealthcareFooter } from './HealthcareFooter';
import { HealthcareHeader } from './HealthcareHeader';
import { MedicalClinicJsonLd } from './MedicalClinicJsonLd';
import { SmoothScroll } from './SmoothScroll';
import { TechnicalDivider } from './TechnicalDivider';
import { ChatwootWidget } from '@/components/chatwoot/chatwoot-widget';

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
      <HealthcareChatFab />
      <ChatwootWidget />
      <HealthcareFooter locale={locale} />
    </div>
  );
}
