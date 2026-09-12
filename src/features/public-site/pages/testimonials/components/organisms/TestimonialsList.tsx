import type { TestimonialShowcaseItem } from '../../types';
import { Fragment } from 'react';
import { TechnicalDivider } from '@/features/public-site/components/shared';
import { TestimonialShowcaseBlock } from './TestimonialShowcaseBlock';

type TestimonialsListProps = {
  items: TestimonialShowcaseItem[];
};

export function TestimonialsList({ items }: TestimonialsListProps) {
  return (
    <div className='w-full'>
      {items.map((item, index) => (
        <Fragment key={item.id}>
          {index > 0 && <TechnicalDivider />}
          <TestimonialShowcaseBlock item={item} />
        </Fragment>
      ))}
    </div>
  );
}
