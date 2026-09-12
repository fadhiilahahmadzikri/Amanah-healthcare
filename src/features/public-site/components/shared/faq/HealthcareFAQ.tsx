import { FAQSection } from './components/organisms/FAQSection';

type HealthcareFAQProps = {
  activePath: string;
  className?: string;
  locale?: string;
};

export function HealthcareFAQ({ activePath, className, locale }: HealthcareFAQProps) {
  return <FAQSection activePath={activePath} className={className} locale={locale} />;
}
