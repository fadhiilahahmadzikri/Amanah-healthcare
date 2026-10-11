'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useDoctorScheduleSettingsModal,
  type ConfigurationCategory
} from '../../model/useDoctorScheduleSettingsModal';
import { StepSessionDefs } from './steps/step-session-defs';
import { StepOperatingDays } from './steps/step-operating-days';
import { StepWeeklyTemplates } from './steps/step-weekly-templates';
import { StepClinicSettings } from './steps/step-clinic-settings';
import { OnDemandImpactDialog } from './confirmation/on-demand-impact-dialog';

export interface DoctorScheduleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ConfigurationCategory;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
}

const CATEGORY_META: Record<ConfigurationCategory, { title: string; subtitle: string }> = {
  session_defs: {
    title: 'Shift Operasional',
    subtitle: 'Tentukan definisi shift yang diizinkan beroperasi di klinik.'
  },
  weekly_templates: {
    title: 'Template Mingguan',
    subtitle: 'Konfigurasikan template jadwal shift dan jam operasional per hari.'
  },
  clinic_settings: {
    title: 'Parameter Klinik',
    subtitle: 'Kelola durasi konsultasi, batas antrean, dan parameter operasional lainnya.'
  }
};

const CATEGORY_MAX_WIDTH: Record<ConfigurationCategory, string> = {
  session_defs: 'w-full sm:max-w-[620px]',
  weekly_templates: 'w-full sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl',
  clinic_settings: 'w-full sm:max-w-[640px]'
};

