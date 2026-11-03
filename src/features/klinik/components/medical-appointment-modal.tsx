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
import { ChevronsLeft, ChevronsRight } from 'lucide-react';

import type { ServiceCatalogItem } from '../api/catalog.service';
import type {
  PatientAffiliationProfile,
  PatientRelationshipType
} from '@/features/data-pasien/api/patient-affiliation-service';
import type { AppointmentFormData, MedicalAppointmentFlow } from '../api/types';
import { historyGroups, useMedicalAppointmentForm } from '../model/useMedicalAppointmentForm';
import { REPEATABLE_GROUP_KEYS, STEP_DESCRIPTOR_TYPES } from '../constants/kia-constants';
import { MedicalSectionStep } from './booking/medical-appointment-steps';
import { getFieldValidators, MedicalSchemaField } from './booking/medical-schema-field';
import { MedicalHistoryCatalog } from './medical-history-catalog';
import { QueueSuccessModal } from './queue-success-modal';
import { ReservationModal, type ReservationContext } from './reservation/reservation-modal';
import {
  convertJsonSchemaToSections,
  convertSectionsToJsonSchema,
  type FormJsonSchema
} from '../constants/default-form-template';
import type { MedicalFormField, MedicalFormSection } from '../constants/medical-appointment-schemas';
import { MedicalStepHeaderEditDialog } from './booking/medical-step-header-edit-dialog';
import { MedicalBuilderTray } from './booking/medical-builder-tray';
import { mapComponentIdToFieldType } from '../constants/component-registry';

interface MedicalAppointmentModalProps {
  flow: MedicalAppointmentFlow;
  isOpen: boolean;
  formSchema?: FormJsonSchema | Record<string, any> | null;
  selectedService?: ServiceCatalogItem | null;
  selectedPatient?: PatientAffiliationProfile | null;
  newPatientRelationship?: PatientRelationshipType | string;
  onClose: () => void;
  onCreated?: (appointment: AppointmentFormData) => void;
  onCompleteIntake?: (context: ReservationContext) => void;
  onBackToService?: () => void;
  builderMode?: boolean;
  onSaveSchema?: (updatedSchema: FormJsonSchema) => Promise<void> | void;
}

