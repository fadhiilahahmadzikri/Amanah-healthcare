import { Accordion } from '@/features/public-site/components/ui/accordion';
import { AppConfig } from '@/features/public-site/lib/app-config';
import { SectionContainer } from '../../../SectionContainer';
import { SectionHeader } from '../../../SectionHeader';
import {
  createHealthcareFAQJsonLd,
  getHealthcareFAQItems,
  healthcareFAQSectionCopy
} from '../../data';
import { FAQJsonLd } from '../atoms/FAQJsonLd';
import { FAQAccordionItem } from '../molecules/FAQAccordionItem';

type FAQSectionProps = {
  activePath: string;
  className?: string;
  locale?: string;
};

export function FAQSection({
  activePath,
  className,
  locale = AppConfig.i18n.defaultLocale
}: FAQSectionProps) {
  const items = getHealthcareFAQItems(activePath);
  const schema = createHealthcareFAQJsonLd({ activePath, items, locale });

  if (items.length === 0) {
    return null;
  }

  return (
    <section id='faq' aria-label='FAQ Klinik Amanah Healthcare' className={className}>
      <FAQJsonLd schema={schema} />
      <SectionContainer
        className='
        px-0
        sm:px-0
      '
      >
        <div
          className='
          bg-background px-5 py-14
          sm:px-6 sm:py-20
          md:px-10 md:py-24
        '
        >
          <SectionHeader
            eyebrow={healthcareFAQSectionCopy.eyebrow}
            title={healthcareFAQSectionCopy.title}
            description={healthcareFAQSectionCopy.description}
            headingSize='section'
            descriptionSize='lead'
            maskAnimation={false}
          />

          <div className='mx-auto mt-10 max-w-4xl border-y border-line'>
            <Accordion type='single' collapsible defaultValue={items[0]?.id}>
              {items.map((item) => (
                <FAQAccordionItem key={item.id} item={item} />
              ))}
            </Accordion>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
