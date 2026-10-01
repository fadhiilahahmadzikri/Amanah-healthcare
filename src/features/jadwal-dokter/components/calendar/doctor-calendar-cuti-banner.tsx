'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { DoctorSchedule } from '../../api/types';

export interface DoctorCalendarCutiBannerProps {
  doctor?: DoctorSchedule;
  initials: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DoctorCalendarCutiBanner({
  doctor,
  initials,
  isOpen,
  onOpenChange
}: DoctorCalendarCutiBannerProps) {
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={onOpenChange}
      className='border-b border-border/40 bg-card transition-all shrink-0'
    >
      <CollapsibleTrigger asChild>
        <button
          type='button'
          className='w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-foreground/80 hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer select-none'
        >
          <span>Lihat kenapa dokter ini cuti</span>
          <Icons.chevronDown
            className={cn(
              'size-3.5 text-muted-foreground transition-transform duration-200 shrink-0',
              isOpen && 'rotate-180'
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className='px-3.5 sm:px-4 pb-3.5 pt-2.5 border-t border-border/30 bg-muted/5'>
        <div className='relative rounded-xl p-3 sm:p-3.5 border border-border/60 bg-card text-card-foreground shadow-none'>
          <div className='absolute top-3 right-3 flex items-center gap-1.5 z-10'>
            <span className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border border-sky-300/80 dark:border-sky-600/50 bg-sky-500/10 text-sky-700 dark:text-sky-300 select-none'>
              <span className='size-1.5 rounded-full bg-sky-500 shrink-0' />
              <span>Cuti</span>
            </span>
          </div>

          <div className='flex items-start gap-3'>
            <div className='relative size-9 sm:size-10 shrink-0'>
              <Avatar className='size-full rounded-full ring-1 ring-border/60 bg-muted overflow-hidden'>
                {doctor?.avatar && (
                  <AvatarImage
                    src={doctor.avatar}
                    alt={doctor.nama_dokter}
                    className='size-full object-cover object-top'
                  />
                )}
                <AvatarFallback className='bg-primary/10 text-primary font-bold text-xs'>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className='absolute -bottom-1 -right-1 size-4.5 rounded-full bg-sky-500 text-white flex items-center justify-center ring-2 ring-card shadow-2xs z-10'>
                <Icons.calendar className='size-2.5 stroke-[2.5]' />
              </div>
            </div>

            <div className='flex-1 min-w-0 pr-16 sm:pr-20'>
              <div>
                <h4 className='text-xs sm:text-[13px] font-bold text-foreground truncate leading-snug'>
                  {doctor?.nama_dokter}
                </h4>
                <p className='text-[11px] text-muted-foreground mt-0.5 font-normal truncate'>
                  {doctor?.spesialisasi} • {doctor?.ruang_praktik}
                </p>
              </div>

              <div className='mt-2 text-xs text-foreground/90 leading-relaxed font-normal'>
                Dokter sedang dalam masa{' '}
                <strong className='font-semibold text-foreground'>
                  {doctor?.cuti_reason || 'Cuti Operasional'}
                </strong>
                . Seluruh aktivitas praktik dan konsultasi ditutup sementara pada periode terkait.
              </div>

              {doctor?.cuti_start && doctor?.cuti_end && (
                <div className='mt-2.5'>
                  <div className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border/60 bg-muted/30 text-foreground text-[11px] font-medium'>
                    <Icons.calendar className='size-3.5 shrink-0 text-sky-600 dark:text-sky-400' />
                    <span>
                      {doctor.cuti_start} – {doctor.cuti_end}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
