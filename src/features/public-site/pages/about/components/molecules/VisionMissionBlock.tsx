import type { PixelFeatureIcon } from '../../types';
import { HealthcareHeading, HealthcareText } from '@/features/public-site/components/shared';
import { cn } from '@/features/public-site/lib/helpers';
import { DecorativeMarker } from '../atoms/DecorativeMarker';
import { PixelIconBadge } from '../atoms/PixelIconBadge';

type VisionMissionBlockProps = {
  className?: string;
  description: string;
  icon?: PixelFeatureIcon;
  title: string;
};

export function VisionMissionBlock({
  className,
  description,
  icon,
  title
}: VisionMissionBlockProps) {
  return (
    <article
      className={cn(
        `
          flex h-full flex-col justify-start p-6
          sm:p-10
          lg:p-12
        `,
        className
      )}
    >
      <div className='flex flex-col items-start gap-4'>
        <div data-vm-icon className='will-change-transform'>
          {icon ? <PixelIconBadge icon={icon} size={32} /> : <DecorativeMarker />}
        </div>
        <div className='-mb-2 overflow-hidden pb-2'>
          <HealthcareHeading
            as='h2'
            data-mask-text
            size='subsection'
            className='
              inline-block font-medium text-foreground will-change-transform
            '
          >
            {title}
          </HealthcareHeading>
        </div>
      </div>
      <div className='-mb-2 overflow-hidden pb-2'>
        <HealthcareText
          data-mask-text
          size='body'
          className='
            mt-5 inline-block max-w-lg text-muted-foreground
            will-change-transform
          '
        >
          {description}
        </HealthcareText>
      </div>
    </article>
  );
}
