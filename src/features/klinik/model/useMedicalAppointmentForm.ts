'use client';

import * as React from 'react';
import { useStore } from '@tanstack/react-form';
import { useAppForm } from '@/components/ui/tanstack-form';
import { toast } from 'sonner';
import type { Patient } from '@/features/data-pasien/api/types';
import type {
  Appointment,
  AppointmentFormData,
  Doctor,
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
  type MedicalFormSection
} from '../constants/medical-appointment-schemas';
import {
  buildDefaultMedicalValues,
  buildMedicalIntakeRecord,
  calculateAgeInYears,
  calculateBmi,
  getActiveMedicalSections,
  type MedicalAppointmentValues
} from '../utils/medical-appointment';
import { isMedicalSectionValid } from '../schemas/medical-appointment-validation';
import {
  calculateEddFromLmp,
  calculateGestationalAge as calculateObstetricGestationalAge,
  formatIndonesianDateText
} from '../utils/obstetric-calculator';

export type ScheduleValues = {
  doctor: string;
  dateStr: string;
  timeSlot: string;
};

export type RepeatableHistoryKey = 'pregnancy' | 'contraception';

export type StepDescriptor =
  | {
      type: 'medical';
      sectionIndex: number;
    }
  | {
      type: 'history-catalog';
      historyKey: RepeatableHistoryKey;
    }
  | {
      type: 'doctor' | 'date' | 'time' | 'review';
    };

export type RepeatableHistoryCounts = Record<RepeatableHistoryKey, number>;

export interface RepeatableHistoryGroup {
  key: RepeatableHistoryKey;
  sectionIds: string[];
  gatewayFieldId: string;
  disabledValue: string;
  enabledValue: string;
  maxRecords: number;
}

export interface HistoryRecordActions {
  currentRecord: number;
  totalRecords: number;
  maxRecords: number;
  onAdd: () => void;
  onRemove: () => void;
}

export interface HistoryPromptState {
  groupKey: RepeatableHistoryKey;
  currentRecord: number;
}

export interface CatalogActionState {
  type: 'add' | 'edit';
  groupKey: RepeatableHistoryKey;
  recordNumber: number;
}

export const scheduleStepDescriptors: StepDescriptor[] = [
  { type: 'doctor' },
  { type: 'date' },
  { type: 'time' },
  { type: 'review' }
];

export const historyGroups: Record<RepeatableHistoryKey, RepeatableHistoryGroup> = {
  pregnancy: {
    key: 'pregnancy',
    sectionIds: [
      'previousPregnancy1Details',
      'previousPregnancy2Details',
      'previousPregnancy3Details',
      'previousPregnancy4Details'
    ],
    gatewayFieldId: 'hasPreviousPregnancyHistory',
    disabledValue: 'Belum/tidak ada',
    enabledValue: 'Ya, ada',
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
    enabledValue: 'Ya, pernah',
    maxRecords: 4
  }
};

export const defaultHistoryCounts: RepeatableHistoryCounts = {
  pregnancy: 1,
  contraception: 1
};

export interface UseMedicalAppointmentFormOptions {
  flow: MedicalAppointmentFlow;
  isOpen: boolean;
  onClose: () => void;
  onCreated: (formData: AppointmentFormData) => void;
  onBackToService?: () => void;
}

export type UseMedicalAppointmentFormResult = ReturnType<typeof useMedicalAppointmentForm>;

