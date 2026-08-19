import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function ThermalPrinterFrame({
  children,
  isPrinting,
  className
}: {
  children: ReactNode;
  isPrinting?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('rounded-lg border bg-muted/40 p-4', className)}>
      <div className='relative mx-auto flex w-full max-w-[430px] flex-col items-center overflow-visible pb-6 pt-2 [perspective:1800px]'>
        <PrinterShell className='absolute top-0 z-0' />

        <div
          className={cn(
            'relative z-10 mt-[30px] w-[min(372px,calc(100%_-_46px))] overflow-hidden transition-[max-height] duration-[1500ms] motion-reduce:transition-none [transition-timing-function:cubic-bezier(0.25,1,0.5,1)]',
            isPrinting ? 'max-h-[1600px]' : 'max-h-0'
          )}
        >
          <div className='relative pt-0'>
            <div className='pointer-events-none absolute inset-y-0 left-0 z-20 w-5 rounded-l-sm bg-gradient-to-r from-slate-950/15 to-transparent print:hidden' />
            <div className='pointer-events-none absolute inset-y-0 right-0 z-20 w-5 rounded-r-sm bg-gradient-to-l from-slate-950/10 to-transparent print:hidden' />
            <div className='origin-top rotate-x-[18deg] transform-gpu shadow-[0_22px_38px_rgba(15,23,42,0.24)] [transform-style:preserve-3d]'>
              {children}
            </div>
          </div>
        </div>

        <div className='pointer-events-none absolute top-0 z-30 h-[32px] w-full max-w-[430px] overflow-hidden'>
          <PrinterShell />
        </div>

        <div className='pointer-events-none absolute top-[27px] z-40 h-6 w-[min(392px,calc(100%_-_34px))]'>
          <div className='absolute left-1/2 top-0 h-5 w-full -translate-x-1/2 rounded-b-[22px] bg-gradient-to-b from-slate-950 via-slate-950/75 to-transparent shadow-[0_10px_16px_rgba(2,6,23,0.38)]' />
          <div className='absolute left-1/2 top-[2px] h-[7px] w-[91%] -translate-x-1/2 rounded-full bg-black/80 shadow-[inset_0_2px_6px_rgba(0,0,0,0.95)]' />
        </div>
      </div>
    </div>
  );
}

function PrinterShell({ className }: { className?: string }) {
  return (
    <div className={cn('relative h-16 w-full max-w-[430px]', className)}>
      <div className='absolute inset-x-0 top-0 h-[58px] rounded-[16px] border border-slate-500/70 bg-gradient-to-b from-slate-200 via-slate-700 to-slate-950 shadow-[0_18px_34px_rgba(2,6,23,0.28)]'>
        <div className='absolute -left-1 top-2 h-10 w-8 rounded-l-[18px] border-y border-l border-white/40 bg-gradient-to-r from-white/25 to-transparent' />
        <div className='absolute -right-1 top-2 h-10 w-8 rounded-r-[18px] border-y border-r border-white/25 bg-gradient-to-l from-white/16 to-transparent' />
        <div className='absolute inset-x-2 top-1 h-11 rounded-[14px] border border-white/35 bg-gradient-to-b from-white/20 to-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.42)]' />
        <div className='absolute left-1/2 top-[19px] h-[22px] w-[90%] -translate-x-1/2 rounded-full border border-white/10 bg-slate-950 shadow-[inset_0_4px_12px_rgba(0,0,0,0.95),0_1px_0_rgba(255,255,255,0.12)]'>
          <div className='absolute left-4 right-4 top-[5px] h-[5px] rounded-full bg-slate-500/35' />
          <div className='absolute inset-x-3 bottom-[3px] h-px bg-white/10' />
        </div>
      </div>
    </div>
  );
}
