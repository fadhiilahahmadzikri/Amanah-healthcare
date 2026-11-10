import type { HealthcareFAQItem } from './types';
import { FAQSection } from './components/organisms/FAQSection';

type HealthcareFAQProps = {
  activePath: string;
  className?: string;
  locale?: string;
  initialItems?: HealthcareFAQItem[];
};

export function HealthcareFAQ({
  activePath,
  className,
  locale,
  initialItems
}: HealthcareFAQProps) {
  return (
    <FAQSection
      activePath={activePath}
      className={className}
      locale={locale}
      initialItems={initialItems}
    />
  );
}
