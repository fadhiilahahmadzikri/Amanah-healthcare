'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SectionContainer } from '@/features/public-site/components/shared';
import { cn } from '@/features/public-site/lib/helpers';
import {
  catalogService,
  type ServiceCategoryCatalog
} from '@/features/klinik/api/catalog.service';
import type { ServiceCategorySection } from '../types';
import { ServiceStickyIndicator } from './molecules/ServiceStickyIndicator';
import { ServiceCategoryBlock } from './organisms/ServiceCategoryBlock';
import { Skeleton } from '@/components/ui/skeleton';

gsap.registerPlugin(ScrollTrigger);

type ServicesExperienceProps = {
  className?: string;
  initialCategories?: ServiceCategoryCatalog[];
};

export function ServicesExperience({ className, initialCategories }: ServicesExperienceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<ServiceCategoryCatalog[]>(initialCategories ?? []);
  const [isLoading, setIsLoading] = useState(!initialCategories || initialCategories.length === 0);
  const [activeContext, setActiveContext] = useState<string>(
    initialCategories?.[0]?.code || initialCategories?.[0]?.id || ''
  );

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setCategories(initialCategories);
      setActiveContext(initialCategories[0].code || initialCategories[0].id);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    catalogService
      .getServiceCatalog()
      .then((data) => {
        if (!isMounted) return;
        setCategories(data);
        if (data.length > 0) {
          setActiveContext(data[0].code || data[0].id);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load clinic catalog from backend:', err);
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [initialCategories]);

  const sections: ServiceCategorySection[] = useMemo(() => {
    return categories.map((cat, index) => {
      const sectionId = cat.code || cat.id;
      return {
        id: sectionId,
        contextKey: sectionId,
        indicatorLabel: cat.name,
        eyebrow: cat.poliklinikName ? `Layanan ${cat.poliklinikName}` : 'Kelompok Layanan',
        title: cat.name,
        description: cat.description || 'Layanan kesehatan profesional untuk Anda dan keluarga.',
        layout: index % 2 === 0 ? 'bento-left' : 'bento-right',
        services: (cat.services || []).map((srv) => ({
          id: srv.id,
          title: srv.name,
          description: srv.description || '',
          iconName: srv.iconName,
          image: srv.imageUrl
            ? {
                src: srv.imageUrl,
                alt: srv.name
              }
            : undefined,
          complaints: srv.complaints
        }))
      };
    });
  }, [categories]);

  const indicatorItems = useMemo(() => {
    return categories.map((cat) => ({
      id: cat.code || cat.id,
      label: cat.name,
      sublabel: cat.poliklinikName || 'Layanan Medis'
    }));
  }, [categories]);

  useGSAP(
    () => {
      if (sections.length === 0) {
        return;
      }

      const triggers: ScrollTrigger[] = [];

      sections.forEach((section) => {
        const el = document.getElementById(section.id);
        if (!el) {
          return;
        }

        const trigger = ScrollTrigger.create({
          trigger: el,
          start: 'top 60%',
          end: 'bottom 45%',
          onEnter: () => setActiveContext(section.id),
          onEnterBack: () => setActiveContext(section.id)
        });

        triggers.push(trigger);
      });

      return () => {
        triggers.forEach((t) => t.kill());
      };
    },
    { scope: containerRef, dependencies: [sections] }
  );

  const handleSelectContext = (contextId: string) => {
    setActiveContext(contextId);
    const targetEl = document.getElementById(contextId);
    if (targetEl) {
      if (typeof window !== 'undefined' && window.publicSiteLenis) {
        window.publicSiteLenis.scrollTo(targetEl, {
          offset: -105,
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t))
        });
      } else {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  if (isLoading) {
    return (
      <div className={cn('relative bg-background py-12', className)}>
        <SectionContainer className='px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col lg:flex-row gap-8'>
            <div className='w-full lg:w-[220px] xl:w-[240px] space-y-3 shrink-0'>
              <Skeleton className='h-12 w-full rounded-lg' />
              <Skeleton className='h-12 w-full rounded-lg' />
            </div>
            <div className='flex-1 space-y-6'>
              <Skeleton className='h-8 w-1/3 rounded-md' />
              <Skeleton className='h-4 w-2/3 rounded-md' />
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pt-4'>
                <Skeleton className='h-48 w-full rounded-xl' />
                <Skeleton className='h-48 w-full rounded-xl' />
                <Skeleton className='h-48 w-full rounded-xl' />
                <Skeleton className='h-48 w-full rounded-xl' />
              </div>
            </div>
          </div>
        </SectionContainer>
      </div>
    );
  }

  if (sections.length === 0) {
    return null;
  }

  return (
    <div ref={containerRef} className={cn('relative bg-background', className)}>
      <SectionContainer className='px-0 sm:px-0'>
        <div className='flex flex-col lg:flex-row lg:items-stretch'>
          {/* Left Column: Dynamic category navigation indicator */}
          <aside
            className='
              sticky top-12 z-30 shrink-0 border-b border-line bg-background/95
              p-0 backdrop-blur-md
              lg:static lg:top-auto lg:z-auto lg:mb-[72px] lg:w-[220px]
              lg:border-r lg:border-b-0 lg:bg-background lg:pt-[72px]
              lg:backdrop-blur-none
              xl:mb-20 xl:w-[240px] xl:pt-20
            '
          >
            <div className='w-full lg:sticky lg:top-20 lg:z-20'>
              <ServiceStickyIndicator
                items={indicatorItems}
                activeContext={activeContext}
                onSelectContext={handleSelectContext}
                className='w-full'
              />
            </div>
          </aside>

          {/* Right Column: Dynamic service category blocks */}
          <div className='min-w-0 flex-1 divide-y divide-line'>
            {sections.map((section) => (
              <div
                key={section.id}
                className='
                  p-4
                  sm:p-6
                  lg:p-8
                  xl:p-10
                '
              >
                <ServiceCategoryBlock section={section} />
              </div>
            ))}
          </div>
        </div>
      </SectionContainer>
    </div>
  );
}
