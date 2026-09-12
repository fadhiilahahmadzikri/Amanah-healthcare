import type { HealthcareFAQItem } from '../../types';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/features/public-site/components/ui/accordion';
import { FAQAnswerText } from '../atoms/FAQAnswerText';
import { FAQQuestionText } from '../atoms/FAQQuestionText';

type FAQAccordionItemProps = {
  item: HealthcareFAQItem;
};

export function FAQAccordionItem({ item }: FAQAccordionItemProps) {
  return (
    <AccordionItem value={item.id} className='border-line/80'>
      <AccordionTrigger
        className='
        py-5
        sm:py-6
      '
      >
        <FAQQuestionText>{item.question}</FAQQuestionText>
      </AccordionTrigger>
      <AccordionContent
        className='
        pr-8 pb-6
        sm:pr-12
      '
      >
        <FAQAnswerText>{item.answer}</FAQAnswerText>
      </AccordionContent>
    </AccordionItem>
  );
}
