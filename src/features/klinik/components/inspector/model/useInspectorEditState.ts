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
import {
  validateMaternalForm,
  validateRegularForm,
  validateImmunizationForm
} from '../../../validations/inspector-form.schema';
import { appointmentDraftService } from '../../../services/appointment-draft.service';
import { patientAffiliationService } from '@/features/data-pasien/api/patient-affiliation-service';
import { FLOW_NAMES } from '../../../constants/medical-appointment-types';
import { calculateAgeInYears, calculateBmi } from '../../../utils/medical-appointment';
import {
  calculateEddFromLmp,
  calculateGestationalAge,
  formatIndonesianDateText
} from '../../../utils/obstetric-calculator';

interface UseInspectorEditStateParams {
  parsedData: UnifiedInspectorData;
  appointment: Appointment;
}

export function useInspectorEditState({ parsedData, appointment }: UseInspectorEditStateParams) {
  const draft = React.useMemo(() => {
    return appointment?.id ? appointmentDraftService.getInspectorDraft(appointment.id) : null;
  }, [appointment?.id]);

  const [isEditing, setIsEditing] = React.useState(() => Boolean(draft));
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
    draft?.formData && Object.keys(draft.formData).length > 0
      ? (draft.formData as EditableMaternalData)
      : buildInitialMaternalData(parsedData)
  );
  const [immunizationFormData, setImmunizationFormData] = React.useState<EditableImmunizationData>(
    () =>
      draft?.immunizationFormData && Object.keys(draft.immunizationFormData).length > 0
        ? (draft.immunizationFormData as EditableImmunizationData)
        : buildInitialImmunizationData(parsedData)
  );
  const [regularFormData, setRegularFormData] = React.useState<EditableRegularData>(() =>
    draft?.regularFormData && Object.keys(draft.regularFormData).length > 0
      ? (draft.regularFormData as EditableRegularData)
      : buildInitialRegularData(parsedData, appointment)
  );

  const initialMaternal = React.useMemo(() => buildInitialMaternalData(parsedData), [parsedData]);
  const initialImmunization = React.useMemo(() => buildInitialImmunizationData(parsedData), [parsedData]);
  const initialRegular = React.useMemo(
    () => buildInitialRegularData(parsedData, appointment),
    [parsedData, appointment]
  );

  const isDirty = React.useMemo(() => {
    const isRegularDirty = JSON.stringify(regularFormData) !== JSON.stringify(initialRegular);
    if (parsedData.flow === FLOW_NAMES.PREGNANCY) {
      return isRegularDirty || JSON.stringify(formData) !== JSON.stringify(initialMaternal);
    }
    if (parsedData.flow === FLOW_NAMES.IMMUNIZATION) {
      return isRegularDirty || JSON.stringify(immunizationFormData) !== JSON.stringify(initialImmunization);
    }
    return isRegularDirty;
  }, [
    parsedData.flow,
    formData,
    initialMaternal,
    immunizationFormData,
    initialImmunization,
    regularFormData,
    initialRegular
  ]);

  React.useEffect(() => {
    if (!isEditing) {
      setFormData(buildInitialMaternalData(parsedData));
      setImmunizationFormData(buildInitialImmunizationData(parsedData));
      setRegularFormData(buildInitialRegularData(parsedData, appointment));
    }
  }, [parsedData, appointment, isEditing]);

  React.useEffect(() => {
    if (isEditing && appointment?.id) {
      appointmentDraftService.saveInspectorDraft(appointment.id, {
        formData,
        immunizationFormData,
        regularFormData
      });
    }
  }, [isEditing, appointment?.id, formData, immunizationFormData, regularFormData]);

  const checkNikTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (checkNikTimerRef.current) {
        clearTimeout(checkNikTimerRef.current);
      }
    };
  }, []);

  const checkNikAvailabilityDebounced = React.useCallback(
    (fieldKey: string, nik: string, originalNik?: string | null) => {
      if (checkNikTimerRef.current) {
        clearTimeout(checkNikTimerRef.current);
      }

      const clean = nik.trim();
      if (clean.length !== 16 || clean === (originalNik || '').trim()) {
        setValidationErrors((prev) => {
          if (prev[fieldKey] === 'NIK ini sudah terdaftar pada pasien lain') {
            const next = { ...prev };
            delete next[fieldKey];
            return next;
          }
          return prev;
        });
        return;
      }

      checkNikTimerRef.current = setTimeout(async () => {
        try {
          const res = await patientAffiliationService.verifyNikAvailability(clean);
          if (!res.available) {
            setValidationErrors((prev) => ({
              ...prev,
              [fieldKey]: 'NIK ini sudah terdaftar pada pasien lain'
            }));
          } else {
            setValidationErrors((prev) => {
              if (prev[fieldKey] === 'NIK ini sudah terdaftar pada pasien lain') {
                const next = { ...prev };
                delete next[fieldKey];
                return next;
              }
              return prev;
            });
          }
        } catch {
        }
      }, 400);
    },
    []
  );

  const handleFieldChange = React.useCallback((field: keyof EditableMaternalData, value: any) => {
    if (field === 'motherNik') {
      checkNikAvailabilityDebounced('motherNik', String(value || ''), parsedData.patient?.nik);
    } else if (field === 'partnerNik') {
      checkNikAvailabilityDebounced(
        'partnerNik',
        String(value || ''),
        parsedData.maternal?.husbandProfile?.nik || parsedData.maternal?.partnerNik
      );
    }

    setFormData((prev) => {
      const next = {
        ...prev,
        [field]: value
      };

      if (field === 'heightCm' || field === 'prePregnancyWeightKg') {
        const height = field === 'heightCm' ? value : prev.heightCm;
        const weight = field === 'prePregnancyWeightKg' ? value : prev.prePregnancyWeightKg;
        const bmi = calculateBmi(
          weight != null && String(weight) !== '' ? String(weight) : undefined,
          height != null && String(height) !== '' ? String(height) : undefined
        );
        next.initialBmi = bmi || '';
      }

      if (field === 'motherBirthDate') {
        const age = value ? calculateAgeInYears(String(value)) : '';
        next.motherAge = age || '';
      }

      if (field === 'partnerBirthDate') {
        const age = value ? calculateAgeInYears(String(value)) : '';
        next.partnerAge = age || '';
      }

      if (field === 'hpht') {
        if (value) {
          try {
            const edd = calculateEddFromLmp(String(value));
            next.estimatedDueDate = formatIndonesianDateText(edd);
            next.gestationalAgeFormatted = calculateGestationalAge(edd, new Date()).formatted;
          } catch {
            next.estimatedDueDate = '';
            next.gestationalAgeFormatted = '';
          }
        } else {
          next.estimatedDueDate = '';
          next.gestationalAgeFormatted = '';
        }
      }

      const validation = validateMaternalForm(next);

      setValidationErrors((prevErrors) => {
        const updated = { ...prevErrors };
        const fieldKey = field as string;

        if (validation.errors[fieldKey]) {
          updated[fieldKey] = validation.errors[fieldKey];
        } else {
          delete updated[fieldKey];
        }

        const obstetricFields = [
          'gravidaCount',
          'parityCount',
          'abortionCount',
          'livingChildrenCount'
        ];
        if (obstetricFields.includes(fieldKey)) {
          obstetricFields.forEach((key) => {
            if (validation.errors[key]) {
              updated[key] = validation.errors[key];
            } else {
              delete updated[key];
            }
          });
        }

        const dateFields = ['marriageDate', 'hpht', 'motherBirthDate'];
        if (dateFields.includes(fieldKey)) {
          ['marriageDate', 'hpht'].forEach((key) => {
            if (validation.errors[key]) {
              updated[key] = validation.errors[key];
            } else {
              delete updated[key];
            }
          });
        }

        const nikFields = ['motherNik', 'partnerNik'];
        if (nikFields.includes(fieldKey)) {
          nikFields.forEach((key) => {
            if (validation.errors[key]) {
              updated[key] = validation.errors[key];
            } else {
              delete updated[key];
            }
          });
        }

        return updated;
      });

      return next;
    });
  }, []);

  const handleDiseaseChange = React.useCallback((key: string, value: any, yearOrNotes?: string) => {
    setFormData((prev) => {
      const updatedDiseaseHistory = { ...prev.diseaseHistory, [key]: value };
      if (yearOrNotes !== undefined) {
        updatedDiseaseHistory[`${key}Notes`] = yearOrNotes;
      }
      const next = {
        ...prev,
        diseaseHistory: updatedDiseaseHistory
      };

      const validation = validateMaternalForm(next);
      const conditionYearKey = `condition_${key}_year`;

      setValidationErrors((prevErrors) => {
        const updated = { ...prevErrors };
        if (validation.errors[conditionYearKey]) {
          updated[conditionYearKey] = validation.errors[conditionYearKey];
        } else {
          delete updated[conditionYearKey];
        }
        return updated;
      });

      return next;
    });
  }, []);

  const handleNestedArrayChange = React.useCallback(
    (
      key: 'previousPregnancies' | 'contraceptiveHistories',
      index: number,
      field: string,
      value: any
    ) => {
      setFormData((prev) => {
        if (key === 'previousPregnancies') {
          const list = [...prev.previousPregnancies];
          if (list[index]) {
            list[index] = { ...list[index], [field]: value };
          }
          return { ...prev, previousPregnancies: list };
        }
        const list = [...prev.contraceptiveHistories];
        if (list[index]) {
          list[index] = { ...list[index], [field]: value };
        }
        return { ...prev, contraceptiveHistories: list };
      });
    },
    []
  );

  const handleAddNestedItem = React.useCallback(
    (key: 'previousPregnancies' | 'contraceptiveHistories', defaultItem: any) => {
      setFormData((prev) =>
        key === 'previousPregnancies'
          ? { ...prev, previousPregnancies: [...prev.previousPregnancies, defaultItem] }
          : { ...prev, contraceptiveHistories: [...prev.contraceptiveHistories, defaultItem] }
      );
    },
    []
  );

  const handleRemoveNestedItem = React.useCallback(
    (key: 'previousPregnancies' | 'contraceptiveHistories', index: number) => {
      setFormData((prev) => {
        if (key === 'previousPregnancies') {
          return {
            ...prev,
            previousPregnancies: prev.previousPregnancies.filter((_, i) => i !== index)
          };
        }
        return {
          ...prev,
          contraceptiveHistories: prev.contraceptiveHistories.filter((_, i) => i !== index)
        };
      });
    },
    []
  );

  const handleImmunizationFieldChange = React.useCallback(
    (field: keyof EditableImmunizationData, value: any) => {
      if (field === 'childNik') {
        checkNikAvailabilityDebounced(
          'childNik',
          String(value || ''),
          parsedData.child?.childNik || parsedData.patient?.nik
        );
      }

      setImmunizationFormData((prev) => {
        const next = {
          ...prev,
          [field]: value
        };

        const validation = validateImmunizationForm(next);
        const fieldKey = field as string;

        setValidationErrors((prevErrors) => {
          const updated = { ...prevErrors };

          if (fieldKey === 'entries' || fieldKey === 'childBirthDate') {
            for (const k of Object.keys(updated)) {
              if (k.startsWith('entry_') || k === 'entries') {
                delete updated[k];
              }
            }
            for (const [k, v] of Object.entries(validation.errors)) {
              if (k.startsWith('entry_') || k === 'entries') {
                updated[k] = v;
              }
            }
          }

          if (fieldKey !== 'entries') {
            if (validation.errors[fieldKey]) {
              updated[fieldKey] = validation.errors[fieldKey];
            } else {
              delete updated[fieldKey];
            }
          }
          return updated;
        });

        return next;
      });
    },
    []
  );

  const handleVaccineValueChange = React.useCallback((fieldId: string, value: string) => {
    setImmunizationFormData((prev) => ({
      ...prev,
      vaccineValues: {
        ...prev.vaccineValues,
        [fieldId]: value
      }
    }));
  }, []);

  const handleRegularFieldChange = React.useCallback(
    (field: keyof EditableRegularData, value: any) => {
      if (field === 'nik') {
        checkNikAvailabilityDebounced('nik', String(value || ''), parsedData.patient?.nik);
      }

      setRegularFormData((prev) => {
        const next = {
          ...prev,
          [field]: value
        };

        const validation = validateRegularForm(next);
        setValidationErrors(validation.errors);

        return next;
      });
    },
    [checkNikAvailabilityDebounced, parsedData.patient?.nik]
  );

  const handleCancelEdit = React.useCallback(() => {
    if (appointment?.id) {
      appointmentDraftService.clearInspectorDraft(appointment.id);
    }
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
    handleCancelEdit,
    isDirty
  };
}
