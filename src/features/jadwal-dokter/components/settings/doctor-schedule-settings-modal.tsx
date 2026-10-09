'use client';

import React, { useMemo } from 'react';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import {
  useDoctorScheduleSettingsModal,
  type ConfigurationCategory
} from '../../model/useDoctorScheduleSettingsModal';
import { StepSessionDefs } from './steps/step-session-defs';
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
  session_defs: 'w-full sm:max-w-[540px]',
  weekly_templates: 'w-full sm:max-w-[460px]',
  clinic_settings: 'w-full sm:max-w-[640px]'
};

export function DoctorScheduleSettingsModal({
  isOpen,
  onClose,
  category = 'session_defs',
  portalContainerRef
}: DoctorScheduleSettingsModalProps) {
  const {
    isLoading,
    isError,
    refetch,
    draftSessionDefs,
    draftWeeklyTemplates,
    draftClinicSettings,
    toggleSessionDef,
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

  const meta = useMemo(() => CATEGORY_META[category] ?? CATEGORY_META.session_defs, [category]);
  const modalMaxWidth = CATEGORY_MAX_WIDTH[category] ?? 'w-full sm:max-w-[540px]';

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
          {/* Header - Regular Form Authority (Focused, No Redundancy) */}
          <div className='flex items-start justify-between gap-3 shrink-0'>
            <div className='space-y-0.5 min-w-0 flex-1'>
              <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
                {meta.title}
              </h3>
              <p className='text-xs text-muted-foreground leading-normal'>
                {meta.subtitle}
              </p>
            </div>
            <button
              type='button'
              onClick={onClose}
              disabled={isSubmitting}
              className='rounded-full p-1.5 text-muted-foreground hover:bg-muted transition-colors cursor-pointer shrink-0 -mr-1 -mt-1'
              aria-label='Tutup modal'
            >
              <Icons.close className='size-4' />
            </button>
          </div>

          {/* Focused Content Area - Hick's Law: Zero Tab Distraction & Natural Hug Layout */}
          {isLoading ? (
            <div className='flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground'>
              <Icons.spinner className='size-6 animate-spin text-primary' />
              <span className='text-xs'>Memuat data konfigurasi...</span>
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
            <div className='w-full animate-in fade-in-50 duration-200'>
              {category === 'session_defs' && (
                <StepSessionDefs
                  sessionDefs={draftSessionDefs}
                  onToggleActive={toggleSessionDef}
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

          {/* Footer Navigation */}
          <div className='flex items-center justify-between border-t border-border/70 pt-4 mt-1 gap-2'>
            <div className='text-xs text-muted-foreground truncate'>
              {dirtyCount > 0 ? (
                <span className='text-primary font-medium'>
                  {dirtyCount} perubahan belum disimpan
                </span>
              ) : (
                <span>Konfigurasi tersinkronisasi</span>
              )}
            </div>

            <div className='flex items-center gap-2 shrink-0'>
              <Button
                variant='ghost'
                size='sm'
                onClick={onClose}
                disabled={isSubmitting}
                className='text-xs h-8.5 px-3 text-muted-foreground hover:text-foreground'
              >
                Batal
              </Button>

              <Button
                variant='default'
                size='sm'
                onClick={handleRequestSave}
                disabled={isSubmitting || dirtyCount === 0 || Boolean(timeValidationError)}
                className='text-xs h-8.5 px-3 font-medium'
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
