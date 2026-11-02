'use client';

import type { AnyFieldApi } from '@tanstack/form-core';
import * as React from 'react';
import { toast } from 'sonner';

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
import { VISIT_TYPE } from '@/constants/visit-type.constants';

import type { ServiceCatalogItem } from '../api/catalog.service';
import type {
  PatientAffiliationProfile,
  PatientRelationshipType
} from '@/features/data-pasien/api/patient-affiliation-service';
import type { AppointmentFormData, MedicalAppointmentFlow } from '../api/types';
import {
  convertJsonSchemaToSections,
  convertSectionsToJsonSchema,
  DEFAULT_RICH_FORM_TEMPLATE
} from '../constants/default-form-template';
import {
  getMedicalFlowDefinition,
  type MedicalFlowDefinition,
  type MedicalFormField,
  type MedicalFormSection
} from '../constants/medical-appointment-schemas';
import { historyGroups, useMedicalAppointmentForm } from '../model/useMedicalAppointmentForm';
import { REPEATABLE_GROUP_KEYS, STEP_DESCRIPTOR_TYPES } from '../constants/kia-constants';
import { MedicalSectionStep } from './booking/medical-appointment-steps';
import { getFieldValidators, MedicalSchemaField } from './booking/medical-schema-field';
import { MedicalHistoryCatalog } from './medical-history-catalog';
import { QueueSuccessModal } from './queue-success-modal';
import { ReservationModal, type ReservationContext } from './reservation/reservation-modal';

interface MedicalAppointmentModalProps {
  flow: MedicalAppointmentFlow;
  isOpen: boolean;
  selectedService?: ServiceCatalogItem | null;
  selectedPatient?: PatientAffiliationProfile | null;
  newPatientRelationship?: PatientRelationshipType | string;
  builderMode?: boolean;
  initialSchema?: Record<string, any> | null;
  formTitle?: string;
  formDescription?: string;
  onSaveSchema?: (schema: Record<string, any>) => Promise<void>;
  onClose: () => void;
  onCreated?: (appointment: AppointmentFormData) => void;
  onCompleteIntake?: (context: ReservationContext) => void;
  onBackToService?: () => void;
}

