import * as React from 'react';
import type { Appointment } from '../../../api/types';
import type {
  UnifiedInspectorData,
  EditableMaternalData,
  EditableImmunizationData,
  EditableRegularData
} from '../types';
import {
  buildInitialMaternalData,
  buildInitialImmunizationData,
  buildInitialRegularData
} from './inspector-initial-state';

interface UseInspectorEditStateParams {
  parsedData: UnifiedInspectorData;
  appointment: Appointment;
}

export function useInspectorEditState({
  parsedData,
  appointment
}: UseInspectorEditStateParams) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

  const handleClearError = React.useCallback((field: string) => {
    setValidationErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const [formData, setFormData] = React.useState<EditableMaternalData>(() =>
    buildInitialMaternalData(parsedData)
  );
  const [immunizationFormData, setImmunizationFormData] = React.useState<EditableImmunizationData>(
    () => buildInitialImmunizationData(parsedData)
  );
  const [regularFormData, setRegularFormData] = React.useState<EditableRegularData>(() =>
    buildInitialRegularData(parsedData, appointment)
  );

  React.useEffect(() => {
    if (!isEditing) {
      setFormData(buildInitialMaternalData(parsedData));
      setImmunizationFormData(buildInitialImmunizationData(parsedData));
      setRegularFormData(buildInitialRegularData(parsedData, appointment));
    }
  }, [parsedData, appointment, isEditing]);

  const handleFieldChange = React.useCallback(
    (field: keyof EditableMaternalData, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value
      }));
    },
    []
  );

  const handleDiseaseChange = React.useCallback(
    (key: string, value: any, yearOrNotes?: string) => {
      setFormData((prev) => {
        const updatedDiseaseHistory = { ...prev.diseaseHistory, [key]: value };
        if (yearOrNotes !== undefined) {
          updatedDiseaseHistory[`${key}Notes`] = yearOrNotes;
        }
        return {
          ...prev,
          diseaseHistory: updatedDiseaseHistory
        };
      });
    },
    []
  );

  const handleNestedArrayChange = React.useCallback(
    (
      key: 'previousPregnancies' | 'contraceptiveHistories',
      index: number,
      field: string,
      value: any
    ) => {
      setFormData((prev) => {
        const currentList = [...(prev[key] as any[])];
        if (currentList[index]) {
          currentList[index] = {
            ...currentList[index],
            [field]: value
          };
        }
        return {
          ...prev,
          [key]: currentList
        };
      });
    },
    []
  );

  const handleAddNestedItem = React.useCallback(
    (
      key: 'previousPregnancies' | 'contraceptiveHistories',
      defaultItem: any
    ) => {
      setFormData((prev) => ({
        ...prev,
        [key]: [...(prev[key] as any[]), defaultItem]
      }));
    },
    []
  );

  const handleRemoveNestedItem = React.useCallback(
    (
      key: 'previousPregnancies' | 'contraceptiveHistories',
      index: number
    ) => {
      setFormData((prev) => {
        const currentList = [...(prev[key] as any[])];
        currentList.splice(index, 1);
        return {
          ...prev,
          [key]: currentList
        };
      });
    },
    []
  );

  const handleImmunizationFieldChange = React.useCallback(
    (field: keyof EditableImmunizationData, value: any) => {
      setImmunizationFormData((prev) => ({
        ...prev,
        [field]: value
      }));
    },
    []
  );

  const handleVaccineValueChange = React.useCallback(
    (fieldId: string, value: string) => {
      setImmunizationFormData((prev) => ({
        ...prev,
        vaccineValues: {
          ...prev.vaccineValues,
          [fieldId]: value
        }
      }));
    },
    []
  );

  const handleRegularFieldChange = React.useCallback(
    (field: keyof EditableRegularData, value: any) => {
      setRegularFormData((prev) => ({
        ...prev,
        [field]: value
      }));
    },
    []
  );

  const handleCancelEdit = React.useCallback(() => {
    setFormData(buildInitialMaternalData(parsedData));
    setImmunizationFormData(buildInitialImmunizationData(parsedData));
    setRegularFormData(buildInitialRegularData(parsedData, appointment));
    setValidationErrors({});
    setIsEditing(false);
  }, [parsedData, appointment]);

  return {
    isEditing,
    setIsEditing,
    validationErrors,
    setValidationErrors,
    handleClearError,
    formData,
    immunizationFormData,
    regularFormData,
    handleFieldChange,
    handleDiseaseChange,
    handleNestedArrayChange,
    handleAddNestedItem,
    handleRemoveNestedItem,
    handleImmunizationFieldChange,
    handleVaccineValueChange,
    handleRegularFieldChange,
    handleCancelEdit
  };
}