export function useMedicalAppointmentForm({
  flow,
  isOpen,
  onClose,
  onCreated,
  onBackToService
}: UseMedicalAppointmentFormOptions) {
  const definition = React.useMemo(() => getMedicalFlowDefinition(flow), [flow]);
  const defaultValues = React.useMemo(() => buildDefaultMedicalValues(definition), [definition]);
  const doctors = React.useMemo<Doctor[]>(
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
  const [historyPrompt, setHistoryPrompt] = React.useState<HistoryPromptState | null>(null);
  const [catalogAction, setCatalogAction] = React.useState<CatalogActionState | null>(null);
  const [pendingNavigateSectionId, setPendingNavigateSectionId] = React.useState<string | null>(
    null
  );
  const [pendingNavigateCatalogKey, setPendingNavigateCatalogKey] =
    React.useState<RepeatableHistoryKey | null>(null);

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
      activeMedicalSections.filter((section) =>
        isHistorySectionVisible(section.id, historyCounts, catalogAction)
      ),
    [activeMedicalSections, historyCounts, catalogAction]
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

  const activeSteps = React.useMemo<StepDescriptor[]>(() => {
    const steps: StepDescriptor[] = [];

    visibleMedicalSections.forEach((section, sectionIndex) => {
      steps.push({ type: 'medical', sectionIndex });

      const targetPregnancyAnchorId =
        catalogAction?.groupKey === 'pregnancy' && catalogAction.type === 'add'
          ? `previousPregnancy${catalogAction.recordNumber}Details`
          : historyCounts.pregnancy === 0
            ? 'obstetricSummary'
            : `previousPregnancy${historyCounts.pregnancy}Details`;

      if (
        values.hasPreviousPregnancyHistory === historyGroups.pregnancy.enabledValue &&
        section.id === targetPregnancyAnchorId
      ) {
        steps.push({ type: 'history-catalog', historyKey: 'pregnancy' });
      }

      const targetContraceptionAnchorId =
        catalogAction?.groupKey === 'contraception' && catalogAction.type === 'add'
          ? `contraception${catalogAction.recordNumber}Details`
          : historyCounts.contraception === 0
            ? 'contraceptionGateway'
            : `contraception${historyCounts.contraception}Details`;

      if (
        values.hasContraceptionHistory === historyGroups.contraception.enabledValue &&
        section.id === targetContraceptionAnchorId
      ) {
        steps.push({ type: 'history-catalog', historyKey: 'contraception' });
      }
    });

    steps.push(...scheduleStepDescriptors);
    return steps;
  }, [
    visibleMedicalSections,
    values.hasPreviousPregnancyHistory,
    values.hasContraceptionHistory,
    historyCounts,
    catalogAction
  ]);

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
      setHistoryPrompt(null);
      setCatalogAction(null);
      setPendingNavigateSectionId(null);
      setPendingNavigateCatalogKey(null);
    }
  }, [flow, isOpen]);

  React.useEffect(() => {
    Object.entries(registrationPrefill).forEach(([fieldId, value]) => {
      if (value.trim()) {
        form.setFieldValue(fieldId, value);
      }
    });
  }, [form, registrationPrefill]);

  React.useEffect(() => {
    const contraceptionGroup = historyGroups.contraception;

    if (values.hasContraceptionHistory === contraceptionGroup.disabledValue) {
      clearHistoryRecordRange(contraceptionGroup, 1, contraceptionGroup.maxRecords);
      setHistoryCounts((previous) => ({
        ...previous,
        contraception: 1
      }));
    }
  }, [clearHistoryRecordRange, values.hasContraceptionHistory]);

  React.useEffect(() => {
    const pregnancyGroup = historyGroups.pregnancy;

    if (values.hasPreviousPregnancyHistory === pregnancyGroup.disabledValue) {
      clearHistoryRecordRange(pregnancyGroup, 1, pregnancyGroup.maxRecords);
      setHistoryCounts((previous) => ({
        ...previous,
        pregnancy: 1
      }));
    }
  }, [clearHistoryRecordRange, values.hasPreviousPregnancyHistory]);

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
    if (values.hpht) {
      try {
        const edd = calculateEddFromLmp(values.hpht);
        const estimatedDueDate = formatIndonesianDateText(edd);
        const gestationalAge = calculateObstetricGestationalAge(edd, new Date()).formatted;

        if (values.estimatedDueDate !== estimatedDueDate) {
          form.setFieldValue('estimatedDueDate', estimatedDueDate);
        }
        if (values.gestationalAge !== gestationalAge) {
          form.setFieldValue('gestationalAge', gestationalAge);
        }
      } catch {
        // Invalid date input is handled by field validation.
      }
      return;
    }

    if (values.estimatedDueDate) {
      form.setFieldValue('estimatedDueDate', '');
    }
    if (values.gestationalAge) {
      form.setFieldValue('gestationalAge', '');
    }
  }, [values.hpht, values.estimatedDueDate, values.gestationalAge, form]);

  React.useEffect(() => {
    if (!pendingNavigateSectionId) {
      return;
    }

    const sectionIndex = visibleMedicalSections.findIndex(
      (section) => section.id === pendingNavigateSectionId
    );

    if (sectionIndex === -1) {
      return;
    }

    const stepIndex = activeSteps.findIndex(
      (step) => step.type === 'medical' && step.sectionIndex === sectionIndex
    );

    if (stepIndex !== -1) {
      setCurrentStep(stepIndex + 1);
      setPendingNavigateSectionId(null);
    }
  }, [pendingNavigateSectionId, visibleMedicalSections, activeSteps]);

  React.useEffect(() => {
    if (!pendingNavigateCatalogKey) {
      return;
    }

    const stepIndex = activeSteps.findIndex(
      (step) => step.type === 'history-catalog' && step.historyKey === pendingNavigateCatalogKey
    );

    if (stepIndex !== -1) {
      setCurrentStep(stepIndex + 1);
      setPendingNavigateCatalogKey(null);
    }
  }, [pendingNavigateCatalogKey, activeSteps]);

  function submitMedicalAppointment(formValues: MedicalAppointmentValues) {
    const submittedValues = pickMedicalValues(repeatableMedicalSections, formValues);
    const intake = buildMedicalIntakeRecord({
      definition,
      values: submittedValues
    });
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

  const handleCancelCatalogAction = React.useCallback(() => {
    if (!catalogAction) {
      return;
    }

    const { type, groupKey, recordNumber } = catalogAction;

    if (type === 'add') {
      const group = historyGroups[groupKey];
      clearHistoryRecordRange(group, recordNumber, recordNumber);
    }

    setCatalogAction(null);
    setPendingNavigateCatalogKey(groupKey);
  }, [catalogAction, clearHistoryRecordRange]);

  function handleBack() {
    if (catalogAction) {
      handleCancelCatalogAction();
      return;
    }

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
    if (!checkCurrentStepValid(currentDescriptor, visibleMedicalSections, values, schedule)) {
      toast.error('Lengkapi bagian ini sebelum lanjut.');
      return;
    }

    if (currentDescriptor.type === 'review') {
      void form.handleSubmit();
      return;
    }

    if (currentDescriptor.type === 'medical') {
      const currentSection = visibleMedicalSections[currentDescriptor.sectionIndex];
      const historyMeta = getHistorySectionMeta(currentSection?.id);

      if (historyMeta) {
        if (catalogAction) {
          const { type, groupKey, recordNumber } = catalogAction;

          if (type === 'add') {
            if (isHistoryRecordEmpty(currentSection, values)) {
              toast.error(
                'Silakan isi data riwayat terlebih dahulu, atau klik Kembali jika batal.'
              );
              return;
            }

            const group = historyGroups[groupKey];
            if (values[group.gatewayFieldId] !== group.enabledValue) {
              form.setFieldValue(group.gatewayFieldId, group.enabledValue);
            }

            setHistoryCounts((previous) => ({
              ...previous,
              [groupKey]: Math.max(previous[groupKey], recordNumber)
            }));
          }

          setCatalogAction(null);
          setPendingNavigateCatalogKey(historyMeta.group.key);
          return;
        }

        if (
          historyMeta.recordNumber === historyCounts[historyMeta.group.key] &&
          historyCounts[historyMeta.group.key] < historyMeta.group.maxRecords
        ) {
          setHistoryPrompt({
            groupKey: historyMeta.group.key,
            currentRecord: historyMeta.recordNumber
          });
          return;
        }
      }
    }

    if (currentDescriptor.type === 'history-catalog') {
      const groupKey = currentDescriptor.historyKey;

      if (historyCounts[groupKey] === 0) {
        form.setFieldValue(
          historyGroups[groupKey].gatewayFieldId,
          historyGroups[groupKey].disabledValue
        );
      }

      setCurrentStep((step) => Math.min(totalSteps, step + 1));
      return;
    }

    setCurrentStep((step) => Math.min(totalSteps, step + 1));
  }

  function handlePromptYes() {
    if (!historyPrompt) {
      return;
    }

    const groupKey = historyPrompt.groupKey;
    const currentCount = historyCounts[groupKey];
    setHistoryPrompt(null);

    if (currentCount >= historyGroups[groupKey].maxRecords) {
      return;
    }

    const nextRecordNumber = currentCount + 1;
    setCatalogAction({
      type: 'add',
      groupKey,
      recordNumber: nextRecordNumber
    });

    const targetSectionId = historyGroups[groupKey].sectionIds[nextRecordNumber - 1];
    setPendingNavigateSectionId(targetSectionId);
  }

  function handlePromptNo() {
    if (!historyPrompt) {
      return;
    }

    const groupKey = historyPrompt.groupKey;
    setHistoryPrompt(null);

    const catalogIndex = activeSteps.findIndex(
      (step) => step.type === 'history-catalog' && step.historyKey === groupKey
    );

    if (catalogIndex !== -1) {
      setCurrentStep(catalogIndex + 1);
      return;
    }

    setCurrentStep((step) => Math.min(totalSteps, step + 1));
  }

  function handleAddHistoryFromCatalog(groupKey: RepeatableHistoryKey) {
    const currentCount = historyCounts[groupKey];
    if (currentCount >= historyGroups[groupKey].maxRecords) {
      return;
    }

    const targetRecordNumber = currentCount + 1;
    setCatalogAction({
      type: 'add',
      groupKey,
      recordNumber: targetRecordNumber
    });

    const targetSectionId = historyGroups[groupKey].sectionIds[targetRecordNumber - 1];
    setPendingNavigateSectionId(targetSectionId);
  }

  function handleEditHistoryFromCatalog(groupKey: RepeatableHistoryKey, recordNumber: number) {
    const targetSectionId = historyGroups[groupKey].sectionIds[recordNumber - 1];

    setCatalogAction({
      type: 'edit',
      groupKey,
      recordNumber
    });
    setPendingNavigateSectionId(targetSectionId);
  }

  function handleRemoveHistoryRecord(key: RepeatableHistoryKey, recordNumber: number) {
    const group = historyGroups[key];
    const currentCount = historyCounts[key];

    if (currentCount <= 1) {
      clearHistoryRecordRange(group, 1, group.maxRecords);
      setHistoryCounts((previous) => ({
        ...previous,
        [key]: 0
      }));
      setPendingNavigateCatalogKey(key);
      return;
    }

    shiftHistoryRecords(group, recordNumber);
    setHistoryCounts((previous) => ({
      ...previous,
      [key]: Math.max(0, previous[key] - 1)
    }));
    setPendingNavigateCatalogKey(key);
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

  const isStepValid = React.useMemo(
    () => checkCurrentStepValid(currentDescriptor, visibleMedicalSections, values, schedule),
    [currentDescriptor, visibleMedicalSections, values, schedule]
  );

  return {
    definition,
    form,
    values,
    visibleMedicalSections,
    repeatableMedicalSections,
    activeSteps,
    currentStep,
    totalSteps,
    currentDescriptor,
    schedule,
    doctors,
    isProcessing,
    isQueueSuccessOpen,
    createdAppointment,
    createdQueueItem,
    registeredPatient,
    historyCounts,
    historyPrompt,
    catalogAction,
    isCurrentStepValid: isStepValid,
    actions: {
      setSchedule,
      nextStep: handleNext,
      prevStep: handleBack,
      goToStep: setCurrentStep,
      promptYes: handlePromptYes,
      promptNo: handlePromptNo,
      addHistoryFromCatalog: handleAddHistoryFromCatalog,
      editHistoryFromCatalog: handleEditHistoryFromCatalog,
      removeHistoryRecord: handleRemoveHistoryRecord,
      cancelCatalogAction: handleCancelCatalogAction,
      closeQueueSuccess: () => {
        setIsQueueSuccessOpen(false);
        onClose();
      },
      getHistoryRecordActions: (sectionId?: string) =>
        getHistoryRecordActions({
          sectionId,
          historyCounts,
          onAdd: handleAddHistoryFromCatalog,
          onRemove: handleRemoveHistoryRecord
        }),
      collectAnsweredFields: (sections: MedicalFormSection[]) =>
        collectAnsweredFieldsFromSections(sections, values)
    }
  };
}

function checkCurrentStepValid(
  descriptor: StepDescriptor,
  sections: MedicalFormSection[],
  values: MedicalAppointmentValues,
  schedule: ScheduleValues
): boolean {
  if (descriptor.type === 'history-catalog') {
    return true;
  }

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

function isHistoryRecordEmpty(
  section: MedicalFormSection,
  values: MedicalAppointmentValues
): boolean {
  return section.fields.every((field) => !values[field.id]?.trim());
}

function isHistorySectionVisible(
  sectionId: string,
  historyCounts: RepeatableHistoryCounts,
  catalogAction?: CatalogActionState | null
): boolean {
  const historySection = getHistorySectionMeta(sectionId);
  if (!historySection) {
    return true;
  }

  if (
    catalogAction &&
    catalogAction.groupKey === historySection.group.key &&
    catalogAction.recordNumber === historySection.recordNumber
  ) {
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

function getHistorySectionMeta(sectionId?: string) {
  if (!sectionId) {
    return null;
  }

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
  const baseType = value.replace(/[+-]/g, '').trim();
  return ['A', 'B', 'AB', 'O'].includes(baseType) ? baseType : '';
}
