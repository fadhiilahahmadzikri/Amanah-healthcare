'use client';

import type { AnyFieldApi } from '@tanstack/form-core';
import { useStore } from '@tanstack/react-form';
import * as React from 'react';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAppForm } from '@/components/ui/tanstack-form';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { PatientBirthdatePicker } from '@/features/data-pasien/components/registration/molecules/patient-birthdate-picker';
import { PatientStepHeader } from '@/features/data-pasien/components/registration/molecules/patient-step-header';
import type { Patient } from '@/features/data-pasien/api/types';
import { cn } from '@/lib/utils';

import type {
  Appointment,
  AppointmentFormData,
  MedicalAppointmentFlow,
  QueueItem
} from '../api/types';
import {
  createAppointmentRecordWithQueue,
  getDoctorsByService,
  loadStoredAppointments
} from '../api/service';
import {
  getMedicalFlowDefinition,
  type MedicalFormField,
  type MedicalFormSection
} from '../constants/medical-appointment-schemas';
import {
  buildAutomaticRecord,
  buildDefaultMedicalValues,
  buildMedicalIntakeRecord,
  calculateAgeInYears,
  calculateBmi,
  getActiveMedicalSections,
  type MedicalAppointmentValues
} from '../utils/medical-appointment';
import {
  getMedicalFieldValidationSchema,
  isMedicalSectionValid,
  normalizeMedicalFieldInput
} from '../schemas/medical-appointment-validation';
import { AppointmentCalendarDayPicker } from './appointment-calendar-day-picker';
import { AppointmentTimeSlotPicker } from './appointment-time-slot-picker';
import { DoctorAvatar } from './doctor-avatar';
import { QueueSuccessModal } from './queue-success-modal';

interface MedicalAppointmentModalProps {
  flow: MedicalAppointmentFlow;
  isOpen: boolean;
  onClose: () => void;
  onCreated: (formData: AppointmentFormData) => void;
  onBackToService?: () => void;
}

type ScheduleValues = {
  doctor: string;
  dateStr: string;
  timeSlot: string;
};

type StepDescriptor =
  | {
      type: 'medical';
      sectionIndex: number;
    }
  | {
      type: 'doctor' | 'date' | 'time' | 'review';
    };

type RepeatableHistoryKey = 'previousPregnancy' | 'contraception';

type RepeatableHistoryCounts = Record<RepeatableHistoryKey, number>;

interface RepeatableHistoryGroup {
  key: RepeatableHistoryKey;
  sectionIds: string[];
  gatewayFieldId: string;
  disabledValue: string;
  maxRecords: number;
}

interface HistoryRecordActions {
  currentRecord: number;
  totalRecords: number;
  maxRecords: number;
  onAdd: () => void;
  onRemove: () => void;
}

const scheduleStepDescriptors: StepDescriptor[] = [
  { type: 'doctor' },
  { type: 'date' },
  { type: 'time' },
  { type: 'review' }
];

const historyGroups: Record<RepeatableHistoryKey, RepeatableHistoryGroup> = {
  previousPregnancy: {
    key: 'previousPregnancy',
    sectionIds: [
      'previousPregnancy1Details',
      'previousPregnancy2Details',
      'previousPregnancy3Details',
      'previousPregnancy4Details'
    ],
    gatewayFieldId: 'hasPreviousPregnancyHistory',
    disabledValue: 'Belum/tidak ada',
    maxRecords: 4
  },
  contraception: {
    key: 'contraception',
    sectionIds: [
      'contraception1Details',
      'contraception2Details',
      'contraception3Details',
      'contraception4Details'
    ],
    gatewayFieldId: 'hasContraceptionHistory',
    disabledValue: 'Belum pernah',
    maxRecords: 4
  }
};

const defaultHistoryCounts: RepeatableHistoryCounts = {
  previousPregnancy: 1,
  contraception: 1
};

