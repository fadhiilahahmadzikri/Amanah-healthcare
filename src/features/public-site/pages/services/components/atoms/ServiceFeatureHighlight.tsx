import { CheckIcon } from 'lucide-react';
import { cn } from '@/features/public-site/lib/helpers';

type ServiceFeatureHighlightProps = {
  title: string;
  primaryText?: string;
  secondaryText?: string;
  className?: string;
};

export function ServiceFeatureHighlight({
  title,
  primaryText,
  secondaryText,
  className
}: ServiceFeatureHighlightProps) {
  // If primary and secondary are not explicitly provided, split gracefully
  let line1 = primaryText;
  let line2 = secondaryText;

  if (!line1) {
    if (title.includes(' dan ')) {
      const parts = title.split(' dan ');
      line1 = parts[0];
      line2 = `dan ${parts[1]}`;
    } else if (title.includes(' ')) {
      const words = title.split(' ');
      if (words.length >= 3) {
        line1 = `${words[0]} ${words[1]}`;
        line2 = words.slice(2).join(' ');
      } else {
        line1 = words[0];
        line2 = words[1];
      }
    } else {
      line1 = title;
    }
  }

  return (
    <div
      className={cn(
        `
          flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center
          min-[420px]:flex-row min-[420px]:text-left
          sm:gap-2.5
        `,
        className
      )}
    >
      <span
        aria-hidden='true'
        className='
          flex size-5 shrink-0 items-center justify-center rounded-full
          bg-amanah-blue text-white shadow-2xs
          min-[420px]:size-5.5
          sm:size-6
          dark:bg-amanah-blue dark:text-white
        '
      >
        <CheckIcon
          className='
          size-2.5 stroke-[2.8]
          min-[420px]:size-3
          sm:size-3.5
        '
        />
      </span>
      <div
        className='
        flex w-full min-w-0 flex-col text-center
        min-[420px]:text-left
      '
      >
        <span
          className='
          block text-[10px] leading-tight font-semibold text-balance
          whitespace-normal text-foreground
          min-[420px]:text-[11px]
          sm:amanah-type-caption
        '
        >
          {line1}
        </span>
        {line2 && (
          <span
            className='
            block text-[10px] leading-tight font-medium text-balance
            whitespace-normal text-muted-foreground
            min-[420px]:text-[11px]
            sm:amanah-type-caption
          '
          >
            {line2}
          </span>
        )}
      </div>
    </div>
  );
}
