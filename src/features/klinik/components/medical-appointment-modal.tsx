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
import { cn } from '@/lib/utils';

import type { AppointmentFormData, MedicalAppointmentFlow } from '../api/types';
import { historyGroups, useMedicalAppointmentForm } from '../model/useMedicalAppointmentForm';
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
    currentDescriptor?.type === 'medical'
      ? visibleMedicalSections[currentDescriptor.sectionIndex]
      : undefined;
  const isQuestionnaireStep = currentSection?.layout === 'questionnaire';
  const isHistoryCatalogStep = currentDescriptor?.type === 'history-catalog';

  return (
    <>
      <ModalWrapper
        isOpen={isOpen && !isQueueSuccessOpen}
        onClose={onClose}
        maxWidth={isQuestionnaireStep || isHistoryCatalogStep ? 'max-w-[820px]' : 'max-w-[680px]'}
        showCloseButton={false}
        backdropClassName='overflow-hidden'
        className={cn(
          'flex h-[96dvh] max-h-[96dvh] flex-col p-5 transition-all duration-300 sm:h-[660px] sm:max-h-[88vh] sm:p-6',
          (isQuestionnaireStep || isHistoryCatalogStep) && 'sm:max-w-[820px]'
        )}
      >
        <form.AppForm>
          <form.Form className='flex h-full min-h-0 flex-1 flex-col gap-0 p-0 md:p-0'>
            <div className='flex h-full min-h-0 flex-1 flex-col justify-between gap-4'>
              <div ref={stepContainerRef} className='flex h-full min-h-0 flex-1 flex-col'>
                {currentDescriptor.type === 'medical' ? (
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

                {currentDescriptor.type === 'history-catalog' ? (
                  <MedicalHistoryCatalog
                    groupKey={currentDescriptor.historyKey}
                    recordsCount={historyCounts[currentDescriptor.historyKey]}
                    maxRecords={historyGroups[currentDescriptor.historyKey].maxRecords}
                    values={values}
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

                {currentDescriptor.type === 'date' ? (
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

                {currentDescriptor.type === 'time' ? (
                  <TimeStep
                    selectedDateStr={schedule.dateStr}
                    selectedTimeSlot={schedule.timeSlot}
                    onSelectTimeSlot={(timeSlot) =>
                      actions.setSchedule((previous) => ({ ...previous, timeSlot }))
                    }
                  />
                ) : null}

                {currentDescriptor.type === 'review' ? (
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

              <div className='flex shrink-0 items-center justify-between pt-2'>
                <Button type='button' variant='ghost' shape='pill' onClick={actions.prevStep}>
                  {currentStep === 1 && !onBackToService ? 'Batal' : 'Kembali'}
                </Button>
                <div className='flex items-center gap-2.5'>
                  {currentDescriptor.type === 'history-catalog' &&
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
                        {currentDescriptor.historyKey === 'pregnancy'
                          ? 'Tambah Riwayat Kehamilan Baru'
                          : 'Tambah Riwayat KB Baru'}
                      </span>
                      <span className='sm:hidden'>
                        {currentDescriptor.historyKey === 'pregnancy'
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
                      currentDescriptor.type === 'review' ? <Icons.check /> : <Icons.arrowUpRight />
                    }
                  >
                    {currentDescriptor.type === 'review' ? 'Simpan Janji Temu' : 'Lanjutkan'}
                  </Button>
                </div>
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