export function MedicalAppointmentModal({
  flow,
  isOpen,
  onClose,
  onCreated,
  onBackToService
}: MedicalAppointmentModalProps) {
  const definition = React.useMemo(() => getMedicalFlowDefinition(flow), [flow]);
  const defaultValues = React.useMemo(() => buildDefaultMedicalValues(definition), [definition]);
  const doctors = React.useMemo(
    () => getDoctorsByService(definition.serviceName),
    [definition.serviceName]
  );
  const firstDoctorName = doctors[0]?.name || '';
  const [currentStep, setCurrentStep] = React.useState(1);
  const [schedule, setSchedule] = React.useState<ScheduleValues>({
    doctor: firstDoctorName,
    dateStr: '',
    timeSlot: ''
  });
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isQueueSuccessOpen, setIsQueueSuccessOpen] = React.useState(false);
  const [createdAppointment, setCreatedAppointment] = React.useState<Appointment | null>(null);
  const [createdQueueItem, setCreatedQueueItem] = React.useState<QueueItem | null>(null);
  const [registeredPatient, setRegisteredPatient] = React.useState<Patient | null>(null);
  const [historyCounts, setHistoryCounts] =
    React.useState<RepeatableHistoryCounts>(defaultHistoryCounts);

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      submitMedicalAppointment(value as MedicalAppointmentValues);
    }
  });
  const values = useStore(form.store, (state) => state.values) as MedicalAppointmentValues;
  const activeMedicalSections = React.useMemo(
    () => getActiveMedicalSections(definition, values),
    [definition, values]
  );
  const repeatableMedicalSections = React.useMemo(
    () =>
      activeMedicalSections.filter((section) => isHistorySectionVisible(section.id, historyCounts)),
    [activeMedicalSections, historyCounts]
  );
  const registrationPrefill = React.useMemo(
    () => buildRegistrationPrefill(flow, registeredPatient),
    [flow, registeredPatient]
  );
  const prefilledFieldIds = React.useMemo(() => {
    return new Set(
      Object.entries(registrationPrefill)
        .filter(([, value]) => Boolean(value.trim()))
        .map(([fieldId]) => fieldId)
    );
  }, [registrationPrefill]);
  const visibleMedicalSections = React.useMemo(
    () =>
      repeatableMedicalSections
        .map((section) => ({
          ...section,
          fields: section.fields.filter((field) => !prefilledFieldIds.has(field.id))
        }))
        .filter((section) => section.fields.length > 0),
    [repeatableMedicalSections, prefilledFieldIds]
  );
  const activeSteps = React.useMemo<StepDescriptor[]>(
    () => [
      ...visibleMedicalSections.map((_, sectionIndex) => ({
        type: 'medical' as const,
        sectionIndex
      })),
      ...scheduleStepDescriptors
    ],
    [visibleMedicalSections]
  );
  const totalSteps = activeSteps.length;
  const currentDescriptor = activeSteps[currentStep - 1] || activeSteps[0];
  const clearHistoryRecordRange = React.useCallback(
    (group: RepeatableHistoryGroup, startRecord: number, endRecord: number) => {
      for (let recordNumber = startRecord; recordNumber <= endRecord; recordNumber += 1) {
        getHistorySection(definition.sections, group, recordNumber)?.fields.forEach((field) => {
          form.setFieldValue(field.id, '');
        });
      }
    },
    [definition.sections, form]
  );

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isCancelled = false;

    async function loadRegisteredPatient() {
      try {
        const response = await fetch('/api/patient-registration/current', {
          cache: 'no-store'
        });

        if (!response.ok) {
          if (!isCancelled) {
            setRegisteredPatient(null);
          }
          return;
        }

        const payload = (await response.json()) as { patient?: Patient | null };

        if (!isCancelled) {
          setRegisteredPatient(payload.patient ?? null);
        }
      } catch {
        if (!isCancelled) {
          setRegisteredPatient(null);
        }
      }
    }

    void loadRegisteredPatient();

    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  React.useEffect(() => {
    setSchedule((previous) => ({
      ...previous,
      doctor: previous.doctor || firstDoctorName
    }));
  }, [firstDoctorName]);

  React.useEffect(() => {
    setCurrentStep((step) => Math.min(step, totalSteps));
  }, [totalSteps]);

  React.useEffect(() => {
    if (isOpen) {
      setHistoryCounts(defaultHistoryCounts);
    }
  }, [flow, isOpen]);

  React.useEffect(() => {
    Object.entries(registrationPrefill).forEach(([fieldId, value]) => {
      if (value.trim()) {
        form.setFieldValue(fieldId, value);
      }
    });
  }, [form, registrationPrefill]);

  const stepContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const previousPregnancyGroup = historyGroups.previousPregnancy;
    const contraceptionGroup = historyGroups.contraception;

    if (values.hasPreviousPregnancyHistory === previousPregnancyGroup.disabledValue) {
      clearHistoryRecordRange(previousPregnancyGroup, 1, previousPregnancyGroup.maxRecords);
      setHistoryCounts((previous) => ({
        ...previous,
        previousPregnancy: 1
      }));
    }

    if (values.hasContraceptionHistory === contraceptionGroup.disabledValue) {
      clearHistoryRecordRange(contraceptionGroup, 1, contraceptionGroup.maxRecords);
      setHistoryCounts((previous) => ({
        ...previous,
        contraception: 1
      }));
    }
  }, [clearHistoryRecordRange, values.hasPreviousPregnancyHistory, values.hasContraceptionHistory]);

  React.useEffect(() => {
    const calculated = calculateBmi(values.prePregnancyWeightKg, values.heightCm);
    if (calculated && values.initialBmi !== calculated) {
      form.setFieldValue('initialBmi', calculated);
    }
  }, [values.prePregnancyWeightKg, values.heightCm, values.initialBmi, form]);

  React.useEffect(() => {
    if (values.motherBirthDate) {
      const formatted = calculateAgeInYears(values.motherBirthDate);
      if (formatted && values.motherAge !== formatted) {
        form.setFieldValue('motherAge', formatted);
      }
    }
  }, [values.motherBirthDate, values.motherAge, form]);

  React.useEffect(() => {
    if (values.partnerBirthDate) {
      const formatted = calculateAgeInYears(values.partnerBirthDate);
      if (formatted && values.partnerAge !== formatted) {
        form.setFieldValue('partnerAge', formatted);
      }
    }
  }, [values.partnerBirthDate, values.partnerAge, form]);

  React.useEffect(() => {
    if (stepContainerRef.current) {
      const scrollableElements = stepContainerRef.current.querySelectorAll<HTMLElement>(
        '[data-radix-scroll-area-viewport], .overflow-y-auto'
      );
      scrollableElements.forEach((el) => {
        el.scrollTop = 0;
      });
      stepContainerRef.current.scrollTop = 0;
    }
  }, [currentStep]);

  function submitMedicalAppointment(formValues: MedicalAppointmentValues) {
    const submittedValues = pickMedicalValues(repeatableMedicalSections, formValues);
    const intake = buildMedicalIntakeRecord({ definition, values: submittedValues });
    const complaint = buildComplaintText(definition.complaintFieldId, submittedValues);
    const patientName = submittedValues[definition.patientNameFieldId] || undefined;
    const patientContact = submittedValues[definition.patientContactFieldId] || undefined;
    const patientEmail =
      registeredPatient?.email_pasien || registeredPatient?.email || patientContact || undefined;
    const payload: AppointmentFormData = {
      visitType: definition.visitType,
      service: definition.serviceName,
      doctor: schedule.doctor,
      dateStr: schedule.dateStr,
      timeSlot: schedule.timeSlot,
      complaint,
      patientName,
      patientEmail,
      patientAvatar: registeredPatient?.avatar,
      medicalFlow: definition.flow,
      medicalIntake: intake
    };

    setIsProcessing(true);
    setIsQueueSuccessOpen(true);

    const existing = loadStoredAppointments();
    const result = createAppointmentRecordWithQueue(payload, existing);

    setCreatedAppointment(result.appointment);
    setCreatedQueueItem(result.queueItem);
    onCreated(payload);

    setTimeout(() => {
      setIsProcessing(false);
    }, 1200);
  }

  function handleBack() {
    if (currentStep <= 1) {
      if (onBackToService) {
        onBackToService();
        return;
      }
      onClose();
      return;
    }

    setCurrentStep((step) => Math.max(1, step - 1));
  }

  function handleNext() {
    if (!isCurrentStepValid(currentDescriptor, visibleMedicalSections, values, schedule)) {
      toast.error('Lengkapi bagian ini sebelum lanjut.');
      return;
    }

    if (currentDescriptor.type === 'review') {
      void form.handleSubmit();
      return;
    }

    setCurrentStep((step) => Math.min(totalSteps, step + 1));

    if (stepContainerRef.current) {
      const scrollableElements = stepContainerRef.current.querySelectorAll<HTMLElement>(
        '[data-radix-scroll-area-viewport], .overflow-y-auto'
      );
      scrollableElements.forEach((el) => {
        el.scrollTop = 0;
      });
      stepContainerRef.current.scrollTop = 0;
    }
  }

  function handleAddHistoryRecord(key: RepeatableHistoryKey) {
    const group = historyGroups[key];
    const currentCount = historyCounts[key];

    if (currentCount >= group.maxRecords) {
      return;
    }

    setHistoryCounts((previous) => ({
      ...previous,
      [key]: currentCount + 1
    }));
    setCurrentStep((step) => step + 1);
  }

  function handleRemoveHistoryRecord(key: RepeatableHistoryKey, recordNumber: number) {
    const group = historyGroups[key];
    const currentCount = historyCounts[key];

    if (currentCount <= 1) {
      clearHistoryRecordRange(group, 1, group.maxRecords);
      form.setFieldValue(group.gatewayFieldId, group.disabledValue);
      setHistoryCounts((previous) => ({
        ...previous,
        [key]: 1
      }));
      setCurrentStep((step) => Math.max(1, step - 1));
      return;
    }

    shiftHistoryRecords(group, recordNumber);
    setHistoryCounts((previous) => ({
      ...previous,
      [key]: Math.max(1, previous[key] - 1)
    }));

    if (recordNumber >= currentCount) {
      setCurrentStep((step) => Math.max(1, step - 1));
    }
  }

  function shiftHistoryRecords(group: RepeatableHistoryGroup, removedRecord: number) {
    for (let recordNumber = removedRecord; recordNumber < group.maxRecords; recordNumber += 1) {
      const targetSection = getHistorySection(definition.sections, group, recordNumber);
      const sourceSection = getHistorySection(definition.sections, group, recordNumber + 1);

      targetSection?.fields.forEach((targetField, index) => {
        const sourceField = sourceSection?.fields[index];
        form.setFieldValue(targetField.id, sourceField ? values[sourceField.id] || '' : '');
      });
    }

    clearHistoryRecordRange(group, group.maxRecords, group.maxRecords);
  }

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <ModalWrapper
        isOpen={isOpen && !isQueueSuccessOpen}
        onClose={onClose}
        maxWidth='max-w-[680px]'
        showCloseButton={false}
        backdropClassName='overflow-hidden'
        className='p-5 sm:p-6'
      >
        <form.AppForm>
          <form.Form className='gap-0 p-0 md:p-0'>
            <div className='flex flex-col gap-5'>
              <MedicalModalHeader
                currentStep={currentStep}
                progressLabel={definition.visitType}
                onBack={handleBack}
                totalSteps={totalSteps}
              />

              <div ref={stepContainerRef} className='min-h-[390px]'>
                {currentDescriptor.type === 'medical' ? (
                  <MedicalSectionStep
                    section={visibleMedicalSections[currentDescriptor.sectionIndex]}
                    historyActions={getHistoryRecordActions({
                      sectionId: visibleMedicalSections[currentDescriptor.sectionIndex]?.id,
                      historyCounts,
                      onAdd: handleAddHistoryRecord,
                      onRemove: handleRemoveHistoryRecord
                    })}
                    renderField={(field) => (
                      <form.AppField
                        key={field.id}
                        name={field.id}
                        validators={getFieldValidators(field)}
                      >
                        {(fieldApi) => (
                          <MedicalSchemaField fieldApi={fieldApi} schemaField={field} />
                        )}
                      </form.AppField>
                    )}
                  />
                ) : null}

                {currentDescriptor.type === 'doctor' ? (
                  <DoctorStep
                    doctors={doctors}
                    selectedDoctor={schedule.doctor}
                    serviceName={definition.serviceName}
                    onSelectDoctor={(doctor) =>
                      setSchedule((previous) => ({ ...previous, doctor: doctor }))
                    }
                  />
                ) : null}

                {currentDescriptor.type === 'date' ? (
                  <DateStep
                    doctorName={schedule.doctor}
                    selectedDateStr={schedule.dateStr}
                    onSelectDate={(dateStr) =>
                      setSchedule((previous) => ({ ...previous, dateStr, timeSlot: '' }))
                    }
                  />
                ) : null}

                {currentDescriptor.type === 'time' ? (
                  <TimeStep
                    doctorName={schedule.doctor}
                    selectedDateStr={schedule.dateStr}
                    selectedTimeSlot={schedule.timeSlot}
                    onSelectTimeSlot={(timeSlot) =>
                      setSchedule((previous) => ({ ...previous, timeSlot }))
                    }
                  />
                ) : null}

                {currentDescriptor.type === 'review' ? (
                  <ReviewStep
                    definitionTitle={definition.formTitle}
                    flow={flow}
                    activeSections={repeatableMedicalSections}
                    schedule={schedule}
                    serviceName={definition.serviceName}
                    values={values}
                  />
                ) : null}
              </div>

              <div className='flex items-center justify-between border-t border-border pt-4'>
                <Button type='button' variant='ghost' shape='pill' onClick={handleBack}>
                  {currentStep === 1 && !onBackToService ? 'Batal' : 'Kembali'}
                </Button>
                <Button
                  type='button'
                  variant='primary'
                  shape='pill'
                  disabled={
                    !isCurrentStepValid(currentDescriptor, visibleMedicalSections, values, schedule)
                  }
                  onClick={handleNext}
                  withTrailingCircleIcon
                  trailingIcon={
                    currentDescriptor.type === 'review' ? <Icons.check /> : <Icons.arrowUpRight />
                  }
                >
                  {currentDescriptor.type === 'review' ? 'Simpan Janji Temu' : 'Lanjutkan'}
                </Button>
              </div>
            </div>
          </form.Form>
        </form.AppForm>
      </ModalWrapper>

      <QueueSuccessModal
        isOpen={isQueueSuccessOpen}
        isProcessing={isProcessing}
        appointment={createdAppointment}
        queueItem={createdQueueItem}
        onClose={() => {
          setIsQueueSuccessOpen(false);
          onClose();
        }}
      />
    </>
  );
}

