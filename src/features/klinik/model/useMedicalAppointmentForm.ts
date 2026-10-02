'use client';

import * as React from 'react';
import { useStore } from '@tanstack/react-form';
import { useAppForm } from '@/components/ui/tanstack-form';
import { toast } from 'sonner';
import type { AppointmentFormData, Doctor, MedicalAppointmentFlow } from '../api/types';
import { getDoctorsByService } from '../api/service';
import {
  getMedicalFlowDefinition,
  type MedicalFormSection
} from '../constants/medical-appointment-schemas';
import { enrichMedicalFlowDefinition, useMaternalCatalogs } from './useMaternalCatalogs';
import {
  buildDefaultMedicalValues,
  getActiveMedicalSections,
  type MedicalAppointmentValues
} from '../utils/medical-appointment';
import {
  type CatalogActionState,
  type HistoryPromptState,
  type HistoryRecordActions,
  type RepeatableHistoryCounts,
  type RepeatableHistoryGroup,
  type RepeatableHistoryKey,
  type ScheduleValues,
  type StepDescriptor,
  defaultHistoryCounts,
  historyGroups,
  scheduleStepDescriptors
} from './medical-form-history-types';
import {
  buildMedicalActiveSteps,
  buildRegistrationPrefill,
  checkCurrentStepValid,
  collectAnsweredFieldsFromSections,
  getHistorySectionMeta,
  isHistoryRecordEmpty,
  isHistorySectionVisible
} from '../utils/medical-form-helpers';
import { CATALOG_ACTION_TYPES, STEP_DESCRIPTOR_TYPES } from '../constants/kia-constants';
import { useMedicalFormHistory } from './useMedicalFormHistory';
import { useMedicalFormCalculations } from './useMedicalFormCalculations';
import { useRegisteredPatient } from './useRegisteredPatient';
import { useMedicalAppointmentSubmit } from './useMedicalAppointmentSubmit';