export function MedicalAppointmentModal({
  flow,
  isOpen,
  formSchema,
  selectedService,
  selectedPatient,
  newPatientRelationship,
  onClose,
  onCreated,
  onCompleteIntake,
  onBackToService,
  builderMode = false,
  onSaveSchema
}: MedicalAppointmentModalProps) {
  const [internalReservationContext, setInternalReservationContext] =
    React.useState<ReservationContext | null>(null);

  const handleCompleteIntake = React.useCallback(
    (ctx: ReservationContext) => {
      if (onCompleteIntake) {
        onCompleteIntake(ctx);
      } else {
        setInternalReservationContext(ctx);
      }
    },
    [onCompleteIntake]
  );

  const medical = useMedicalAppointmentForm({
    flow,
    isOpen,
    formSchema,
    selectedService,
    selectedPatient,
    newPatientRelationship,
    onClose,
    onCreated,
    onCompleteIntake: handleCompleteIntake,
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

  const [editableSections, setEditableSections] = React.useState<MedicalFormSection[]>(() => {
    if (builderMode && formSchema) {
      return convertJsonSchemaToSections(formSchema, true);
    }
    return [];
  });

  React.useEffect(() => {
    if (builderMode && formSchema) {
      setEditableSections(convertJsonSchemaToSections(formSchema, true));
    }
  }, [builderMode, formSchema]);

  const [builderStep, setBuilderStep] = React.useState<number>(1);
  const [isSavingSchema, setIsSavingSchema] = React.useState<boolean>(false);
  const [isEditHeaderOpen, setIsEditHeaderOpen] = React.useState<boolean>(false);
  const [isBuilderTrayOpen, setIsBuilderTrayOpen] = React.useState<boolean>(true);

  const handleSaveStepHeader = React.useCallback(
    (newTitle: string, newDescription: string) => {
      setEditableSections((prev) =>
        prev.map((sec, idx) =>
          idx === builderStep - 1
            ? { ...sec, title: newTitle, description: newDescription }
            : sec
        )
      );
    },
    [builderStep]
  );

  const handleAddField = React.useCallback(
    (componentId?: string) => {
      const compId = componentId || 'text-input';
      const nextType = mapComponentIdToFieldType(compId);
      const newFieldId = `custom_${Date.now()}`;
      const newField: MedicalFormField = {
        id: newFieldId,
        type: nextType,
        title: 'Field Baru',
        label: 'Field Baru',
        helpText: '',
        placeholder: '',
        required: false,
        isActive: true,
        colSpan: nextType === 'PARAGRAPH' || nextType === 'DATE' ? 'full' : 1,
        choices:
          nextType === 'MULTIPLE_CHOICE' || nextType === 'LIST' ? ['Ya', 'Tidak'] : [],
        goToSectionIdByChoice: null
      };

      setEditableSections((prev) =>
        prev.map((sec, idx) =>
          idx === builderStep - 1
            ? { ...sec, fields: [...sec.fields, newField] }
            : sec
        )
      );
    },
    [builderStep]
  );

  const handleReorderFields = React.useCallback(
    (sourceIndex: number, targetIndex: number) => {
      if (sourceIndex === targetIndex) return;
      setEditableSections((prev) =>
        prev.map((sec, idx) => {
          if (idx !== builderStep - 1) return sec;
          const newFields = [...sec.fields];
          const [movedItem] = newFields.splice(sourceIndex, 1);
          newFields.splice(targetIndex, 0, movedItem);
          return { ...sec, fields: newFields };
        })
      );
    },
    [builderStep]
  );

  const handleDropComponent = React.useCallback(
    (componentId: string, targetIndex: number) => {
      const nextType = mapComponentIdToFieldType(componentId);
      const newFieldId = `custom_${Date.now()}`;
      const newField: MedicalFormField = {
        id: newFieldId,
        type: nextType,
        title: 'Field Baru',
        label: 'Field Baru',
        helpText: '',
        placeholder: '',
        required: false,
        isActive: true,
        colSpan: nextType === 'PARAGRAPH' || nextType === 'DATE' ? 'full' : 1,
        choices:
          nextType === 'MULTIPLE_CHOICE' || nextType === 'LIST' ? ['Ya', 'Tidak'] : [],
        goToSectionIdByChoice: null
      };

      setEditableSections((prev) =>
        prev.map((sec, idx) => {
          if (idx !== builderStep - 1) return sec;
          const newFields = [...sec.fields];
          newFields.splice(targetIndex, 0, newField);
          return { ...sec, fields: newFields };
        })
      );
    },
    [builderStep]
  );

  const handleAddStep = React.useCallback(() => {
    const nextStepNum = editableSections.length + 1;
    const newSection: MedicalFormSection = {
      id: `step_${Date.now()}`,
      title: `Langkah ${nextStepNum}`,
      description: 'Isi informasi sesuai petunjuk.',
      layout: 'grid',
      fields: []
    };
    setEditableSections((prev) => [...prev, newSection]);
    setBuilderStep(nextStepNum);
  }, [editableSections.length]);

  const handleDeleteStep = React.useCallback(
    (stepIndex: number) => {
      if (editableSections.length <= 1) return;
      if (!window.confirm(`Hapus langkah ke-${stepIndex + 1}?`)) return;
      setEditableSections((prev) => prev.filter((_, idx) => idx !== stepIndex));
      setBuilderStep((prev) => Math.max(1, Math.min(prev, editableSections.length - 1)));
    },
    [editableSections.length]
  );

  const handleUpdateField = React.useCallback(
    (fieldId: string, updated: Partial<MedicalFormField>) => {
      setEditableSections((prev) =>
        prev.map((sec) => ({
          ...sec,
          fields: sec.fields.map((f) => (f.id === fieldId ? { ...f, ...updated } : f))
        }))
      );
    },
    []
  );

  const handleToggleActive = React.useCallback((fieldId: string) => {
    setEditableSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        fields: sec.fields.map((f) =>
          f.id === fieldId ? { ...f, isActive: f.isActive === false } : f
        )
      }))
    );
  }, []);

  const handleSaveSchemaClick = React.useCallback(async () => {
    if (!onSaveSchema) return;
    try {
      setIsSavingSchema(true);
      const updatedSchema = convertSectionsToJsonSchema(
        editableSections,
        formSchema?.title,
        formSchema?.description
      );
      await onSaveSchema(updatedSchema);
    } finally {
      setIsSavingSchema(false);
    }
  }, [onSaveSchema, editableSections, formSchema]);

  const {
    definition,
    form,
    values,
    visibleMedicalSections,
    currentStep,
    currentDescriptor,
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

  const totalSteps = builderMode ? editableSections.length || 1 : medical.totalSteps;
  const activeStep = builderMode ? builderStep : currentStep;

  const currentSection = builderMode
    ? editableSections[builderStep - 1]
    : currentDescriptor?.type === STEP_DESCRIPTOR_TYPES.MEDICAL
      ? visibleMedicalSections[currentDescriptor.sectionIndex]
      : undefined;

  const isQuestionnaireStep =
    currentSection?.layout === 'questionnaire' || currentSection?.id === 'diseaseHistory';
  const isHistoryCatalogStep =
    !builderMode && currentDescriptor?.type === STEP_DESCRIPTOR_TYPES.HISTORY_CATALOG;

  let stepTitle = definition.formTitle;
  let stepDescription = definition.serviceName;

  if (builderMode) {
    stepTitle = currentSection?.title || formSchema?.title || 'Pengaturan Formulir';
    stepDescription =
      currentSection?.description ||
      'Arahkan kursor pada field untuk mengubah label, placeholder, atau menonaktifkan field.';
  } else if (currentDescriptor?.type === STEP_DESCRIPTOR_TYPES.MEDICAL) {
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
  }

  const isLastStep = activeStep === totalSteps;

  return (
    <>
      <ModalWrapper
        isOpen={isOpen && !isQueueSuccessOpen && !internalReservationContext}
        onClose={onClose}
        canvasMode={builderMode}
        attachedAside={
          builderMode ? (
            <MedicalBuilderTray
              isOpen={isBuilderTrayOpen}
              onToggle={() => setIsBuilderTrayOpen((prev) => !prev)}
              sections={editableSections}
              activeStep={builderStep}
              onSelectStep={(step) => setBuilderStep(step)}
              onAddField={handleAddField}
              onAddStep={handleAddStep}
              onDeleteStep={handleDeleteStep}
            />
          ) : undefined
        }
        maxWidth={
          builderMode
            ? 'flex-1 max-w-4xl lg:max-w-5xl w-full'
            : isQuestionnaireStep || isHistoryCatalogStep
              ? 'w-full max-w-3xl lg:max-w-4xl'
              : 'w-full max-w-3xl lg:max-w-4xl'
        }
        showCloseButton={false}
        className={cn(
          'flex flex-col overflow-hidden p-6 sm:p-7 md:p-8 shadow-2xl transition-[max-width,width,max-height,height] duration-300',
          builderMode ? 'h-[88dvh]' : 'h-auto max-h-[88dvh]'
        )}
      >
        <div
          className={cn(
            'flex shrink-0 items-start justify-between gap-4 pb-2 mb-3 border-b border-border/40 sm:pb-3 sm:mb-4 select-none'
          )}
        >
          <div
            onClick={builderMode ? () => setIsEditHeaderOpen(true) : undefined}
            title={builderMode ? 'Klik untuk mengedit judul dan petunjuk langkah' : undefined}
            className={cn(
              'flex flex-1 min-w-0 flex-col gap-1',
              builderMode && 'cursor-pointer hover:opacity-80 transition-opacity'
            )}
          >
            <h3 className='text-base font-bold tracking-tight text-foreground sm:text-lg truncate'>
              {stepTitle}
            </h3>
            <p className='text-xs sm:text-sm text-muted-foreground leading-normal'>
              {stepDescription}
            </p>
          </div>

          {builderMode && (
            <div className='flex items-center gap-2 shrink-0'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                shape='pill'
                onClick={() => setIsBuilderTrayOpen((prev) => !prev)}
                className='h-8 text-xs font-medium gap-1.5 border-border/70 hover:bg-muted/50 cursor-pointer'
                title={isBuilderTrayOpen ? 'Tutup Panel Studio' : 'Buka Panel Studio'}
              >
                <span>Panel Studio</span>
                {isBuilderTrayOpen ? (
                  <ChevronsRight className='size-3.5 text-muted-foreground' />
                ) : (
                  <ChevronsLeft className='size-3.5 text-muted-foreground' />
                )}
              </Button>
            </div>
          )}

          {/* Sub-header action: Button + Tambah Kehamilan / + Tambah KB positioned under header text on the right side */}
          {!builderMode &&
          isHistoryCatalogStep &&
          historyCounts[currentDescriptor.historyKey] <
            historyGroups[currentDescriptor.historyKey].maxRecords ? (
            <div className='flex items-center justify-end pt-1'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => actions.addHistoryFromCatalog(currentDescriptor.historyKey)}
                className='border-dashed text-xs font-medium hover:border-primary hover:bg-primary/5'
              >
                <Icons.add className='mr-1 size-3.5 shrink-0' />
                <span>
                  {currentDescriptor.historyKey === REPEATABLE_GROUP_KEYS.PREGNANCY
                    ? 'Tambah Kehamilan'
                    : 'Tambah KB'}
                </span>
              </Button>
            </div>
          ) : null}
        </div>

        <form.AppForm>
          <form.Form
            data-medical-flow={flow}
            className='flex flex-1 min-h-0 flex-col gap-0 p-0 md:p-0'
          >
            <div
              ref={stepContainerRef}
              onDragOver={
                builderMode
                  ? (e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'copy';
                    }
                  : undefined
              }
              onDrop={
                builderMode
                  ? (e) => {
                      e.preventDefault();
                      const compId =
                        e.dataTransfer.getData('application/x-amanah-component-id') ||
                        e.dataTransfer.getData('text/plain');
                      if (compId) {
                        handleAddField(compId);
                      }
                    }
                  : undefined
              }
              className='flex-1 min-h-0 max-h-[calc(88dvh-8rem)] overflow-y-auto overflow-x-hidden pr-1.5 pt-1 pb-2'
            >
              {(builderMode || currentDescriptor?.type === STEP_DESCRIPTOR_TYPES.MEDICAL) &&
              currentSection ? (
                <MedicalSectionStep
                  section={currentSection}
                  catalogActionType={builderMode ? null : (catalogAction?.type ?? null)}
                  onReturnToCatalog={actions.cancelCatalogAction}
                  values={values}
                  builderMode={builderMode}
                  onUpdateField={handleUpdateField}
                  onAddField={handleAddField}
                  onFieldChange={(fieldId, nextValue) => {
                    form.setFieldValue(fieldId, nextValue);
                  }}
                  renderField={(field, idx) => (
                    <form.AppField
                      key={field.id}
                      name={field.id}
                      validators={getFieldValidators(field, builderMode)}
                    >
                      {(fieldApi: AnyFieldApi) => (
                        <MedicalSchemaField
                          fieldApi={fieldApi}
                          schemaField={field}
                          builderMode={builderMode}
                          fieldIndex={idx}
                          onUpdateField={(updated) => handleUpdateField(field.id, updated)}
                          onToggleActive={() => handleToggleActive(field.id)}
                          onDeleteField={() => {
                            setEditableSections((prev) =>
                              prev.map((sec, sIdx) =>
                                sIdx === builderStep - 1
                                  ? { ...sec, fields: sec.fields.filter((f) => f.id !== field.id) }
                                  : sec
                              )
                            );
                          }}
                          onReorderFields={handleReorderFields}
                          onDropComponent={handleDropComponent}
                        />
                      )}
                    </form.AppField>
                  )}
                />
              ) : null}

              {!builderMode && currentDescriptor?.type === STEP_DESCRIPTOR_TYPES.HISTORY_CATALOG ? (
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
            </div>

            <div className='flex shrink-0 items-center justify-between pt-3 mt-auto'>
              {builderMode ? (
                <>
                  <Button
                    type='button'
                    variant='ghost'
                    shape='pill'
                    onClick={() => {
                      if (builderStep > 1) {
                        setBuilderStep((s) => s - 1);
                      } else {
                        onClose();
                      }
                    }}
                  >
                    {builderStep === 1 ? 'Batal' : 'Kembali'}
                  </Button>
                  <div className='flex items-center gap-2'>
                    {builderStep < totalSteps && (
                      <Button
                        type='button'
                        variant='outline'
                        shape='pill'
                        onClick={() => setBuilderStep((s) => s + 1)}
                        className='text-xs'
                      >
                        Lanjutkan
                      </Button>
                    )}
                    {onSaveSchema && (
                      <Button
                        type='button'
                        variant='primary'
                        shape='pill'
                        isLoading={isSavingSchema}
                        onClick={handleSaveSchemaClick}
                        className='bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs cursor-pointer'
                      >
                        <Icons.check className='mr-1.5 size-3.5' />
                        <span>Simpan Perubahan Formulir</span>
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Button type='button' variant='ghost' shape='pill' onClick={actions.prevStep}>
                    {currentStep === 1 && !onBackToService ? 'Batal' : 'Kembali'}
                  </Button>
                  <Button
                    type='button'
                    variant='primary'
                    shape='pill'
                    hug
                    disabled={!isCurrentStepValid || isProcessing}
                    isLoading={isProcessing}
                    onClick={actions.nextStep}
                    withTrailingCircleIcon
                    trailingIcon={<Icons.arrowUpRight />}
                  >
                    {isLastStep
                      ? isProcessing
                        ? 'Menyimpan data...'
                        : 'Lanjutkan ke Reservasi'
                      : 'Lanjutkan'}
                  </Button>
                </>
              )}
            </div>
          </form.Form>
        </form.AppForm>
      </ModalWrapper>

      {!builderMode && internalReservationContext ? (
        <ReservationModal
          isOpen={Boolean(internalReservationContext)}
          context={internalReservationContext}
          onClose={() => {
            setInternalReservationContext(null);
            onClose();
          }}
          onSuccess={(apt) => {
            onCreated?.(apt as unknown as AppointmentFormData);
          }}
        />
      ) : null}

      {!builderMode && (
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
      )}

      {!builderMode && (
        <QueueSuccessModal
          isOpen={isQueueSuccessOpen}
          isProcessing={isProcessing}
          appointment={createdAppointment}
          queueItem={createdQueueItem}
          onClose={actions.closeQueueSuccess}
        />
      )}

      {builderMode && (
        <MedicalStepHeaderEditDialog
          isOpen={isEditHeaderOpen}
          onClose={() => setIsEditHeaderOpen(false)}
          stepNumber={activeStep}
          initialTitle={stepTitle}
          initialDescription={stepDescription}
          onSave={handleSaveStepHeader}
        />
      )}
    </>
  );
}