function MedicalModalHeader({
  currentStep,
  onBack,
  progressLabel,
  totalSteps
}: {
  currentStep: number;
  onBack: () => void;
  progressLabel: string;
  totalSteps: number;
}) {
  return (
    <PatientStepHeader
      currentStep={currentStep}
      totalSteps={totalSteps}
      onBack={onBack}
      progressLabel={progressLabel}
      className='mb-0'
    />
  );
}

function MedicalSectionStep({
  section,
  historyActions,
  renderField
}: {
  section: MedicalFormSection;
  historyActions?: HistoryRecordActions | null;
  renderField: (field: MedicalFormField) => React.ReactNode;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const scrollToTop = () => {
      if (scrollRef.current) {
        const viewport = scrollRef.current.querySelector(
          '[data-radix-scroll-area-viewport]'
        ) as HTMLElement | null;
        if (viewport) {
          viewport.scrollTop = 0;
        }
        scrollRef.current.scrollTop = 0;
      }
    };

    scrollToTop();
    const rafId = requestAnimationFrame(scrollToTop);
    return () => cancelAnimationFrame(rafId);
  }, [section?.id]);

  return (
    <div className='flex flex-col gap-4'>
      <StepTitle title={section.title} description={section.description} />
      {historyActions ? <HistoryRecordActionBar actions={historyActions} /> : null}
      <ScrollArea
        ref={scrollRef}
        key={section.id}
        className='h-[320px] sm:h-[350px] [&_[data-slot=scroll-area-scrollbar]]:hidden'
      >
        <FieldGroup className='gap-5 px-1 pt-1 pb-8'>{section.fields.map(renderField)}</FieldGroup>
      </ScrollArea>
    </div>
  );
}

