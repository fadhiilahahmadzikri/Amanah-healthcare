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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { PatientBirthdatePicker } from '@/features/data-pasien/components/registration/molecules/patient-birthdate-picker';
import { cn } from '@/lib/utils';

import type { AppointmentFormData, Doctor, MedicalAppointmentFlow } from '../api/types';
import type {
  MedicalFormField,
  MedicalFormSection
} from '../constants/medical-appointment-schemas';
import {
  historyGroups,
  useMedicalAppointmentForm,
  type ScheduleValues
} from '../model/useMedicalAppointmentForm';
import {
  getMedicalFieldValidationSchema,
  normalizeMedicalFieldInput
} from '../schemas/medical-appointment-validation';
import { buildAutomaticRecord, type MedicalAppointmentValues } from '../utils/medical-appointment';
import { AppointmentCalendarDayPicker } from './appointment-calendar-day-picker';
import { AppointmentTimeSlotPicker } from './appointment-time-slot-picker';
import { DoctorAvatar } from './doctor-avatar';
import { MedicalHistoryCatalog } from './medical-history-catalog';
import { MedicalQuestionnaire } from './questionnaire';
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
    doctors,
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
          <form.Form className='flex min-h-0 flex-1 flex-col gap-0 p-0 md:p-0'>
            <div className='flex min-h-0 flex-1 flex-col justify-between gap-4'>
              <div ref={stepContainerRef} className='flex min-h-0 flex-1 flex-col'>
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
                    className='min-h-0 flex-1 overflow-y-auto pr-1 pb-2'
                  />
                ) : null}

                {currentDescriptor.type === 'doctor' ? (
                  <DoctorStep
                    doctors={doctors}
                    selectedDoctor={schedule.doctor}
                    serviceName={definition.serviceName}
                    onSelectDoctor={(doctor) =>
                      actions.setSchedule((previous) => ({
                        ...previous,
                        doctor
                      }))
                    }
                  />
                ) : null}

                {currentDescriptor.type === 'date' ? (
                  <DateStep
                    doctorName={schedule.doctor}
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
                    doctorName={schedule.doctor}
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

function MedicalSectionStep({
  section,
  catalogActionType,
  onReturnToCatalog,
  renderField,
  values,
  onFieldChange
}: {
  section: MedicalFormSection;
  catalogActionType?: 'add' | 'edit' | null;
  onReturnToCatalog?: () => void;
  renderField: (field: MedicalFormField) => React.ReactNode;
  values?: MedicalAppointmentValues;
  onFieldChange?: (fieldId: string, value: string) => void;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const isGrid = section?.layout === 'grid';
  const isQuestionnaire = section?.layout === 'questionnaire';

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
    <div className='flex min-h-0 flex-1 flex-col gap-4'>
      {catalogActionType && onReturnToCatalog ? (
        <div className='flex items-center justify-between rounded-lg bg-primary/10 px-3.5 py-2 text-xs font-medium text-primary'>
          <div className='flex items-center gap-2'>
            {catalogActionType === 'add' ? (
              <Icons.add className='size-3.5' />
            ) : (
              <Icons.edit className='size-3.5' />
            )}
            <span>
              {catalogActionType === 'add'
                ? 'Sedang menambah data riwayat'
                : 'Sedang mengubah data riwayat'}
            </span>
          </div>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            shape='pill'
            onClick={onReturnToCatalog}
            className='h-6 text-xs text-primary hover:bg-primary/20'
          >
            Kembali ke Katalog
          </Button>
        </div>
      ) : null}
      <StepTitle title={section.title} description={section.description} />
      <ScrollArea
        ref={scrollRef}
        key={section.id}
        className='min-h-0 flex-1 [&_[data-slot=scroll-area-scrollbar]]:hidden'
      >
        {isQuestionnaire && values && onFieldChange ? (
          <div className='px-1 pt-0 pb-8'>
            <MedicalQuestionnaire section={section} values={values} onFieldChange={onFieldChange} />
          </div>
        ) : (
          <FieldGroup
            className={cn(
              isGrid
                ? 'grid grid-cols-1 items-start gap-x-4 gap-y-4 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-4.5'
                : 'gap-5',
              'px-1 pt-1 pb-8'
            )}
          >
            {section.fields.map(renderField)}
          </FieldGroup>
        )}
      </ScrollArea>
    </div>
  );
}

const SPECIFIC_FIELD_PLACEHOLDERS: Record<string, string> = {
  motherName: 'Masukkan nama lengkap...',
  motherNik: '16 digit NIK sesuai KTP / KK',
  motherBirthDate: 'Pilih tanggal lahir...',
  motherAge: 'Contoh: 31 tahun',
  marriageOrder: 'Contoh: 1',
  marriageDate: 'Pilih tanggal menikah...',
  motherJob: 'Contoh: Karyawan swasta, Wiraswasta',
  motherEducation: 'Pilih pendidikan terakhir...',
  religion: 'Pilih agama...',
  phoneNumber: 'Contoh: 081234567890',
  domicileAddress: 'Tuliskan alamat domisili saat ini...',
  identityCardAddress: 'Tuliskan alamat sesuai KTP...',
  dasawisma: 'Nama kelompok Dasawisma...',
  posyandu: 'Nama Posyandu...',
  puskesmas: 'Nama Puskesmas...',
  partnerName: 'Masukkan nama lengkap suami/pasangan...',
  partnerNik: '16 digit NIK sesuai KTP / KK',
  partnerBirthDate: 'Pilih tanggal lahir suami/pasangan...',
  partnerAge: 'Contoh: 31 tahun',
  partnerJob: 'Contoh: Karyawan swasta, Wiraswasta',
  partnerEducation: 'Pilih pendidikan terakhir suami/pasangan...',
  heightCm: 'Contoh: 156 cm',
  prePregnancyWeightKg: 'Contoh: 52 kg',
  upperArmCircumferenceCm: 'Contoh: 23.5 cm',
  initialBmi: 'Contoh: 21.5',
  tetanusStatus: 'Pilih status imunisasi TT/Td...',
  motherBloodType: 'Pilih golongan darah...',
  partnerBloodType: 'Pilih golongan darah suami...',
  hpht: 'Pilih tanggal HPHT...',
  estimatedDueDate: 'Otomatis terhitung setelah HPHT dipilih',
  gestationalAge: 'Otomatis terhitung setelah HPHT dipilih',
  currentComplaints: 'Contoh: Mual, pusing, atau Tidak ada',
  contraception1Type: 'Pilih jenis KB...',
  contraception1StartDate: 'Pilih tanggal mulai...',
  contraception1StopDate: 'Pilih tanggal berhenti...',
  pregnancy1Outcome: 'Pilih hasil kehamilan...',
  pregnancy1BirthYear: 'Contoh: 2020',
  otherDiseaseHistoryNotes: 'Tuliskan riwayat penyakit lainnya...',
  childName: 'Masukkan nama lengkap anak...',
  childNik: '16 digit NIK sesuai KK / KIA',
  childBirthDate: 'Pilih tanggal lahir anak...',
  childSex: 'Pilih jenis kelamin anak...',
  parentPhone: 'Contoh: 081234567890',
  fatherName: 'Masukkan nama lengkap ayah...',
  childAddress: 'Tuliskan alamat domisili anak saat ini...',
  previousVaccineHistory: 'Contoh: HB 0, BCG, Polio 1 (sesuai buku KIA)',
  childAllergyHistory: 'Tuliskan jika ada alergi, atau Tidak ada',
  gravidaCount: 'Contoh: 1',
  parityCount: 'Contoh: 0',
  abortionCount: 'Contoh: 0',
  livingChildrenCount: 'Contoh: 1'
};

function getFieldPlaceholder(schemaField: MedicalFormField): string {
  if (schemaField.placeholder) {
    return schemaField.placeholder;
  }
  if (SPECIFIC_FIELD_PLACEHOLDERS[schemaField.id]) {
    return SPECIFIC_FIELD_PLACEHOLDERS[schemaField.id];
  }

  const id = schemaField.id.toLowerCase();
  if (id.includes('count') || id.includes('jumlah')) {
    return 'Contoh: 1';
  }
  if (id.includes('name') || id.includes('nama')) {
    return 'Masukkan nama lengkap...';
  }
  if (id.includes('phone') || id.includes('telepon') || id.includes('hp') || id.includes('wa')) {
    return 'Contoh: 081234567890';
  }
  if (id.includes('job') || id.includes('pekerjaan')) {
    return 'Contoh: Karyawan swasta, Wiraswasta';
  }
  if (id.includes('address') || id.includes('alamat') || id.includes('domisili')) {
    return 'Tuliskan alamat lengkap...';
  }
  if (id.includes('nik')) {
    return '16 digit NIK sesuai KTP / KK';
  }
  if (id.includes('age') || id.includes('umur') || id.includes('usia')) {
    return 'Contoh: 31 tahun';
  }
  if (id.includes('weight') || id.includes('berat')) {
    return 'Contoh: 50 kg';
  }
  if (id.includes('height') || id.includes('tinggi')) {
    return 'Contoh: 155 cm';
  }
  if (schemaField.type === 'DATE') {
    return 'Pilih tanggal...';
  }
  if (schemaField.type === 'LIST') {
    return 'Pilih opsi...';
  }
  if (schemaField.type === 'PARAGRAPH') {
    return 'Tuliskan keterangan jika ada...';
  }

  return 'Contoh: 1';
}

function MedicalSchemaField({
  fieldApi,
  schemaField
}: {
  fieldApi: AnyFieldApi;
  schemaField: MedicalFormField;
}) {
  const rawError = getErrorMessage(fieldApi.state.meta.errors);
  const isInvalid = fieldApi.state.meta.isTouched && Boolean(rawError);
  const displayError = isInvalid && rawError && rawError !== 'Wajib diisi' ? rawError : undefined;
  const value = String(fieldApi.state.value ?? '');

  const isColSpanFull =
    schemaField.colSpan === 'full' || schemaField.colSpan === 2 || schemaField.type === 'PARAGRAPH';
  const colSpanClass = isColSpanFull ? 'col-span-1 sm:col-span-2' : 'col-span-1';

  const requiredAsterisk = schemaField.required ? (
    <span className='ml-1 font-bold text-red-500 dark:text-red-400' aria-hidden='true'>
      *
    </span>
  ) : null;

  if (schemaField.type === 'MULTIPLE_CHOICE' || schemaField.choices.length === 2) {
    const isSmoked = schemaField.id === 'smokedBeforePregnancy';
    const isTwoChoices = schemaField.choices.length === 2;

    return (
      <FieldSet data-invalid={isInvalid} className={cn('gap-3', colSpanClass)}>
        <FieldLegend variant='label' className='mb-1.5 text-sm leading-snug font-medium'>
          <span>
            {schemaField.title}
            {requiredAsterisk}
          </span>
        </FieldLegend>
        {schemaField.helpText ? (
          <FieldDescription className='text-xs text-muted-foreground'>
            {schemaField.helpText}
          </FieldDescription>
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
          className={cn('mt-1 w-fit gap-2.5', isTwoChoices ? 'grid grid-cols-2' : 'flex flex-wrap')}
        >
          {schemaField.choices.map((choice) => (
            <ToggleGroupItem
              key={choice}
              value={choice}
              aria-invalid={isInvalid}
              className={cn(
                'h-auto min-h-10 cursor-pointer justify-center whitespace-normal rounded-md border border-border px-4 py-2 text-center text-xs leading-snug font-medium transition-all first:rounded-md last:rounded-md data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:font-semibold data-[state=on]:text-primary',
                isTwoChoices ? 'w-full min-w-[130px] sm:min-w-[140px]' : 'w-fit',
                isSmoked && 'justify-center text-center font-medium'
              )}
            >
              {choice}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <FieldError errors={displayError ? [displayError] : []} />
      </FieldSet>
    );
  }

  if (schemaField.type === 'LIST') {
    const placeholder = getFieldPlaceholder(schemaField);

    return (
      <Field data-invalid={isInvalid} className={cn('gap-2', colSpanClass)}>
        <FieldLabel
          htmlFor={schemaField.id}
          className='min-h-[1.25rem] text-sm leading-snug font-medium'
        >
          <span>
            {schemaField.title}
            {requiredAsterisk}
          </span>
        </FieldLabel>
        <Select
          value={value}
          disabled={schemaField.disabled}
          onValueChange={(nextValue) => {
            fieldApi.handleChange(nextValue);
            fieldApi.handleBlur();
          }}
        >
          <SelectTrigger id={schemaField.id} aria-invalid={isInvalid} className='w-full'>
            <SelectValue placeholder={placeholder} />
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
        <FieldError errors={displayError ? [displayError] : []} />
      </Field>
    );
  }

  if (schemaField.type === 'PARAGRAPH') {
    const placeholder = getFieldPlaceholder(schemaField);

    return (
      <Field data-invalid={isInvalid} className={cn('gap-2', colSpanClass)}>
        <FieldLabel
          htmlFor={schemaField.id}
          className='min-h-[1.25rem] text-sm leading-snug font-medium'
        >
          <span>
            {schemaField.title}
            {requiredAsterisk}
          </span>
        </FieldLabel>
        <Textarea
          id={schemaField.id}
          value={value}
          placeholder={placeholder}
          disabled={schemaField.disabled}
          onBlur={fieldApi.handleBlur}
          onChange={(event) => fieldApi.handleChange(event.target.value)}
          aria-invalid={isInvalid}
          rows={3}
        />
        <FieldError errors={displayError ? [displayError] : []} />
      </Field>
    );
  }

  if (schemaField.type === 'DATE') {
    const placeholder = getFieldPlaceholder(schemaField);

    return (
      <Field data-invalid={isInvalid} className={cn('gap-2', colSpanClass)}>
        <FieldLabel
          htmlFor={schemaField.id}
          className='min-h-[1.25rem] text-sm leading-snug font-medium'
        >
          <span>
            {schemaField.title}
            {requiredAsterisk}
          </span>
        </FieldLabel>
        <PatientBirthdatePicker
          id={schemaField.id}
          value={value}
          onChange={(nextValue) => {
            fieldApi.handleChange(nextValue);
            fieldApi.handleBlur();
          }}
          label={null}
          placeholder={placeholder}
          ariaLabel={schemaField.title}
          error={undefined}
          invalid={isInvalid}
          className='w-full space-y-0'
        />
        <FieldError errors={displayError ? [displayError] : []} />
      </Field>
    );
  }

  if (
    schemaField.id === 'initialBmi' ||
    schemaField.id === 'motherAge' ||
    schemaField.id === 'partnerAge' ||
    schemaField.id === 'estimatedDueDate' ||
    schemaField.id === 'gestationalAge'
  ) {
    const placeholder = getFieldPlaceholder(schemaField);

    return (
      <Field data-invalid={isInvalid} className={cn('gap-2', colSpanClass)}>
        <FieldLabel
          htmlFor={schemaField.id}
          className='min-h-[1.25rem] text-sm leading-snug font-medium'
        >
          <span>
            {schemaField.title}
            {requiredAsterisk}
          </span>
        </FieldLabel>
        <Input
          id={schemaField.id}
          type='text'
          value={value}
          placeholder={placeholder}
          disabled={schemaField.disabled}
          onBlur={fieldApi.handleBlur}
          onChange={(event) =>
            fieldApi.handleChange(normalizeMedicalFieldInput(schemaField, event.target.value))
          }
          aria-invalid={isInvalid}
          className={cn(value && 'bg-muted/20 font-normal text-foreground')}
        />
        {value ? <p className='text-xs text-muted-foreground'>Otomatis terhitung</p> : null}
        <FieldError errors={displayError ? [displayError] : []} />
      </Field>
    );
  }

  const placeholder = getFieldPlaceholder(schemaField);
  const isPairedGridCount = schemaField.id === 'gravidaCount' || schemaField.id === 'parityCount';

  return (
    <Field data-invalid={isInvalid} className={cn('gap-2', colSpanClass)}>
      <FieldLabel
        htmlFor={schemaField.id}
        className={cn(
          'text-sm leading-snug font-medium',
          isPairedGridCount ? 'flex items-start sm:min-h-[2.5rem]' : 'min-h-[1.25rem]'
        )}
      >
        <span>
          {schemaField.title}
          {requiredAsterisk}
        </span>
      </FieldLabel>
      <Input
        id={schemaField.id}
        type='text'
        value={value}
        placeholder={placeholder}
        disabled={schemaField.disabled}
        onBlur={fieldApi.handleBlur}
        onChange={(event) =>
          fieldApi.handleChange(normalizeMedicalFieldInput(schemaField, event.target.value))
        }
        aria-invalid={isInvalid}
      />
      <FieldError errors={displayError ? [displayError] : []} />
    </Field>
  );
}

function DoctorStep({
  doctors,
  selectedDoctor,
  serviceName,
  onSelectDoctor
}: {
  doctors: Doctor[];
  selectedDoctor: string;
  serviceName: string;
  onSelectDoctor: (doctor: string) => void;
}) {
  return (
    <div className='flex min-h-0 flex-1 flex-col gap-4'>
      <StepTitle
        title='Pilih tenaga medis'
        description={`Pilih dokter atau bidan untuk layanan ${serviceName}.`}
      />
      <ScrollArea className='min-h-0 flex-1 [&_[data-slot=scroll-area-scrollbar]]:hidden'>
        <div className='grid gap-3 pr-1 pb-4'>
          {doctors.map((doctor) => {
            const isSelected = selectedDoctor === doctor.name;

            return (
              <button
                key={doctor.name}
                type='button'
                onClick={() => onSelectDoctor(doctor.name)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:bg-accent'
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
      </ScrollArea>
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
    <div className='flex min-h-0 flex-1 flex-col gap-4'>
      <StepTitle
        title='Tanggal kunjungan'
        description={`Pilih tanggal praktik yang tersedia untuk ${doctorName}.`}
      />
      <div className='min-h-0 flex-1 overflow-y-auto pr-1 pb-2'>
        <AppointmentCalendarDayPicker
          doctorName={doctorName}
          selectedDateStr={selectedDateStr}
          onSelectDate={onSelectDate}
        />
      </div>
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
    <div className='flex min-h-0 flex-1 flex-col gap-4'>
      <StepTitle
        title='Jam kunjungan'
        description={`Pilih slot jam yang tersedia untuk ${doctorName} pada ${selectedDateStr}.`}
      />
      <div className='min-h-0 flex-1 overflow-y-auto pr-1 pb-2'>
        <AppointmentTimeSlotPicker
          doctorName={doctorName}
          selectedDateStr={selectedDateStr}
          selectedTimeSlot={selectedTimeSlot}
          onSelectTimeSlot={onSelectTimeSlot}
        />
      </div>
    </div>
  );
}

function ReviewStep({
  definitionTitle,
  flow,
  answeredFields,
  schedule,
  serviceName,
  values
}: {
  definitionTitle: string;
  flow: MedicalAppointmentFlow;
  answeredFields: { id: string; label: string; value: string }[];
  schedule: ScheduleValues;
  serviceName: string;
  values: MedicalAppointmentValues;
}) {
  const automatic = buildAutomaticRecord(flow, values);

  const automaticLabels: Record<string, string> = {
    imtAtSubmit: 'IMT (Indeks Massa Tubuh)',
    estimatedDueDate: 'Taksiran Persalinan (HPL)',
    gestationalAgeAtSubmit: 'Usia Kehamilan Saat Submit',
    childAgeAtSubmit: 'Usia Anak Saat Submit'
  };

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-4'>
      <StepTitle
        title='Konfirmasi data'
        description='Pastikan jadwal dan jawaban form sudah benar sebelum disimpan.'
      />
      <div className='grid shrink-0 gap-2 text-xs'>
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

      <ScrollArea className='min-h-[160px] flex-1 rounded-lg border border-border p-3'>
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
