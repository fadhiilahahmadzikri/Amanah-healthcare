import { HealthcareHeading, HealthcareText } from '@/features/public-site/components/shared';
import { cn } from '@/features/public-site/lib/helpers';

type EditorialStoryContentProps = {
  className?: string;
  description: string;
  title: string;
};

export function EditorialStoryContent({
  className,
  description,
  title
}: EditorialStoryContentProps) {
  return (
    <div
      className={cn(
        `
          flex flex-col justify-center p-6
          sm:p-10
          lg:p-14
        `,
        className
      )}
    >
      <div className='max-w-xl'>
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
        <div className='-mb-2 overflow-hidden pb-2'>
          <HealthcareText
            data-mask-text
            size='body'
            className='
              mt-5 inline-block text-muted-foreground will-change-transform
              sm:mt-6
            '
          >
            {description}
          </HealthcareText>
        </div>
      </div>
    </div>
  );
}