export type {
  CatalogActionState,
  HistoryPromptState,
  HistoryRecordActions,
  RepeatableHistoryCounts,
  RepeatableHistoryGroup,
  RepeatableHistoryKey,
  ScheduleValues,
  StepDescriptor
};
export { defaultHistoryCounts, historyGroups, scheduleStepDescriptors };

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
  const baseDefinition = React.useMemo(() => getMedicalFlowDefinition(flow), [flow]);
  const { catalogs } = useMaternalCatalogs(isOpen && flow === 'pregnancy');
  const definition = React.useMemo(
    () => enrichMedicalFlowDefinition(baseDefinition, catalogs),
    [baseDefinition, catalogs]
  );
  const defaultValues = React.useMemo(
    () => buildDefaultMedicalValues(baseDefinition),
    [baseDefinition]
  );
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

  const registeredPatient = useRegisteredPatient(isOpen);

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      submit.submitMedicalAppointment(value as MedicalAppointmentValues);
    }
  });

  const values = useStore(form.store, (state) => state.values) as MedicalAppointmentValues;

  useMedicalFormCalculations({
    values,
    setFieldValue: form.setFieldValue
  });

  const history = useMedicalFormHistory({
    sections: definition.sections,
    values,
    setFieldValue: form.setFieldValue,
    flow,
    isOpen
  });

  const activeMedicalSections = React.useMemo(
    () => getActiveMedicalSections(definition, values),
    [definition, values]
  );

  const repeatableMedicalSections = React.useMemo(
    () =>
      activeMedicalSections.filter((section) =>
        isHistorySectionVisible(section.id, history.historyCounts, history.catalogAction)
      ),
    [activeMedicalSections, history.historyCounts, history.catalogAction]
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
    () =>
      buildMedicalActiveSteps({
        visibleMedicalSections,
        hasPreviousPregnancyHistory: values.hasPreviousPregnancyHistory,
        hasContraceptionHistory: values.hasContraceptionHistory,
        historyCounts: history.historyCounts,
        catalogAction: history.catalogAction
      }),
    [
      visibleMedicalSections,
      values.hasPreviousPregnancyHistory,
      values.hasContraceptionHistory,
      history.historyCounts,
      history.catalogAction
    ]
  );

  const totalSteps = activeSteps.length;
  const currentDescriptor = activeSteps[currentStep - 1] || activeSteps[0];

  const submit = useMedicalAppointmentSubmit({
    definition,
    schedule,
    registeredPatient,
    repeatableMedicalSections,
    onCreated
  });

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
    Object.entries(registrationPrefill).forEach(([fieldId, value]) => {
      if (value.trim()) {
        form.setFieldValue(fieldId, value);
      }
    });
  }, [form, registrationPrefill]);

  React.useEffect(() => {
    const contraceptionGroup = historyGroups.contraception;

    if (values.hasContraceptionHistory === contraceptionGroup.disabledValue) {
      history.clearHistoryRecordRange(contraceptionGroup, 1, contraceptionGroup.maxRecords);
      history.setHistoryCounts((previous) => ({
        ...previous,
        contraception: 1
      }));
    }
  }, [history, values.hasContraceptionHistory]);

  React.useEffect(() => {
    const pregnancyGroup = historyGroups.pregnancy;

    if (values.hasPreviousPregnancyHistory === pregnancyGroup.disabledValue) {
      history.clearHistoryRecordRange(pregnancyGroup, 1, pregnancyGroup.maxRecords);
      history.setHistoryCounts((previous) => ({
        ...previous,
        pregnancy: 1
      }));
    }
  }, [history, values.hasPreviousPregnancyHistory]);

  React.useEffect(() => {
    if (!history.pendingNavigateSectionId) {
      return;
    }

    const sectionIndex = visibleMedicalSections.findIndex(
      (section) => section.id === history.pendingNavigateSectionId
    );

    if (sectionIndex === -1) {
      return;
    }

    const stepIndex = activeSteps.findIndex(
      (step) => step.type === STEP_DESCRIPTOR_TYPES.MEDICAL && step.sectionIndex === sectionIndex
    );

    if (stepIndex !== -1) {
      setCurrentStep(stepIndex + 1);
      history.setPendingNavigateSectionId(null);
    }
  }, [history, visibleMedicalSections, activeSteps]);

  React.useEffect(() => {
    if (!history.pendingNavigateCatalogKey) {
      return;
    }

    const stepIndex = activeSteps.findIndex(
      (step) =>
        step.type === STEP_DESCRIPTOR_TYPES.HISTORY_CATALOG &&
        step.historyKey === history.pendingNavigateCatalogKey
    );

    if (stepIndex !== -1) {
      setCurrentStep(stepIndex + 1);
      history.setPendingNavigateCatalogKey(null);
    }
  }, [history, activeSteps]);

  function handleBack() {
    if (history.catalogAction) {
      history.handleCancelCatalogAction();
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

    if (currentDescriptor.type === STEP_DESCRIPTOR_TYPES.REVIEW) {
      void form.handleSubmit();
      return;
    }

    if (currentDescriptor.type === STEP_DESCRIPTOR_TYPES.MEDICAL) {
      const currentSection = visibleMedicalSections[currentDescriptor.sectionIndex];
      const historyMeta = getHistorySectionMeta(currentSection?.id);

      if (historyMeta) {
        if (history.catalogAction) {
          const { type, groupKey, recordNumber } = history.catalogAction;

          if (type === CATALOG_ACTION_TYPES.ADD) {
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

            history.setHistoryCounts((previous) => ({
              ...previous,
              [groupKey]: Math.max(previous[groupKey], recordNumber)
            }));
          }

          history.setCatalogAction(null);
          history.setPendingNavigateCatalogKey(historyMeta.group.key);
          return;
        }

        if (
          historyMeta.recordNumber === history.historyCounts[historyMeta.group.key] &&
          history.historyCounts[historyMeta.group.key] < historyMeta.group.maxRecords
        ) {
          history.setHistoryPrompt({
            groupKey: historyMeta.group.key,
            currentRecord: historyMeta.recordNumber
          });
          return;
        }
      }
    }

    if (currentDescriptor.type === STEP_DESCRIPTOR_TYPES.HISTORY_CATALOG) {
      const groupKey = currentDescriptor.historyKey;

      if (history.historyCounts[groupKey] === 0) {
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

  function handlePromptNo() {
    if (!history.historyPrompt) {
      return;
    }

    const groupKey = history.historyPrompt.groupKey;
    history.setHistoryPrompt(null);

    const catalogIndex = activeSteps.findIndex(
      (step) => step.type === STEP_DESCRIPTOR_TYPES.HISTORY_CATALOG && step.historyKey === groupKey
    );

    if (catalogIndex !== -1) {
      setCurrentStep(catalogIndex + 1);
      return;
    }

    setCurrentStep((step) => Math.min(totalSteps, step + 1));
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
    isProcessing: submit.isProcessing,
    isQueueSuccessOpen: submit.isQueueSuccessOpen,
    createdAppointment: submit.createdAppointment,
    createdQueueItem: submit.createdQueueItem,
    registeredPatient,
    historyCounts: history.historyCounts,
    historyPrompt: history.historyPrompt,
    catalogAction: history.catalogAction,
    isCurrentStepValid: isStepValid,
    actions: {
      setSchedule,
      nextStep: handleNext,
      prevStep: handleBack,
      goToStep: setCurrentStep,
      promptYes: history.handlePromptYes,
      promptNo: handlePromptNo,
      addHistoryFromCatalog: history.handleAddHistoryFromCatalog,
      editHistoryFromCatalog: history.handleEditHistoryFromCatalog,
      removeHistoryRecord: history.handleRemoveHistoryRecord,
      cancelCatalogAction: history.handleCancelCatalogAction,
      closeQueueSuccess: () => {
        submit.setIsQueueSuccessOpen(false);
        onClose();
      },
      getHistoryRecordActions: history.getHistoryRecordActions,
      collectAnsweredFields: (sections: MedicalFormSection[]) =>
        collectAnsweredFieldsFromSections(sections, values)
    }
  };
}
