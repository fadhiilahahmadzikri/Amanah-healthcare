import type { ReactNode } from 'react';
import { cn } from '@/features/public-site/lib/helpers';

type FAQQuestionTextProps = {
  children: ReactNode;
  className?: string;
};

export function FAQQuestionText({ children, className }: FAQQuestionTextProps) {
  return (
    <span
      className={cn(
        `
          amanah-type-body font-semibold text-foreground
          sm:amanah-type-lead
        `,
        className
      )}
    >
      {children}
    </span>
  );
}
