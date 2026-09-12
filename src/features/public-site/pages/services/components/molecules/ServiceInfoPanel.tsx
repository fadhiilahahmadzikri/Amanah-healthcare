'use client';

import type { ReactNode } from 'react';
import {
  AmanahScriptText,
  HealthcareHeading,
  HealthcareText
} from '@/features/public-site/components/shared';
import { PixelMeshBackground } from '@/features/public-site/pages/about/components/atoms/PixelMeshBackground';
import { cn } from '@/features/public-site/lib/helpers';

type ServiceInfoPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
  actionSlot?: ReactNode;
  footerSlot?: ReactNode;
};

export function ServiceInfoPanel({
  eyebrow,
  title,
  description,
  className,
  actionSlot,
  footerSlot
}: ServiceInfoPanelProps) {
  return (
    <div
      className={cn(
        `
          relative flex h-full flex-col justify-start overflow-hidden py-2
          lg:min-h-[calc(100vh-7rem)]
        `,
        className
      )}
    >
      <div
        aria-hidden='true'
        className='
          pointer-events-none absolute inset-x-0 bottom-0 z-0 hidden h-[72%]
          overflow-hidden select-none
          lg:block
        '
      >
        <PixelMeshBackground
          initialProgress={1}
          progress={1}
          maskGradient='linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.82) 46%, rgba(0, 0, 0, 0.44) 68%, rgba(0, 0, 0, 0.14) 84%, transparent 100%)'
          className='
            size-full opacity-40
            dark:opacity-60
          '
        />
      </div>

      <div className='relative z-10 flex flex-col items-start'>
        <div className='-mb-2 overflow-hidden pb-2'>
          <AmanahScriptText className='inline-block text-foreground'>{eyebrow}</AmanahScriptText>
        </div>

        <div
          className='
          -mb-3 overflow-hidden pb-3
          md:-mb-4 md:pb-4
        '
        >
          <HealthcareHeading as='h3' size='subsection' className='text-foreground'>
            {title}
          </HealthcareHeading>
        </div>

        <HealthcareText
          size='body'
          className='
            mt-4 max-w-md text-muted-foreground
            sm:mt-5
          '
        >
          {description}
        </HealthcareText>

        {actionSlot && (
          <div
            className='
            mt-4
            sm:mt-5
          '
          >
            {actionSlot}
          </div>
        )}
      </div>

      {footerSlot && (
        <div className='relative z-10 mt-6 border-t border-line/60 pt-6'>{footerSlot}</div>
      )}
    </div>
  );
}
