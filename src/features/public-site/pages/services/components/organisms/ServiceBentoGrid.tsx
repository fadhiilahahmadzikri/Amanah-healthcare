import type { ServiceCardItem } from '../../types';
import { cn } from '@/features/public-site/lib/helpers';
import { ServiceBentoCard } from '../molecules/ServiceBentoCard';

type ServiceBentoGridProps = {
  items: ServiceCardItem[];
  className?: string;
  cardClassName?: string | ((item: ServiceCardItem, index: number) => string);
  getItemAriaLabel?: (item: ServiceCardItem) => string;
  onItemSelect?: (item: ServiceCardItem) => void;
};

function getServiceCardGridClassName(index: number, totalItems: number) {
  const isSingleLastCard = totalItems % 2 === 1 && index === totalItems - 1;

  return isSingleLastCard
    ? 'col-span-12 sm:col-span-12 md:col-span-12'
    : 'col-span-12 sm:col-span-6 md:col-span-6';
}

export function ServiceBentoGrid({
  items,
  className,
  cardClassName,
  getItemAriaLabel,
  onItemSelect
}: ServiceBentoGridProps) {
  const isInteractive = Boolean(onItemSelect);

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
      {items.map((item, index) => {
        const resolvedCardClassName =
          typeof cardClassName === 'function' ? cardClassName(item, index) : cardClassName;

        return (
          <ServiceBentoCard
            key={item.id}
            item={item}
            role={isInteractive ? 'button' : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            aria-label={
              isInteractive ? getItemAriaLabel?.(item) || `Pilih layanan ${item.title}` : undefined
            }
            onClick={isInteractive ? () => onItemSelect?.(item) : undefined}
            onKeyDown={
              isInteractive
                ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onItemSelect?.(item);
                    }
                  }
                : undefined
            }
            className={cn(getServiceCardGridClassName(index, items.length), resolvedCardClassName)}
          />
        );
      })}
    </div>
  );
}
