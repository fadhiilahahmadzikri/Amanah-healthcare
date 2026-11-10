'use client';

import { useEffect, useState } from 'react';
import { Accordion } from '@/features/public-site/components/ui/accordion';
import { AppConfig } from '@/features/public-site/lib/app-config';
import { SectionContainer } from '../../../SectionContainer';
import { SectionHeader } from '../../../SectionHeader';
import {
  createHealthcareFAQJsonLd,
  healthcareFAQSectionCopy
} from '../../data';
import type { HealthcareFAQItem } from '../../types';
import { publicContentService } from '@/features/public-site/api/public-content.service';
import { FAQJsonLd } from '../atoms/FAQJsonLd';
import { FAQAccordionItem } from '../molecules/FAQAccordionItem';

type FAQSectionProps = {
  activePath: string;
  className?: string;
  locale?: string;
  initialItems?: HealthcareFAQItem[];
};

export function FAQSection({
  activePath,
  className,
  locale = AppConfig.i18n.defaultLocale,
  initialItems
}: FAQSectionProps) {
  const [items, setItems] = useState<HealthcareFAQItem[]>(initialItems || []);
  const [isLoading, setIsLoading] = useState(!initialItems || initialItems.length === 0);

  useEffect(() => {
    if (initialItems && initialItems.length > 0) {
      setItems(initialItems);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    publicContentService
      .getFaqs(activePath)
      .then((data) => {
        if (isMounted) {
          setItems(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch FAQs on client:', err);
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activePath, initialItems]);

  const schema = createHealthcareFAQJsonLd({ activePath, items, locale });

  if (items.length === 0 && !isLoading) {
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
            {isLoading && items.length === 0 ? (
              <div className='space-y-4 py-8'>
                <div className='h-12 w-full animate-pulse bg-muted/30' />
                <div className='h-12 w-full animate-pulse bg-muted/30' />
                <div className='h-12 w-full animate-pulse bg-muted/30' />
              </div>
            ) : (
              <Accordion type='single' collapsible defaultValue={items[0]?.id}>
                {items.map((item) => (
                  <FAQAccordionItem key={item.id} item={item} />
                ))}
              </Accordion>
            )}
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
