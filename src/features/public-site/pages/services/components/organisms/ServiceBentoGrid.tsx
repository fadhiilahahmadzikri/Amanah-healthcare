'use client';

import * as React from 'react';
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

function getScrollParent(node: HTMLElement | null): HTMLElement | Window {
  if (!node || typeof window === 'undefined') return window;
  let parent = node.parentElement;
  while (parent && parent !== document.body) {
    const { overflowY } = window.getComputedStyle(parent);
    if (overflowY === 'auto' || overflowY === 'scroll') {
      return parent;
    }
    parent = parent.parentElement;
  }
  return window;
}

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
  const gridRef = React.useRef<HTMLDivElement>(null);
  const [activeCardId, setActiveCardId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const gridEl = gridRef.current;
    if (!gridEl) return;

    let rafId: number | null = null;

    const updateActiveCard = () => {
      if (!mediaQuery.matches) {
        setActiveCardId(null);
        return;
      }

      const cardEls = gridEl.querySelectorAll<HTMLElement>('[data-service-card]');
      if (cardEls.length === 0) return;

      const scrollParent = getScrollParent(gridEl);
      let targetCenterY: number;

      if (scrollParent === window) {
        targetCenterY = window.innerHeight / 2;
      } else {
        const parentRect = (scrollParent as HTMLElement).getBoundingClientRect();
        targetCenterY = parentRect.top + parentRect.height / 2;
      }

      let closestId: string | null = null;
      let minDistance = Number.POSITIVE_INFINITY;

      for (const card of cardEls) {
        const rect = card.getBoundingClientRect();
        const cardCenterY = rect.top + rect.height / 2;
        const dist = Math.abs(cardCenterY - targetCenterY);

        if (dist < minDistance) {
          minDistance = dist;
          closestId = card.getAttribute('data-card-id');
        }
      }

      if (closestId) {
        setActiveCardId(closestId);
      }
    };

    const handleScrollOrResize = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateActiveCard);
    };

    updateActiveCard();

    const scrollParent = getScrollParent(gridEl);
    scrollParent.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      scrollParent.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [items]);

  return (
    <div
      ref={gridRef}
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
            isCenterActive={item.id === activeCardId}
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
