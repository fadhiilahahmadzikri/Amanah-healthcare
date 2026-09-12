import type { ReactNode } from 'react';
import { Badge } from '@/features/public-site/components/ui/badge';
import { cn } from '@/features/public-site/lib/helpers';

type PillLabelProps = {
  children: ReactNode;
  className?: string;
};

export function PillLabel({ children, className }: PillLabelProps) {
  return (
    <Badge
      variant='secondary'
      className={cn(
        `
        rounded-none border border-line bg-transparent px-3 py-1.5
        amanah-type-eyebrow text-primary
        dark:bg-transparent
      `,
        className
      )}
    >
      {children}
    </Badge>
  );
}
