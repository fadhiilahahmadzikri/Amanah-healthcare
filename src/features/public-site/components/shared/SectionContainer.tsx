import type { ReactNode } from 'react';
import { cn } from '@/features/public-site/lib/helpers';

type SectionContainerProps = {
  children: ReactNode;
  className?: string;
};

export function SectionContainer({ children, className }: SectionContainerProps) {
  return (
    <div className={cn('mx-auto w-full max-w-[1300px] px-4 sm:px-5', className)}>{children}</div>
  );
}
