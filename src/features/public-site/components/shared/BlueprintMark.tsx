import { cn } from '@/features/public-site/lib/helpers';

type BlueprintMarkProps = {
  className?: string;
  figureLabel?: string;
  patternId: string;
};

export function BlueprintMark({
  className,
  figureLabel = 'Fig. 1.',
  patternId
}: BlueprintMarkProps) {
  return (
    <figure
      aria-hidden
      className={cn('pointer-events-none relative min-h-[280px] overflow-hidden', className)}
    >
      <svg
        className='
          absolute inset-0 size-full overflow-visible
          [--blueprint-pattern:color-mix(in_oklab,var(--amanah-blue)_12%,var(--background))]
          [--blueprint-stroke:color-mix(in_oklab,var(--amanah-blue)_22%,var(--background))]
        '
        viewBox='0 0 900 430'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <defs>
          <pattern id={patternId} width='10' height='10' patternUnits='userSpaceOnUse'>
            <path d='M-1 1 1-1M0 10 10 0M9 11 11 9' stroke='var(--blueprint-pattern)' />
          </pattern>
        </defs>

        <g stroke='var(--line)' strokeDasharray='6 4' strokeWidth='1'>
          <path d='M-280 640 1040 -120' />
          <path d='M-80 -140 1040 506' />
          <path d='M118 -140 1238 506' />
          <path d='M-360 520 960 -240' />
        </g>

        <g fill='var(--background)' stroke='var(--blueprint-stroke)' strokeWidth='1.4'>
          <path d='M494 54 808 235 696 300 382 119Z' />
          <path d='M382 119 696 300 696 360 382 179Z' />
          <path d='M696 300 808 235 808 295 696 360Z' />

          <path d='M216 184 530 365 418 430 104 249Z' />
          <path d='M104 249 418 430 418 490 104 309Z' />
          <path d='M418 430 530 365 530 425 418 490Z' />

          <path d='M356 104 502 188 390 253 244 169Z' />
          <path d='M244 169 390 253 390 313 244 229Z' />
          <path d='M390 253 502 188 502 248 390 313Z' />

          <path d='M378 267 524 351 412 416 266 332Z' />
          <path d='M266 332 412 416 412 476 266 392Z' />
          <path d='M412 416 524 351 524 411 412 476Z' />

          <path d='M512 188 658 272 546 337 400 253Z' />
          <path d='M400 253 546 337 546 397 400 313Z' />
          <path d='M546 337 658 272 658 332 546 397Z' />
        </g>

        <g fill={`url(#${patternId})`} stroke='var(--blueprint-stroke)' strokeWidth='1.4'>
          <path d='M494 54 808 235 696 300 382 119Z' />
          <path d='M216 184 530 365 418 430 104 249Z' />
          <path d='M356 104 502 188 390 253 244 169Z' />
          <path d='M378 267 524 351 412 416 266 332Z' />
          <path d='M512 188 658 272 546 337 400 253Z' />
        </g>
      </svg>

      <figcaption
        className='
        absolute right-4 bottom-4 amanah-type-small font-medium
        text-muted-foreground/60 tabular-nums select-none
      '
      >
        {figureLabel}
      </figcaption>
    </figure>
  );
}
