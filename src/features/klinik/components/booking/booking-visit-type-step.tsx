'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import {
  VISIT_TYPE,
  VISIT_TYPE_LABELS,
  type CanonicalVisitType
} from '@/constants/visit-type.constants';

export interface BookingVisitTypeStepProps {
  visitType: CanonicalVisitType;
  setVisitType: (type: CanonicalVisitType) => void;
}

const VISIT_TYPE_OPTIONS = [
  {
    value: VISIT_TYPE.NEW_VISIT,
    title: VISIT_TYPE_LABELS[VISIT_TYPE.NEW_VISIT],
    description: 'Pertama kali berkonsultasi atau periksa untuk keluhan ini.',
    icon: Icons.billing
  },
  {
    value: VISIT_TYPE.FOLLOW_UP,
    title: VISIT_TYPE_LABELS[VISIT_TYPE.FOLLOW_UP],
    description: 'Lanjutan pengobatan atau kontrol evaluasi dari dokter sebelumnya.',
    icon: Icons.check
  }
];

export function BookingVisitTypeStep({
  visitType,
  setVisitType
}: BookingVisitTypeStepProps) {
  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Ini kunjungan keberapa kamu? 🩺
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Beri tahu kami apakah ini pemeriksaan keluhan baru atau kontrol lanjutan.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-2.5 pt-1'>
        {VISIT_TYPE_OPTIONS.map((opt) => {
          const isSelected = visitType === opt.value;
          const OptionIcon = opt.icon;

          return (
            <button
              type='button'
              key={opt.value}
              onClick={() => setVisitType(opt.value)}
              className={cn(
                'group relative flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all cursor-pointer select-none',
                isSelected
                  ? 'border-2 border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20'
                  : 'border-border/70 bg-card hover:border-primary/40 hover:bg-muted/10'
              )}
            >
              <div
                className={cn(
                  'size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted text-muted-foreground group-hover:text-foreground'
                )}
              >
                <OptionIcon className='size-5' />
              </div>

              <div className='flex-1 min-w-0 space-y-0.5'>
                <span className='text-sm font-bold text-foreground group-hover:text-primary transition-colors block'>
                  {opt.title}
                </span>
                <p className='text-xs text-muted-foreground leading-relaxed'>
                  {opt.description}
                </p>
              </div>

              <div className='shrink-0 self-center pl-1'>
                <div
                  className={cn(
                    'size-5 rounded-full border flex items-center justify-center transition-colors',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-transparent'
                  )}
                >
                  <Icons.check className='size-3 stroke-[3]' />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