function HistoryRecordActionBar({ actions }: { actions: HistoryRecordActions }) {
  return (
    <div className='flex items-center justify-between gap-3 border-b border-border pb-3'>
      <span className='text-xs font-medium text-muted-foreground'>
        Riwayat {actions.currentRecord} dari {actions.totalRecords}
      </span>
      <div className='flex items-center gap-2'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          shape='pill'
          onClick={actions.onRemove}
          leadingIcon={<Icons.trash />}
        >
          Hapus
        </Button>
        <Button
          type='button'
          variant='outline'
          size='sm'
          shape='pill'
          onClick={actions.onAdd}
          disabled={actions.totalRecords >= actions.maxRecords}
          leadingIcon={<Icons.add />}
        >
          Tambah
        </Button>
      </div>
    </div>
  );
}

function MedicalSchemaField({
  fieldApi,
  schemaField
}: {
  fieldApi: AnyFieldApi;
  schemaField: MedicalFormField;
}) {
  const error = getErrorMessage(fieldApi.state.meta.errors);
  const isInvalid = fieldApi.state.meta.isTouched && Boolean(error);
  const value = String(fieldApi.state.value ?? '');

  if (schemaField.type === 'MULTIPLE_CHOICE' || schemaField.choices.length === 2) {
    const choiceCount = schemaField.choices.length;
    const isSmoked = schemaField.id === 'smokedBeforePregnancy';

    return (
      <FieldSet data-invalid={isInvalid}>
        <FieldLegend variant='label'>
          {schemaField.title}
          {schemaField.required ? ' *' : ''}
        </FieldLegend>
        {schemaField.helpText ? (
          <FieldDescription className='text-xs'>{schemaField.helpText}</FieldDescription>
        ) : null}
        <ToggleGroup
          type='single'
          value={value}
          onValueChange={(nextValue: string) => {
            if (!nextValue) {
              return;
            }

            fieldApi.handleChange(nextValue);
            fieldApi.handleBlur();
          }}
          className={cn(
            'grid gap-2',
            isSmoked
              ? 'grid-cols-3'
              : choiceCount === 1
                ? 'grid-cols-1'
                : choiceCount === 2
                  ? 'grid-cols-2'
                  : 'sm:grid-cols-2'
          )}
        >
          {schemaField.choices.map((choice) => (
            <ToggleGroupItem
              key={choice}
              value={choice}
              aria-invalid={isInvalid}
              className={cn(
                'h-auto min-h-10 justify-start whitespace-normal rounded-md border border-border px-3 py-2 text-left text-xs font-medium leading-snug first:rounded-md last:rounded-md data-[state=on]:border-primary data-[state=on]:bg-primary/5 data-[state=on]:text-foreground',
                isSmoked && 'justify-center text-center font-medium'
              )}
            >
              {choice}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <FieldError errors={isInvalid ? [error] : []} />
      </FieldSet>
    );
  }

  if (schemaField.type === 'LIST') {
    return (
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor={schemaField.id}>
          {schemaField.title}
          {schemaField.required ? ' *' : ''}
        </FieldLabel>
        <Select
          value={value}
          onValueChange={(nextValue) => {
            fieldApi.handleChange(nextValue);
            fieldApi.handleBlur();
          }}
        >
          <SelectTrigger id={schemaField.id} aria-invalid={isInvalid} className='w-full'>
            <SelectValue placeholder='Pilih jawaban' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {schemaField.choices.map((choice) => (
                <SelectItem key={choice} value={choice}>
                  {choice}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {schemaField.helpText ? (
          <FieldDescription className='text-xs'>{schemaField.helpText}</FieldDescription>
        ) : null}
        <FieldError errors={isInvalid ? [error] : []} />
      </Field>
    );
  }

  if (schemaField.type === 'PARAGRAPH') {
    return (
      <Field data-invalid={isInvalid}>
        <FieldLabel htmlFor={schemaField.id}>
          {schemaField.title}
          {schemaField.required ? ' *' : ''}
        </FieldLabel>
        <Textarea
          id={schemaField.id}
          value={value}
          onBlur={fieldApi.handleBlur}
          onChange={(event) => fieldApi.handleChange(event.target.value)}
          aria-invalid={isInvalid}
          rows={3}
        />
        {schemaField.helpText ? (
          <FieldDescription className='text-xs'>{schemaField.helpText}</FieldDescription>
        ) : null}
        <FieldError errors={isInvalid ? [error] : []} />
      </Field>
    );
  }

  if (schemaField.type === 'DATE') {
    return (
      <Field data-invalid={isInvalid}>
        <PatientBirthdatePicker
          id={schemaField.id}
          value={value}
          onChange={(nextValue) => {
            fieldApi.handleChange(nextValue);
            fieldApi.handleBlur();
          }}
          label={`${schemaField.title}${schemaField.required ? ' *' : ''}`}
          placeholder='Pilih tanggal'
          ariaLabel={schemaField.title}
          error={isInvalid ? error : undefined}
          invalid={isInvalid}
          className='space-y-1'
        />
        {schemaField.helpText ? (
          <FieldDescription className='text-xs'>{schemaField.helpText}</FieldDescription>
        ) : null}
      </Field>
    );
  }

  if (
    schemaField.id === 'initialBmi' ||
    schemaField.id === 'motherAge' ||
    schemaField.id === 'partnerAge'
  ) {
    const isBmi = schemaField.id === 'initialBmi';
    const isMotherAge = schemaField.id === 'motherAge';
    const placeholder = isBmi
      ? 'Terisi otomatis saat tinggi dan berat badan diisi'
      : isMotherAge
        ? 'Terisi otomatis saat tanggal lahir dipilih'
        : 'Terisi otomatis saat tanggal lahir dipilih (atau isi manual)';

    return (
      <Field data-invalid={isInvalid}>
        <div className='flex items-center justify-between'>
          <FieldLabel htmlFor={schemaField.id}>
            {schemaField.title}
            {schemaField.required ? ' *' : ''}
          </FieldLabel>
          {value ? (
            <span className='rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary'>
              Otomatis terhitung
            </span>
          ) : null}
        </div>
        <Input
          id={schemaField.id}
          type='text'
          value={value}
          placeholder={placeholder}
          onBlur={fieldApi.handleBlur}
          onChange={(event) =>
            fieldApi.handleChange(normalizeMedicalFieldInput(schemaField, event.target.value))
          }
          aria-invalid={isInvalid}
          className={cn(value && 'bg-muted/40 font-semibold text-primary')}
        />
        {schemaField.helpText ? (
          <FieldDescription className='text-xs'>{schemaField.helpText}</FieldDescription>
        ) : null}
        <FieldError errors={isInvalid ? [error] : []} />
      </Field>
    );
  }

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={schemaField.id}>
        {schemaField.title}
        {schemaField.required ? ' *' : ''}
      </FieldLabel>
      <Input
        id={schemaField.id}
        type='text'
        value={value}
        onBlur={fieldApi.handleBlur}
        onChange={(event) =>
          fieldApi.handleChange(normalizeMedicalFieldInput(schemaField, event.target.value))
        }
        aria-invalid={isInvalid}
      />
      {schemaField.helpText ? (
        <FieldDescription className='text-xs'>{schemaField.helpText}</FieldDescription>
      ) : null}
      <FieldError errors={isInvalid ? [error] : []} />
    </Field>
  );
}

function DoctorStep({
  doctors,
  selectedDoctor,
  serviceName,
  onSelectDoctor
}: {
  doctors: ReturnType<typeof getDoctorsByService>;
  selectedDoctor: string;
  serviceName: string;
  onSelectDoctor: (doctor: string) => void;
}) {
  return (
    <div className='flex flex-col gap-4'>
      <StepTitle
        title='Pilih tenaga medis'
        description={`Pilih dokter atau bidan untuk layanan ${serviceName}.`}
      />
      <div className='grid gap-3'>
        {doctors.map((doctor) => {
          const isSelected = selectedDoctor === doctor.name;

          return (
            <button
              key={doctor.name}
              type='button'
              onClick={() => onSelectDoctor(doctor.name)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors',
                isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-accent'
              )}
            >
              <DoctorAvatar name={doctor.name} avatarUrl={doctor.avatar} size={44} />
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-semibold text-foreground'>{doctor.name}</p>
                <p className='truncate text-xs text-muted-foreground'>{doctor.location}</p>
              </div>
              {isSelected ? <Icons.check className='text-primary' /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DateStep({
  doctorName,
  selectedDateStr,
  onSelectDate
}: {
  doctorName: string;
  selectedDateStr: string;
  onSelectDate: (dateStr: string) => void;
}) {
  return (
    <div className='flex flex-col gap-4'>
      <StepTitle
        title='Tanggal kunjungan'
        description={`Pilih tanggal praktik yang tersedia untuk ${doctorName}.`}
      />
      <AppointmentCalendarDayPicker
        doctorName={doctorName}
        selectedDateStr={selectedDateStr}
        onSelectDate={onSelectDate}
      />
    </div>
  );
}

function TimeStep({
  doctorName,
  selectedDateStr,
  selectedTimeSlot,
  onSelectTimeSlot
}: {
  doctorName: string;
  selectedDateStr: string;
  selectedTimeSlot: string;
  onSelectTimeSlot: (timeSlot: string) => void;
}) {
  return (
    <div className='flex flex-col gap-4'>
      <StepTitle
        title='Jam kunjungan'
        description={`Pilih slot jam yang tersedia untuk ${doctorName} pada ${selectedDateStr}.`}
      />
      <AppointmentTimeSlotPicker
        doctorName={doctorName}
        selectedDateStr={selectedDateStr}
        selectedTimeSlot={selectedTimeSlot}
        onSelectTimeSlot={onSelectTimeSlot}
      />
    </div>
  );
}

function ReviewStep({
  definitionTitle,
  flow,
  activeSections,
  schedule,
  serviceName,
  values
}: {
  definitionTitle: string;
  flow: MedicalAppointmentFlow;
  activeSections: MedicalFormSection[];
  schedule: ScheduleValues;
  serviceName: string;
  values: MedicalAppointmentValues;
}) {
  const automatic = buildAutomaticRecord(flow, values);
  const answeredFields = collectAnsweredFieldsFromSections(activeSections, values);

  const automaticLabels: Record<string, string> = {
    imtAtSubmit: 'IMT (Indeks Massa Tubuh)',
    estimatedDueDate: 'Taksiran Persalinan (HPL)',
    gestationalAgeAtSubmit: 'Usia Kehamilan Saat Submit',
    childAgeAtSubmit: 'Usia Anak Saat Submit'
  };

  return (
    <div className='flex flex-col gap-4'>
      <StepTitle
        title='Konfirmasi data'
        description='Pastikan jadwal dan jawaban form sudah benar sebelum disimpan.'
      />
      <div className='grid gap-2 text-xs'>
        <SummaryRow label='Form' value={definitionTitle} />
        <SummaryRow label='Layanan' value={serviceName} />
        <SummaryRow label='Tenaga medis' value={schedule.doctor} />
        <SummaryRow label='Tanggal' value={schedule.dateStr} />
        <SummaryRow label='Jam' value={schedule.timeSlot} />
        {Object.entries(automatic)
          .filter(([, value]) => value)
          .map(([key, value]) => (
            <SummaryRow key={key} label={automaticLabels[key] || key} value={value} />
          ))}
      </div>

      <ScrollArea className='h-[190px] rounded-lg border border-border p-3'>
        <div className='grid gap-2 pr-3 text-xs'>
          {answeredFields.map((answer) => (
            <SummaryRow key={answer.id} label={answer.label} value={answer.value} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='grid grid-cols-[140px_1fr] gap-3 border-b border-border/60 pb-2 last:border-b-0'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='font-medium text-foreground'>{value || '-'}</span>
    </div>
  );
}

function StepTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 className='text-base font-semibold tracking-tight text-foreground'>{title}</h3>
      <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>{description}</p>
    </div>
  );
}

function getFieldValidators(field: MedicalFormField) {
  const schema = getMedicalFieldValidationSchema(field);

  return {
    onChange: schema,
    onBlur: schema
  };
}

function getErrorMessage(errors: unknown[]): string | undefined {
  const [firstError] = errors;

  if (!firstError) {
    return undefined;
  }

  if (typeof firstError === 'string') {
    return firstError;
  }

  if (typeof firstError === 'object' && 'message' in firstError) {
    return String((firstError as { message: unknown }).message);
  }

  return String(firstError);
}

function isCurrentStepValid(
  descriptor: StepDescriptor,
  sections: ReturnType<typeof getActiveMedicalSections>,
  values: MedicalAppointmentValues,
  schedule: ScheduleValues
): boolean {
  if (descriptor.type === 'medical') {
    return isMedicalSectionValid(sections[descriptor.sectionIndex], values);
  }

  if (descriptor.type === 'doctor') {
    return Boolean(schedule.doctor);
  }

  if (descriptor.type === 'date') {
    return Boolean(schedule.dateStr);
  }

  if (descriptor.type === 'time') {
    return Boolean(schedule.timeSlot);
  }

  return Boolean(schedule.doctor && schedule.dateStr && schedule.timeSlot);
}

function buildComplaintText(complaintFieldId: string, values: MedicalAppointmentValues): string {
  const complaint = values[complaintFieldId]?.trim();

  if (complaint) {
    return complaint;
  }

  return 'Intake medis awal sudah diisi pasien.';
}

function isHistorySectionVisible(
  sectionId: string,
  historyCounts: RepeatableHistoryCounts
): boolean {
  const historySection = getHistorySectionMeta(sectionId);

  if (!historySection) {
    return true;
  }

  return historySection.recordNumber <= historyCounts[historySection.group.key];
}

function getHistoryRecordActions({
  sectionId,
  historyCounts,
  onAdd,
  onRemove
}: {
  sectionId?: string;
  historyCounts: RepeatableHistoryCounts;
  onAdd: (key: RepeatableHistoryKey) => void;
  onRemove: (key: RepeatableHistoryKey, recordNumber: number) => void;
}): HistoryRecordActions | null {
  if (!sectionId) {
    return null;
  }

  const historySection = getHistorySectionMeta(sectionId);

  if (!historySection) {
    return null;
  }

  const totalRecords = historyCounts[historySection.group.key];

  return {
    currentRecord: historySection.recordNumber,
    totalRecords,
    maxRecords: historySection.group.maxRecords,
    onAdd: () => onAdd(historySection.group.key),
    onRemove: () => onRemove(historySection.group.key, historySection.recordNumber)
  };
}

function getHistorySectionMeta(sectionId: string) {
  for (const group of Object.values(historyGroups)) {
    const sectionIndex = group.sectionIds.indexOf(sectionId);

    if (sectionIndex >= 0) {
      return {
        group,
        recordNumber: sectionIndex + 1
      };
    }
  }

  return null;
}

function getHistorySection(
  sections: MedicalFormSection[],
  group: RepeatableHistoryGroup,
  recordNumber: number
): MedicalFormSection | undefined {
  const sectionId = group.sectionIds[recordNumber - 1];

  return sections.find((section) => section.id === sectionId);
}

function pickMedicalValues(
  activeSections: MedicalFormSection[],
  values: MedicalAppointmentValues
): MedicalAppointmentValues {
  return activeSections.reduce<MedicalAppointmentValues>((result, section) => {
    section.fields.forEach((field) => {
      result[field.id] = values[field.id] || '';
    });

    return result;
  }, {});
}

function collectAnsweredFieldsFromSections(
  sections: MedicalFormSection[],
  values: MedicalAppointmentValues
) {
  return sections.flatMap((section) =>
    section.fields
      .map((field) => ({
        id: field.id,
        label: field.label,
        value: values[field.id] || ''
      }))
      .filter((answer) => answer.value.trim().length > 0)
  );
}

function buildRegistrationPrefill(
  flow: MedicalAppointmentFlow,
  patient: Patient | null
): MedicalAppointmentValues {
  if (!patient) {
    return {};
  }

  const birthDate = normalizeBirthDate(patient.birth_date || patient.tanggal_lahir || '');
  const bloodType = normalizeBloodType(patient.blood_type || '');
  const phone = patient.nomor_telepon_wa || patient.phone || '';
  const address = patient.domisili || patient.address || '';
  const nik = patient.nik_ktp || patient.nik || '';

  if (flow === 'pregnancy') {
    return pruneEmptyValues({
      motherName: patient.name,
      motherNik: nik,
      motherBirthDate: birthDate,
      motherAge: patient.age ? `${patient.age} tahun` : '',
      motherJob: patient.pekerjaan || '',
      phoneNumber: phone,
      domicileAddress: address,
      identityCardAddress: patient.address || address,
      motherBloodType: bloodType
    });
  }

  return pruneEmptyValues({
    childName: patient.name,
    childNik: nik,
    childBirthDate: birthDate,
    childSex: patient.gender,
    parentPhone: phone,
    motherName: patient.nama_ibu_kandung || '',
    childAddress: address
  });
}

function pruneEmptyValues(values: MedicalAppointmentValues): MedicalAppointmentValues {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => Boolean(value.trim()))
  ) as MedicalAppointmentValues;
}

function normalizeBirthDate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) {
    return '';
  }

  return `${match[3]}-${match[2]}-${match[1]}`;
}

function normalizeBloodType(value: string): string {
  const baseType = value.replace(/[+-]/g, '');

  if (baseType === 'Belum Tahu') {
    return 'Belum tahu';
  }

  return ['A', 'B', 'AB', 'O'].includes(baseType) ? baseType : '';
}
