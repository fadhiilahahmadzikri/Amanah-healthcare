import type { ServiceCardItem } from '../../types';
import { cn } from '@/features/public-site/lib/helpers';
import { ServiceBentoCard } from '../molecules/ServiceBentoCard';

type ServiceBentoGridProps = {
  items: ServiceCardItem[];
  className?: string;
};

function getServiceCardGridClassName(index: number, totalItems: number) {
  const isSingleLastCard = totalItems % 2 === 1 && index === totalItems - 1;

  return isSingleLastCard
    ? 'col-span-12 sm:col-span-12 md:col-span-12'
    : 'col-span-12 sm:col-span-6 md:col-span-6';
}

export function ServiceBentoGrid({ items, className }: ServiceBentoGridProps) {
  return (
    <div
      className={cn(
        `
          grid grid-cols-12 gap-3
          sm:gap-4
        `,
        className
      )}
    >
      {items.map((item, index) => (
        <ServiceBentoCard
          key={item.id}
          item={item}
          className={getServiceCardGridClassName(index, items.length)}
        />
      ))}
    </div>
  );
}
