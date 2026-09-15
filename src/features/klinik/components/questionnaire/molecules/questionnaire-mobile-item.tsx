'use client';

import * as React from 'react';
import gsap from 'gsap';
import type { QuestionnaireItem } from '../types';
import { YearInputControl } from '../atoms/year-input-control';
import { QuestionnaireAccordionPrimitive } from '../atoms/questionnaire-accordion-primitive';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface QuestionnaireMobileItemProps {
  item: QuestionnaireItem;
  index: number;
  total: number;
  isOpen: boolean;
  onToggle: () => void;
  statusValue: string; // 'Tidak' | 'Ya' | ''
  yearValue: string;
  notesValue?: string;
  onSelectStatus: (status: 'Tidak' | 'Ya') => void;
  onChangeYear: (year: string) => void;
  onChangeNotes?: (notes: string) => void;
  onAdvance: () => void;
}

export function QuestionnaireMobileItem({
  item,
  index,
  isOpen,
  onToggle,
  statusValue,
  yearValue,
  notesValue = '',
  onSelectStatus,
  onChangeYear,
  onChangeNotes,
  onAdvance
}: QuestionnaireMobileItemProps) {
  const isAnswered = Boolean(statusValue);
  const isYes = statusValue === 'Ya';
  const isNo = statusValue === 'Tidak';
  const hasNotes = Boolean(item.notesFieldId);
  const mobileNotesInputId = `${item.id}-mobile-notes`;
  const mobileYearInputId = `${item.id}-mobile-year`;

  // Local state for morphing: 'options' | 'year'
  const [viewMode, setViewMode] = React.useState<'options' | 'year'>(() =>
    isYes && (item.yearFieldId || item.notesFieldId) ? 'year' : 'options'
  );

  const morphContainerRef = React.useRef<HTMLDivElement>(null);
  const optionsBoxRef = React.useRef<HTMLDivElement>(null);
  const yearBoxRef = React.useRef<HTMLDivElement>(null);

  // Sync viewMode if statusValue changes externally
  React.useEffect(() => {
    if (isYes && item.yearFieldId) {
      setViewMode('year');
    } else if (isNo) {
      setViewMode('options');
    }
  }, [isYes, isNo, item.yearFieldId]);

  const handleSelectNo = () => {
    onSelectStatus('Tidak');
    // Animate subtle confirmation then advance
    setTimeout(() => {
      onAdvance();
    }, 220);
  };

  const handleSelectYes = () => {
    onSelectStatus('Ya');

    if (!item.yearFieldId) {
      setTimeout(() => {
        onAdvance();
      }, 220);
      return;
    }

    // GSAP Morphing Transition: Options fade & shrink -> Year input expands in
    if (optionsBoxRef.current) {
      gsap.to(optionsBoxRef.current, {
        opacity: 0,
        scale: 0.94,
        y: -6,
        duration: 0.16,
        ease: 'power2.in',
        onComplete: () => {
          setViewMode('year');
          requestAnimationFrame(() => {
            if (yearBoxRef.current) {
              gsap.fromTo(
                yearBoxRef.current,
                { opacity: 0, scale: 0.94, y: 8 },
                { opacity: 1, scale: 1, y: 0, duration: 0.24, ease: 'back.out(1.2)' }
              );
            }
          });
        }
      });
    } else {
      setViewMode('year');
    }
  };

  const handleBackToOptions = () => {
    if (yearBoxRef.current) {
      gsap.to(yearBoxRef.current, {
        opacity: 0,
        scale: 0.94,
        y: 6,
        duration: 0.16,
        ease: 'power2.in',
        onComplete: () => {
          setViewMode('options');
          requestAnimationFrame(() => {
            if (optionsBoxRef.current) {
              gsap.fromTo(
                optionsBoxRef.current,
                { opacity: 0, scale: 0.94, y: -6 },
                { opacity: 1, scale: 1, y: 0, duration: 0.22, ease: 'power2.out' }
              );
            }
          });
        }
      });
    } else {
      setViewMode('options');
    }
  };

  const handleSaveYearAndAdvance = () => {
    if (yearValue.trim()) {
      onAdvance();
    } else {
      // If user clicks Lanjut without year, still allow advance
      onAdvance();
    }
  };

  return (
    <div
      data-slot='questionnaire-mobile-item'
      className='border-b border-border/50 py-3 transition-colors last:border-b-0'
    >
      {/* Header Trigger */}
      <button
        type='button'
        onClick={onToggle}
        aria-expanded={isOpen}
        className='flex w-full cursor-pointer items-center justify-between gap-3 text-left outline-none'
      >
        <div className='flex items-start gap-2.5 min-w-0'>
          <span
            className={cn(
              'flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-colors mt-0.5',
              isOpen
                ? 'bg-primary text-primary-foreground'
                : isAnswered
                  ? 'bg-primary/15 text-primary'
                  : 'bg-muted text-muted-foreground'
            )}
          >
            {index + 1}
          </span>
          <div className='min-w-0'>
            <p className='text-xs font-semibold text-foreground leading-snug line-clamp-2'>
              {item.title}
            </p>
            {/* Answer Preview Badge */}
            <div className='mt-1 flex items-center gap-1.5'>
              {isYes ? (
                <span className='inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary'>
                  <Icons.check className='size-2.5 stroke-[3]' />
                  Ya{' '}
                  {notesValue
                    ? `(${notesValue}${yearValue ? `, ${yearValue}` : ''})`
                    : yearValue
                      ? `(${yearValue})`
                      : ''}
                </span>
              ) : isNo ? (
                <span className='inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground'>
                  Tidak
                </span>
              ) : (
                <span className='text-[10px] font-normal text-muted-foreground/60 italic'>
                  Belum dijawab
                </span>
              )}
            </div>
          </div>
        </div>

        <Icons.chevronRight
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-90 text-foreground'
          )}
        />
      </button>

      {/* Accordion Body */}
      <QuestionnaireAccordionPrimitive isOpen={isOpen}>
        <div className='pt-2 pb-1'>
          {item.helpText ? (
            <p className='mb-3 text-xs leading-relaxed text-muted-foreground border-l-2 border-primary/30 pl-2.5'>
              {item.helpText}
            </p>
          ) : null}

          <div ref={morphContainerRef} className='relative min-h-[70px]'>
            {/* Mode 1: Options View */}
            {viewMode === 'options' ? (
              <div ref={optionsBoxRef} className='grid grid-cols-2 gap-2.5 pt-1'>
                {/* Tidak Action Button */}
                <button
                  type='button'
                  onClick={handleSelectNo}
                  aria-pressed={isNo}
                  className={cn(
                    'flex h-10 cursor-pointer items-center justify-center rounded-lg border text-xs font-medium transition-all duration-150 active:scale-95',
                    isNo
                      ? 'border-primary/80 bg-primary/10 text-primary font-semibold shadow-xs ring-1 ring-primary/20'
                      : 'border-border/80 bg-background text-foreground hover:bg-muted/40 hover:border-foreground/30'
                  )}
                >
                  Tidak
                </button>

                {/* Ya Action Button */}
                <button
                  type='button'
                  onClick={handleSelectYes}
                  aria-pressed={isYes}
                  className={cn(
                    'flex h-10 cursor-pointer items-center justify-center rounded-lg border text-xs font-medium transition-all duration-150 active:scale-95',
                    isYes
                      ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'border-border/80 bg-background text-foreground hover:bg-primary/5 hover:border-primary/40 hover:text-primary'
                  )}
                >
                  Ya
                </button>
              </div>
            ) : null}

            {/* Mode 2: Input Morph View (Year or Notes+Year) */}
            {viewMode === 'year' ? (
              <div
                ref={yearBoxRef}
                className='flex flex-col gap-2.5 rounded-lg border border-primary/30 bg-primary/5 p-3'
              >
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-semibold text-primary'>
                    {hasNotes ? 'Detail Riwayat Penyakit' : 'Tahun Kejadian / Diagnosis'}
                  </span>
                  <button
                    type='button'
                    onClick={handleBackToOptions}
                    className='text-[11px] font-medium text-muted-foreground hover:text-foreground cursor-pointer underline underline-offset-2'
                  >
                    Ubah ke Tidak
                  </button>
                </div>

                {hasNotes ? (
                  <div className='flex flex-col gap-2'>
                    <div>
                      <label
                        htmlFor={mobileNotesInputId}
                        className='text-[11px] font-medium text-foreground block mb-1'
                      >
                        Nama Penyakit atau Keluhan <span className='text-red-500'>*</span>
                      </label>
                      <Input
                        id={mobileNotesInputId}
                        value={notesValue}
                        onChange={(e) => onChangeNotes?.(e.target.value)}
                        placeholder='Contoh: Maag kronis, Asam urat'
                        className='h-8.5 text-xs bg-background'
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={mobileYearInputId}
                        className='text-[11px] font-medium text-foreground block mb-1'
                      >
                        Tahun Terdiagnosis <span className='text-red-500'>*</span>
                      </label>
                      <YearInputControl
                        id={mobileYearInputId}
                        value={yearValue}
                        onChange={onChangeYear}
                        placeholder='Contoh: 2020'
                        onEnter={handleSaveYearAndAdvance}
                        ariaLabel={`Tahun untuk ${item.title}`}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <p className='text-[11px] leading-snug text-muted-foreground'>
                      Masukkan tahun saat Anda didiagnosis atau mengalami kondisi ini:
                    </p>

                    <YearInputControl
                      id={mobileYearInputId}
                      value={yearValue}
                      onChange={onChangeYear}
                      placeholder='Contoh: 2021'
                      onEnter={handleSaveYearAndAdvance}
                      ariaLabel={`Tahun untuk ${item.title}`}
                    />
                  </>
                )}

                <div className='flex items-center justify-between gap-2 pt-1'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    shape='pill'
                    onClick={handleBackToOptions}
                    className='text-xs text-muted-foreground'
                  >
                    Kembali
                  </Button>
                  <Button
                    type='button'
                    variant='primary'
                    size='sm'
                    shape='pill'
                    onClick={handleSaveYearAndAdvance}
                    className='text-xs font-medium'
                  >
                    Simpan & Lanjut
                    <Icons.arrowRight className='size-3 ml-1' />
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </QuestionnaireAccordionPrimitive>
    </div>
  );
}
