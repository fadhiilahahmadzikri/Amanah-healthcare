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
  type MedicalFlowDefinition,
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

export type ScheduleValues = {
  doctor: string;
  dateStr: string;
  timeSlot: string;
};

export type StepDescriptor =
  | {
      type: 'medical';
      sectionIndex: number;
    }
  | {
      type: 'doctor' | 'date' | 'time' | 'review';
    };

export type RepeatableHistoryKey = 'previousPregnancy' | 'contraception';
export type RepeatableHistoryCounts = Record<RepeatableHistoryKey, number>;

export interface RepeatableHistoryGroup {
  key: RepeatableHistoryKey;
  sectionIds: string[];
  gatewayFieldId: string;
  disabledValue: string;
  maxRecords: number;
}

export interface HistoryRecordActions {
  currentRecord: number;
  totalRecords: number;
  maxRecords: number;
  onAdd: () => void;
  onRemove: () => void;
}

export const scheduleStepDescriptors: StepDescriptor[] = [
  { type: 'doctor' },
  { type: 'date' },
  { type: 'time' },
  { type: 'review' }
];

export const historyGroups: Record<RepeatableHistoryKey, RepeatableHistoryGroup> = {
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

export const defaultHistoryCounts: RepeatableHistoryCounts = {
  previousPregnancy: 1,
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
    if (!checkCurrentStepValid(currentDescriptor, visibleMedicalSections, values, schedule)) {
      toast.error('Lengkapi bagian ini sebelum lanjut.');
      return;
    }

    if (currentDescriptor.type === 'review') {
      void form.handleSubmit();
      return;
    }

    setCurrentStep((step) => Math.min(totalSteps, step + 1));
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
    isCurrentStepValid: isStepValid,
    actions: {
      setSchedule,
      nextStep: handleNext,
      prevStep: handleBack,
      goToStep: setCurrentStep,
      addHistoryRecord: handleAddHistoryRecord,
      removeHistoryRecord: handleRemoveHistoryRecord,
      closeQueueSuccess: () => {
        setIsQueueSuccessOpen(false);
        onClose();
      },
      getHistoryRecordActions: (sectionId?: string) =>
        getHistoryRecordActions({
          sectionId,
          historyCounts,
          onAdd: handleAddHistoryRecord,
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
  const baseType = value.replace(/[+-]/g, '').trim();
  return ['A', 'B', 'AB', 'O'].includes(baseType) ? baseType : '';
}
