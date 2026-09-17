import { HealthcareShell } from '@/features/public-site/components/shared';
import { ContactSection } from '@/features/public-site/pages/home/components/ContactSection';

type AmanahContactPageProps = {
  locale?: string;
};

export function AmanahContactPage({ locale }: AmanahContactPageProps) {
  return (
    <HealthcareShell activePath='/kontak' locale={locale}>
      <ContactSection headingAs='h1' />
    </HealthcareShell>
  );
}
