'use client';

import type { AnyFieldApi } from '@tanstack/form-core';
import * as React from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { ModalWrapper } from '@/components/ui/modal-wrapper';

import type { AppointmentFormData, MedicalAppointmentFlow } from '../api/types';
import { historyGroups, useMedicalAppointmentForm } from '../model/useMedicalAppointmentForm';
import { REPEATABLE_GROUP_KEYS, STEP_DESCRIPTOR_TYPES } from '../constants/kia-constants';
import {
  DateStep,
  MedicalSectionStep,
  ReviewStep,
  TimeStep
} from './booking/medical-appointment-steps';
import { getFieldValidators, MedicalSchemaField } from './booking/medical-schema-field';
import { MedicalHistoryCatalog } from './medical-history-catalog';
import { QueueSuccessModal } from './queue-success-modal';

interface MedicalAppointmentModalProps {
  flow: MedicalAppointmentFlow;
  isOpen: boolean;
  onClose: () => void;
  onCreated: (appointment: AppointmentFormData) => void;
  onBackToService?: () => void;
}

export function MedicalAppointmentModal({
  flow,
  isOpen,
  onClose,
  onCreated,
  onBackToService
}: MedicalAppointmentModalProps) {
  const medical = useMedicalAppointmentForm({
    flow,
    isOpen,
    onClose,
    onCreated,
    onBackToService
  });

  const stepContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!stepContainerRef.current) {
      return;
    }

    const scrollableElements = stepContainerRef.current.querySelectorAll<HTMLElement>(
      '[data-radix-scroll-area-viewport], .overflow-y-auto'
    );
    scrollableElements.forEach((element) => {
      element.scrollTop = 0;
    });
    stepContainerRef.current.scrollTop = 0;
  }, [medical.currentStep]);

  if (!isOpen) {
    return null;
  }

  const {
    definition,
    form,
    values,
    visibleMedicalSections,
    repeatableMedicalSections,
    currentStep,
    currentDescriptor,
    schedule,
    isProcessing,
    isQueueSuccessOpen,
    createdAppointment,
    createdQueueItem,
    historyCounts,
    historyPrompt,
    catalogAction,
    isCurrentStepValid,
    actions
  } = medical;

  const currentSection =
    currentDescriptor?.type === STEP_DESCRIPTOR_TYPES.MEDICAL
      ? visibleMedicalSections[currentDescriptor.sectionIndex]
      : undefined;
  const isQuestionnaireStep = currentSection?.layout === 'questionnaire';
  const isHistoryCatalogStep = currentDescriptor?.type === STEP_DESCRIPTOR_TYPES.HISTORY_CATALOG;

  let stepTitle = definition.formTitle;
  let stepDescription = definition.serviceName;

  if (currentDescriptor?.type === STEP_DESCRIPTOR_TYPES.MEDICAL) {
    if (currentSection) {
      stepTitle = currentSection.title;
      stepDescription = currentSection.description;
    }
  } else if (currentDescriptor?.type === STEP_DESCRIPTOR_TYPES.HISTORY_CATALOG) {
    const isPregnancy = currentDescriptor.historyKey === 'pregnancy';
    stepTitle = isPregnancy
      ? 'Katalog Riwayat Kehamilan & Persalinan'
      : 'Katalog Riwayat KB / Kontrasepsi';
    stepDescription = isPregnancy
      ? 'Daftar riwayat kehamilan dan persalinan sebelumnya yang telah dicatat. Tinjau atau ubah riwayat bila diperlukan.'
      : 'Daftar riwayat penggunaan KB/kontrasepsi yang telah dicatat. Tinjau atau ubah riwayat bila diperlukan.';
  } else if (currentDescriptor?.type === STEP_DESCRIPTOR_TYPES.DATE) {
    stepTitle = 'Tanggal Kunjungan';
    stepDescription = 'Pilih tanggal praktik kunjungan yang tersedia.';
  } else if (currentDescriptor?.type === STEP_DESCRIPTOR_TYPES.TIME) {
    stepTitle = 'Jam Kunjungan';
    stepDescription = `Pilih slot sesi jam kunjungan yang tersedia pada ${schedule.dateStr || 'tanggal terpilih'}.`;
  } else if (currentDescriptor?.type === STEP_DESCRIPTOR_TYPES.REVIEW) {
    stepTitle = 'Konfirmasi Data';
    stepDescription = 'Pastikan jadwal dan jawaban formulir sudah benar sebelum disimpan.';
  }

  return (
    <>
      <ModalWrapper
        isOpen={isOpen && !isQueueSuccessOpen}
        onClose={onClose}
        maxWidth={isQuestionnaireStep || isHistoryCatalogStep ? 'max-w-[720px]' : 'max-w-[580px]'}
        showCloseButton={false}
        className='flex h-auto max-h-[88dvh] flex-col overflow-hidden p-5 sm:p-6 shadow-2xl transition-[max-width,width,max-height,height] duration-300'
      >
        <div className='flex shrink-0 items-start justify-between gap-4 border-b border-border/40 pb-3'>
          <div className='min-w-0 flex-1 space-y-0.5'>
            <h3 className='text-base font-bold tracking-tight text-foreground sm:text-lg'>
              {stepTitle}
            </h3>
            <p className='text-xs text-muted-foreground'>{stepDescription}</p>
          </div>
        </div>

        <form.AppForm>
          <form.Form
            data-medical-flow={flow}
            className='flex flex-1 min-h-0 flex-col gap-0 p-0 md:p-0'
          >
            <div
              ref={stepContainerRef}
              className='flex-1 min-h-0 max-h-[calc(88dvh-8rem)] overflow-y-auto overflow-x-hidden pr-1.5 pb-2'
            >
              {currentDescriptor.type === STEP_DESCRIPTOR_TYPES.MEDICAL ? (
                <MedicalSectionStep
                  section={visibleMedicalSections[currentDescriptor.sectionIndex]}
                  catalogActionType={catalogAction?.type ?? null}
                  onReturnToCatalog={actions.cancelCatalogAction}
                  values={values}
                  onFieldChange={(fieldId, nextValue) => {
                    form.setFieldValue(fieldId, nextValue);
                  }}
                  renderField={(field) => (
                    <form.AppField
                      key={field.id}
                      name={field.id}
                      validators={getFieldValidators(field)}
                    >
                      {(fieldApi: AnyFieldApi) => (
                        <MedicalSchemaField fieldApi={fieldApi} schemaField={field} />
                      )}
                    </form.AppField>
                  )}
                />
              ) : null}

              {currentDescriptor.type === STEP_DESCRIPTOR_TYPES.HISTORY_CATALOG ? (
                <MedicalHistoryCatalog
                  groupKey={currentDescriptor.historyKey}
                  recordsCount={historyCounts[currentDescriptor.historyKey]}
                  maxRecords={historyGroups[currentDescriptor.historyKey].maxRecords}
                  values={values}
                  showHeader={false}
                  onEditRecord={(recordNumber) =>
                    actions.editHistoryFromCatalog(currentDescriptor.historyKey, recordNumber)
                  }
                  onRemoveRecord={(recordNumber) =>
                    actions.removeHistoryRecord(currentDescriptor.historyKey, recordNumber)
                  }
                  onAddRecord={() => actions.addHistoryFromCatalog(currentDescriptor.historyKey)}
                  className='h-full min-h-0 flex-1 overflow-y-auto pr-1 pb-2'
                />
              ) : null}

              {currentDescriptor.type === STEP_DESCRIPTOR_TYPES.DATE ? (
                <DateStep
                  selectedDateStr={schedule.dateStr}
                  onSelectDate={(dateStr) =>
                    actions.setSchedule((previous) => ({
                      ...previous,
                      dateStr,
                      timeSlot: ''
                    }))
                  }
                />
              ) : null}

              {currentDescriptor.type === STEP_DESCRIPTOR_TYPES.TIME ? (
                <TimeStep
                  selectedDateStr={schedule.dateStr}
                  selectedTimeSlot={schedule.timeSlot}
                  onSelectTimeSlot={(timeSlot) =>
                    actions.setSchedule((previous) => ({ ...previous, timeSlot }))
                  }
                />
              ) : null}

              {currentDescriptor.type === STEP_DESCRIPTOR_TYPES.REVIEW ? (
                <ReviewStep
                  definitionTitle={definition.formTitle}
                  flow={flow}
                  answeredFields={actions.collectAnsweredFields(repeatableMedicalSections)}
                  schedule={schedule}
                  serviceName={definition.serviceName}
                  values={values}
                />
              ) : null}
            </div>

            <div className='flex shrink-0 items-center justify-between border-t border-border/40 pt-3 mt-auto'>
              <Button type='button' variant='ghost' shape='pill' onClick={actions.prevStep}>
                {currentStep === 1 && !onBackToService ? 'Batal' : 'Kembali'}
              </Button>
              <div className='flex items-center gap-2.5'>
                {currentDescriptor.type === STEP_DESCRIPTOR_TYPES.HISTORY_CATALOG &&
                historyCounts[currentDescriptor.historyKey] <
                  historyGroups[currentDescriptor.historyKey].maxRecords ? (
                  <Button
                    type='button'
                    variant='outline'
                    shape='pill'
                    onClick={() => actions.addHistoryFromCatalog(currentDescriptor.historyKey)}
                    className='border-dashed text-xs font-medium hover:border-primary hover:bg-primary/5 sm:text-sm'
                  >
                    <Icons.add className='mr-1 size-3.5 shrink-0' />
                    <span className='hidden sm:inline'>
                      {currentDescriptor.historyKey === REPEATABLE_GROUP_KEYS.PREGNANCY
                        ? 'Tambah Riwayat Kehamilan Baru'
                        : 'Tambah Riwayat KB Baru'}
                    </span>
                    <span className='sm:hidden'>
                      {currentDescriptor.historyKey === REPEATABLE_GROUP_KEYS.PREGNANCY
                        ? 'Tambah Kehamilan'
                        : 'Tambah KB'}
                    </span>
                  </Button>
                ) : null}
                <Button
                  type='button'
                  variant='primary'
                  shape='pill'
                  hug
                  disabled={!isCurrentStepValid}
                  onClick={actions.nextStep}
                  withTrailingCircleIcon
                  trailingIcon={
                    currentDescriptor.type === STEP_DESCRIPTOR_TYPES.REVIEW ? (
                      <Icons.check />
                    ) : (
                      <Icons.arrowUpRight />
                    )
                  }
                >
                  {currentDescriptor.type === STEP_DESCRIPTOR_TYPES.REVIEW
                    ? 'Simpan Janji Temu'
                    : 'Lanjutkan'}
                </Button>
              </div>
            </div>
          </form.Form>
        </form.AppForm>
      </ModalWrapper>

      <Dialog
        open={Boolean(historyPrompt)}
        onOpenChange={(open) => {
          if (!open) {
            actions.promptNo();
          }
        }}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Tambah Riwayat Lain?</DialogTitle>
            <DialogDescription>
              {historyPrompt?.groupKey === 'pregnancy'
                ? 'Apakah ada lagi riwayat kehamilan atau persalinan sebelumnya yang ingin Anda tambahkan?'
                : 'Apakah ada lagi riwayat penggunaan KB/kontrasepsi yang ingin Anda tambahkan?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='flex flex-col-reverse gap-2 pt-3 sm:flex-row sm:justify-end'>
            <Button
              type='button'
              variant='outline'
              shape='pill'
              onClick={actions.promptNo}
              className='text-xs'
            >
              Tidak, Buka Katalog
            </Button>
            <Button
              type='button'
              variant='primary'
              shape='pill'
              onClick={actions.promptYes}
              className='text-xs'
            >
              Ya, Tambah Riwayat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <QueueSuccessModal
        isOpen={isQueueSuccessOpen}
        isProcessing={isProcessing}
        appointment={createdAppointment}
        queueItem={createdQueueItem}
        onClose={actions.closeQueueSuccess}
      />
    </>
  );
}
