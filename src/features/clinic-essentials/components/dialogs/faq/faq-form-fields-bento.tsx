'use client';

import * as React from 'react';
import { PatientLineInput } from '@/features/data-pasien/components/registration/atoms/patient-line-input';
import { PatientLineTextarea } from '@/features/data-pasien/components/registration/atoms/patient-line-textarea';
import { cn } from '@/lib/utils';

export interface FaqFormFieldsBentoProps {
  title: string;
  setTitle: (val: string) => void;
  answer: string;
  setAnswer: (val: string) => void;
  className?: string;
}

export function FaqFormFieldsBento({
  title,
  setTitle,
  answer,
  setAnswer,
  className,
}: FaqFormFieldsBentoProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/60 bg-muted/20 p-4 sm:p-5 flex flex-col h-full overflow-hidden shadow-2xs font-sans',
        className
      )}
    >
      {/* Box Header */}
      <div className='flex items-center justify-between pb-3 border-b border-border/40 shrink-0'>
        <div>
          <h4 className='text-xs sm:text-sm font-bold text-foreground tracking-tight'>
            Konten Pertanyaan & Jawaban
          </h4>
          <p className='text-[11px] text-muted-foreground mt-0.5 font-medium'>
            Pertanyaan dan jawaban ramah pasien untuk landing page klinik
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex-1 min-h-0 overflow-y-auto pr-1 sm:pr-2 pt-3 space-y-4 scrollbar-thin'>
        {/* Pertanyaan */}
        <div className='space-y-1.5'>
          <PatientLineInput
            id='faq_title'
            label='Pertanyaan Pasien *'
            placeholder='Contoh: Apakah layanan persalinan dan IGD tersedia 24 jam?'
            value={title}
            onChange={setTitle}
            maxLength={150}
            required
            autoComplete='off'
          />
        </div>

        {/* Jawaban */}
        <div className='space-y-1.5 pt-2 border-t border-border/40'>
          <PatientLineTextarea
            id='faq_answer'
            label='Jawaban & Solusi *'
            placeholder='Tuliskan uraian jawaban yang jelas bagi pasien. Tekan Enter untuk memisahkan butir langkah solusi...'
            value={answer}
            onChange={setAnswer}
            rows={7}
          />
        </div>
      </div>
    </div>
  );
}