export function MedicalAppointmentModal({
  flow,
  isOpen,
  selectedService,
  selectedPatient,
  newPatientRelationship,
  builderMode = false,
  initialSchema,
  formTitle,
  formDescription,
  onSaveSchema,
  onClose,
  onCreated,
  onCompleteIntake,
  onBackToService
}: MedicalAppointmentModalProps) {
  const [internalReservationContext, setInternalReservationContext] =
    React.useState<ReservationContext | null>(null);
  const [isSavingSchema, setIsSavingSchema] = React.useState(false);

  const [sections, setSections] = React.useState<MedicalFormSection[]>(() => {
    if (initialSchema) {
      return convertJsonSchemaToSections(initialSchema, builderMode);
    }
    const def = getMedicalFlowDefinition(flow);
    if (def) {
      return def.sections;
    }
    return convertJsonSchemaToSections(DEFAULT_RICH_FORM_TEMPLATE, builderMode);
  });

  React.useEffect(() => {
    if (initialSchema) {
      setSections(convertJsonSchemaToSections(initialSchema, builderMode));
    }
  }, [initialSchema, builderMode]);

  const customDefinition = React.useMemo<MedicalFlowDefinition | null>(() => {
    if (!builderMode && !initialSchema) return null;
    const title =
      formTitle ||
      initialSchema?.title ||
      (flow === 'pregnancy' ? 'Form Awal Kehamilan' : 'Formulir Pengkajian');
    const desc =
      formDescription || initialSchema?.description || 'Formulir pengkajian data medis pasien.';
    return {
      flow,
      formTitle: title,
      formDescription: desc,
      serviceName: formTitle || 'Pengkajian Medis',
      visitType: VISIT_TYPE.NEW_VISIT,
      patientNameFieldId: 'patient_full_name',
      patientContactFieldId: 'patient_phone',
      complaintFieldId: 'patient_chief_complaint',
      sections
    };
  }, [builderMode, initialSchema, formTitle, formDescription, flow, sections]);

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
    selectedService,
    selectedPatient,
    newPatientRelationship,
    customDefinition,
    builderMode,
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
  }

  const isLastStep = currentStep === medical.totalSteps;

  const handleUpdateField = (fieldId: string, updated: Partial<MedicalFormField>) => {
    setSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        fields: sec.fields.map((f) => (f.id === fieldId ? { ...f, ...updated } : f))
      }))
    );
  };

  const handleToggleFieldActive = (fieldId: string) => {
    setSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        fields: sec.fields.map((f) =>
          f.id === fieldId ? { ...f, isActive: f.isActive === false } : f
        )
      }))
    );
  };

  const handleDeleteField = (fieldId: string) => {
    setSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        fields: sec.fields.filter((f) => f.id !== fieldId)
      }))
    );
  };

  const handleAddField = () => {
    if (!currentSection) return;
    const newFieldId = `field_${Date.now()}`;
    const newField: MedicalFormField = {
      id: newFieldId,
      type: 'TEXT',
      title: 'Field Baru',
      label: 'Field Baru',
      helpText: '',
      placeholder: 'Masukkan data...',
      required: false,
      choices: [],
      goToSectionIdByChoice: null,
      colSpan: 1,
      isActive: true
    };

    setSections((prev) =>
      prev.map((sec) =>
        sec.id === currentSection.id ? { ...sec, fields: [...sec.fields, newField] } : sec
      )
    );
  };

  const handleSaveBuilderSchema = async () => {
    if (!onSaveSchema) return;
    try {
      setIsSavingSchema(true);
      const schemaToSave = convertSectionsToJsonSchema(
        sections,
        customDefinition?.formTitle || stepTitle,
        customDefinition?.formDescription || stepDescription
      );
      await onSaveSchema(schemaToSave);
      toast.success('Skema formulir berhasil disimpan');
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menyimpan skema formulir');
    } finally {
      setIsSavingSchema(false);
    }
  };

  return (
    <>
      <ModalWrapper
        isOpen={isOpen && !isQueueSuccessOpen && !internalReservationContext}
        onClose={onClose}
        maxWidth={
          builderMode
            ? 'max-w-[760px]'
            : isQuestionnaireStep || isHistoryCatalogStep
              ? 'max-w-[720px]'
              : 'max-w-[580px]'
        }
        showCloseButton={false}
        className='flex h-auto max-h-[88dvh] flex-col overflow-hidden p-5 sm:p-6 shadow-2xl transition-[max-width,width,max-height,height] duration-300'
      >
        <div className='flex shrink-0 flex-col gap-2 pb-2 mb-3 border-b border-border/40 sm:pb-3 sm:mb-4'>
          <div className='flex items-start justify-between gap-2'>
            <div className='min-w-0 flex-1 space-y-1 sm:space-y-1.5'>
              <div className='flex items-center gap-2'>
                <h3 className='text-base font-bold tracking-tight text-foreground sm:text-lg'>
                  {stepTitle}
                </h3>
                {builderMode && (
                  <span className='rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary border border-primary/20 select-none'>
                    Mode Form Builder
                  </span>
                )}
              </div>
              <p className='text-xs sm:text-sm text-muted-foreground leading-normal'>
                {stepDescription}
              </p>
            </div>

            {builderMode && currentSection && (
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleAddField}
                className='h-7 shrink-0 text-xs border-dashed hover:border-primary hover:bg-primary/5'
              >
                <Icons.add className='mr-1 size-3.5' /> Tambah Field
              </Button>
            )}
          </div>

          {/* Stepper Navigation in Builder Mode */}
          {builderMode && visibleMedicalSections.length > 1 && (
            <div className='flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none'>
              {visibleMedicalSections.map((sec, idx) => {
                const isActiveStep =
                  currentDescriptor?.type === STEP_DESCRIPTOR_TYPES.MEDICAL &&
                  currentDescriptor.sectionIndex === idx;
                return (
                  <button
                    key={sec.id}
                    type='button'
                    onClick={() => actions.goToStep(idx + 1)}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-xs font-medium transition-all shrink-0 select-none',
                      isActiveStep
                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                        : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {idx + 1}. {sec.title}
                  </button>
                );
              })}
            </div>
          )}

          {/* Sub-header action: Button + Tambah Kehamilan / + Tambah KB positioned under header text on the right side */}
          {isHistoryCatalogStep &&
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
              className='flex-1 min-h-0 max-h-[calc(88dvh-8rem)] overflow-y-auto overflow-x-hidden pr-1.5 pt-1 pb-2'
            >
              {currentDescriptor?.type === STEP_DESCRIPTOR_TYPES.MEDICAL ? (
                <MedicalSectionStep
                  section={visibleMedicalSections[currentDescriptor.sectionIndex]}
                  catalogActionType={catalogAction?.type ?? null}
                  onReturnToCatalog={actions.cancelCatalogAction}
                  values={values}
                  builderMode={builderMode}
                  onFieldChange={(fieldId, nextValue) => {
                    form.setFieldValue(fieldId, nextValue);
                  }}
                  renderField={(field) => (
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
                          onUpdateField={(updated) => handleUpdateField(field.id, updated)}
                          onToggleActive={() => handleToggleFieldActive(field.id)}
                          onDeleteField={() => handleDeleteField(field.id)}
                        />
                      )}
                    </form.AppField>
                  )}
                />
              ) : null}

              {currentDescriptor?.type === STEP_DESCRIPTOR_TYPES.HISTORY_CATALOG ? (
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

            {builderMode ? (
              <div className='flex shrink-0 items-center justify-between pt-3 mt-auto border-t border-border/40'>
                <div className='flex items-center gap-2'>
                  <Button
                    type='button'
                    variant='ghost'
                    shape='pill'
                    onClick={actions.prevStep}
                    disabled={currentStep === 1}
                  >
                    Kembali
                  </Button>
                  {!isLastStep && (
                    <Button
                      type='button'
                      variant='outline'
                      shape='pill'
                      onClick={actions.nextStep}
                      className='text-xs'
                    >
                      Step Berikutnya
                    </Button>
                  )}
                </div>
                <div className='flex items-center gap-2'>
                  <Button type='button' variant='ghost' shape='pill' onClick={onClose}>
                    Tutup
                  </Button>
                  <Button
                    type='button'
                    variant='primary'
                    shape='pill'
                    isLoading={isSavingSchema}
                    onClick={handleSaveBuilderSchema}
                    withTrailingCircleIcon
                    trailingIcon={<Icons.check className='size-3.5' />}
                  >
                    Simpan Formulir
                  </Button>
                </div>
              </div>
            ) : (
              <div className='flex shrink-0 items-center justify-between pt-3 mt-auto'>
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
              </div>
            )}
          </form.Form>
        </form.AppForm>
      </ModalWrapper>

      {internalReservationContext ? (
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
