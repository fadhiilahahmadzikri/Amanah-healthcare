import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function ReceiptPaper({
  id,
  children,
  className
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      id={id}
      className={cn(
        'relative mx-auto mb-4 w-full max-w-[380px] bg-[#f8f8f2] p-6 font-mono text-[12px] leading-relaxed text-slate-950 shadow-lg print:mb-0 print:shadow-none',
        className
      )}
    >
      <span
        aria-hidden='true'
        className='pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-slate-950/10 to-transparent print:hidden'
      />
      <span
        aria-hidden='true'
        className='pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-slate-950/8 to-transparent print:hidden'
      />
      {children}
      <div
        className='absolute inset-x-0 -bottom-3 h-3 bg-[#f8f8f2]'
        style={{
          clipPath:
            'polygon(0 0, 5% 100%, 10% 0, 15% 100%, 20% 0, 25% 100%, 30% 0, 35% 100%, 40% 0, 45% 100%, 50% 0, 55% 100%, 60% 0, 65% 100%, 70% 0, 75% 100%, 80% 0, 85% 100%, 90% 0, 95% 100%, 100% 0)'
        }}
      />
    </div>
  );
}