export function DoctorScheduleSettingsModal({
  isOpen,
  onClose,
  category = 'session_defs',
  portalContainerRef
}: DoctorScheduleSettingsModalProps) {
  const [sessionDefsSubView, setSessionDefsSubView] = React.useState<'defs' | 'operating_days'>(
    'defs'
  );
  const stepContainerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setSessionDefsSubView('defs');
    }
  }, [isOpen, category]);

  // GSAP animation for wizard transitions (identical to regular patient form wizard)
  useEffect(() => {
    if (!stepContainerRef.current) return;
    gsap.fromTo(
      stepContainerRef.current,
      { y: 14, opacity: 0, scale: 0.98 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.25,
        ease: 'power3.inOut'
      }
    );
  }, [category, sessionDefsSubView]);

  const {
    isLoading,
    isError,
    refetch,
    draftSessionDefs,
    draftWeeklyTemplates,
    draftClinicSettings,
    toggleSessionDef,
    toggleOperatingDayActive,
    toggleWeeklyTemplateActive,
    updateWeeklyTemplateTime,
    updateClinicSettingValue,
    timeValidationError,
    dirtyCount,
    days,
    isSubmitting,
    impactResult,
    showImpactDialog,
    handleRequestSave,
    handleConfirmSave,
    handleCancelImpactDialog
  } = useDoctorScheduleSettingsModal({ isOpen, onClose, category });

  const meta = useMemo(() => {
    if (category === 'session_defs' && sessionDefsSubView === 'operating_days') {
      return {
        title: 'Hari Operasional Klinik',
        subtitle: 'Atur keaktifan operasional klinik per hari (Senin - Minggu).'
      };
    }
    return CATEGORY_META[category] ?? CATEGORY_META.session_defs;
  }, [category, sessionDefsSubView]);

  const modalMaxWidth = CATEGORY_MAX_WIDTH[category] ?? 'w-full sm:max-w-[620px]';

  return (
    <>
      <ModalWrapper
        isOpen={isOpen}
        onClose={onClose}
        maxWidth={modalMaxWidth}
        showCloseButton={false}
        portalContainerRef={portalContainerRef}
        className='h-auto max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-4.5 sm:p-5 w-full my-auto shadow-2xl'
      >
        <div className='flex flex-col font-sans select-none gap-4'>
          {/* Header - Minimalist, Change Indicator on Opposite Side without pills */}
          <div className='flex items-start justify-between gap-3 shrink-0'>
            <div className='space-y-0.5 min-w-0 flex-1'>
              <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
                {meta.title}
              </h3>
              <p className='text-xs text-muted-foreground leading-normal'>{meta.subtitle}</p>
            </div>
            {dirtyCount > 0 && (
              <span className='text-xs text-muted-foreground shrink-0 self-start pt-0.5 font-medium'>
                {dirtyCount} perubahan belum disimpan
              </span>
            )}
          </div>

          {/* Focused Content Area with Shell Skeleton during loading */}
          {isLoading ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 w-full py-1'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className='flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-card/60 shadow-2xs'
                >
                  <div className='flex items-center gap-3'>
                    <Skeleton className='size-8 rounded-lg' />
                    <div className='space-y-1.5'>
                      <Skeleton className='h-4 w-24 rounded-md' />
                      <Skeleton className='h-3 w-16 rounded-md' />
                    </div>
                  </div>
                  <Skeleton className='h-5 w-9 rounded-full' />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className='flex flex-col items-center justify-center py-10 gap-2 text-destructive'>
              <Icons.warning className='size-6' />
              <span className='text-xs'>Gagal memuat konfigurasi.</span>
              <Button size='sm' variant='outline' onClick={() => refetch()}>
                Coba Lagi
              </Button>
            </div>
          ) : (
            <div ref={stepContainerRef} className='w-full'>
              {category === 'session_defs' && sessionDefsSubView === 'defs' && (
                <StepSessionDefs
                  sessionDefs={draftSessionDefs}
                  onToggleActive={toggleSessionDef}
                  onOpenOperatingDays={() => setSessionDefsSubView('operating_days')}
                />
              )}
              {category === 'session_defs' && sessionDefsSubView === 'operating_days' && (
                <StepOperatingDays
                  days={days}
                  onToggleDayActive={toggleOperatingDayActive}
                  onBackToSessionDefs={() => setSessionDefsSubView('defs')}
                />
              )}
              {category === 'weekly_templates' && (
                <StepWeeklyTemplates
                  days={days}
                  sessionDefs={draftSessionDefs}
                  weeklyTemplates={draftWeeklyTemplates}
                  onToggleShiftActive={toggleWeeklyTemplateActive}
                  onUpdateTime={updateWeeklyTemplateTime}
                />
              )}
              {category === 'clinic_settings' && (
                <StepClinicSettings
                  clinicSettings={draftClinicSettings}
                  onUpdateSetting={updateClinicSettingValue}
                />
              )}
            </div>
          )}

          {/* Footer Navigation - Standard Regular Wizard Pattern with Canonical Button Components */}
          <div className='flex items-center justify-between border-t border-border/70 pt-3.5 mt-1 gap-2'>
            {/* Left: Back button in operating_days subview, or Cancel button */}
            <div>
              {category === 'session_defs' && sessionDefsSubView === 'operating_days' ? (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setSessionDefsSubView('defs')}
                  className='text-xs h-8.5 px-3 font-semibold text-muted-foreground hover:text-foreground gap-1.5'
                >
                  <Icons.arrowLeft className='size-3.5' />
                  <span>Kembali</span>
                </Button>
              ) : (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={onClose}
                  disabled={isSubmitting}
                  className='text-xs h-8.5 px-3 text-muted-foreground hover:text-foreground font-semibold'
                >
                  Batal
                </Button>
              )}
            </div>

            {/* Right: Next Action (Operating Days) + Save Button */}
            <div className='flex items-center gap-2 shrink-0'>
              {category === 'session_defs' && sessionDefsSubView === 'defs' && (
                <Button
                  variant='link'
                  size='sm'
                  onClick={() => setSessionDefsSubView('operating_days')}
                  className='text-xs h-8.5 px-2 font-semibold text-primary hover:underline'
                >
                  Atur Hari
                </Button>
              )}

              <Button
                variant='default'
                size='sm'
                onClick={handleRequestSave}
                disabled={isSubmitting || dirtyCount === 0 || Boolean(timeValidationError)}
                className='text-xs h-8.5 px-3.5 font-medium'
              >
                {isSubmitting ? (
                  <>
                    <Icons.spinner className='size-3.5 animate-spin mr-1.5' />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Icons.check className='size-3.5 mr-1.5' />
                    Simpan Perubahan
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </ModalWrapper>

      {/* On-Demand High-Impact Confirmation Dialog */}
      <OnDemandImpactDialog
        isOpen={showImpactDialog}
        impactResult={impactResult}
        isSubmitting={isSubmitting}
        onClose={handleCancelImpactDialog}
        onConfirm={handleConfirmSave}
        portalContainerRef={portalContainerRef}
      />
    </>
  );
}
