import type { ReactNode } from 'react';
import { ArrowUpRightIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/features/public-site/components/ui/button';
import { cn } from '@/features/public-site/lib/helpers';

type ArrowCtaButtonProps = {
  children: ReactNode;
  className?: string;
  href: string;
  treatment?: 'primary' | 'secondary';
};

export function ArrowCtaButton({
  children,
  className,
  href,
  treatment = 'primary'
}: ArrowCtaButtonProps) {
  const buttonVariant = treatment === 'primary' ? 'default' : 'secondary';
  const iconClassName =
    treatment === 'primary'
      ? 'bg-secondary text-secondary-foreground'
      : 'bg-primary text-primary-foreground';

  return (
    <Button
      asChild
      size='lg'
      variant={buttonVariant}
      className={cn(
        `
        group h-10 rounded-xl px-4 pr-1.5 amanah-type-small font-semibold
        shadow-xs transition-all duration-300
        md:h-11 md:px-5 md:pr-2
      `,
        className
      )}
    >
      <Link href={href}>
        <span>{children}</span>
        <span
          className={cn(
            `
          inline-flex size-7 items-center justify-center rounded-lg
          transition-transform duration-300
          group-hover:translate-x-0.5 group-hover:-translate-y-0.5
          md:size-8
        `,
            iconClassName
          )}
        >
          <ArrowUpRightIcon data-icon='inline-end' />
        </span>
      </Link>
    </Button>
  );
}
