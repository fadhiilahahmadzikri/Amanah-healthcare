import * as React from 'react';
import type { Appointment } from '../../../api/types';
import type { ChildImmunizationResponse } from '../../../api/kia-intake-service';
import type {
  UnifiedInspectorData,
  EditableMaternalData,
  EditableImmunizationData,
  EditableRegularData
} from '../types';
import type { MaternityIntake, MaternalHusbandProfile } from '@/features/maternity';
import type { PatientRegionValues } from '@/features/data-pasien/components/registration/molecules/patient-region-dropdown';
import { calculateAgeInYears, calculateBmi } from '../../../utils/medical-appointment';
import {
  calculateEddFromLmp,
  calculateGestationalAge,
  formatIndonesianDateText
} from '../../../utils/obstetric-calculator';

interface UseActiveInspectorStateParams {
  isPregnancy: boolean;
  isImmunization: boolean;
  isEditing: boolean;
  parsedData: UnifiedInspectorData;
  appointment: Appointment;
  formData: EditableMaternalData;
  immunizationFormData: EditableImmunizationData;
  regularFormData: EditableRegularData;
  handleFieldChange: (field: keyof EditableMaternalData, value: any) => void;
  handleDiseaseChange: (
    code: string,
    hasCondition: boolean,
    diagnosisYear?: string,
    notes?: string
  ) => void;
  validationErrors: Record<string, string>;
  handleClearError: (field: string) => void;
}

export function useActiveInspectorState({
  isPregnancy,
  isImmunization,
  isEditing,
  parsedData,
  formData,
  immunizationFormData,
  regularFormData,
  handleFieldChange,
  handleDiseaseChange,
  validationErrors,
  handleClearError
}: UseActiveInspectorStateParams) {
  const activeMaternityIntake = React.useMemo<MaternityIntake | null>(() => {
    if (!isPregnancy) return null;
    if (!isEditing && !parsedData.maternal) return null;

    const resolvedMotherBirthDate =
      (isEditing ? formData.motherBirthDate : null) ||
      parsedData.maternal?.motherBirthDate ||
      parsedData.patient?.birthDate ||
      null;

    if (!isEditing) {
      if (!parsedData.maternal) return null;

      const computedBmi = calculateBmi(
        parsedData.maternal.prePregnancyWeightKg != null ? String(parsedData.maternal.prePregnancyWeightKg) : undefined,
        parsedData.maternal.heightCm != null ? String(parsedData.maternal.heightCm) : undefined
      );

      const computedMotherAge = resolvedMotherBirthDate ? calculateAgeInYears(resolvedMotherBirthDate) : null;
      const partnerBirthDate =
        parsedData.maternal.partnerBirthDate || parsedData.maternal.husbandProfile?.birthDate || null;
      const computedPartnerAge = partnerBirthDate ? calculateAgeInYears(partnerBirthDate) : null;

      let estimatedDueDate = parsedData.maternal.estimatedDueDate || null;
      let gestationalAgeFormatted = parsedData.maternal.gestationalAgeFormatted || null;
      if (parsedData.maternal.hpht) {
        try {
          const edd = calculateEddFromLmp(parsedData.maternal.hpht);
          if (!estimatedDueDate) estimatedDueDate = formatIndonesianDateText(edd);
          if (!gestationalAgeFormatted)
            gestationalAgeFormatted = calculateGestationalAge(edd, new Date()).formatted;
        } catch {
          // ignore
        }
      }

      return {
        ...parsedData.maternal,
        motherBirthDate: resolvedMotherBirthDate,
        motherAge: parsedData.maternal.motherAge || computedMotherAge || null,
        motherName: parsedData.maternal.motherName || parsedData.patient?.fullName || '',
        motherNik: parsedData.maternal.motherNik || parsedData.patient?.nik || '',
        initialBmi: parsedData.maternal.initialBmi || computedBmi || null,
        estimatedDueDate,
        gestationalAgeFormatted,
        line1: parsedData.maternal.line1 || parsedData.patient?.line1 || null,
        provinceName: parsedData.maternal.provinceName || parsedData.patient?.provinceName || null,
        provinceCode: parsedData.maternal.provinceCode || parsedData.patient?.provinceCode || null,
        regencyName: parsedData.maternal.regencyName || parsedData.patient?.regencyName || null,
        regencyCode: parsedData.maternal.regencyCode || parsedData.patient?.regencyCode || null,
        districtName: parsedData.maternal.districtName || parsedData.patient?.districtName || null,
        districtCode: parsedData.maternal.districtCode || parsedData.patient?.districtCode || null,
        villageName: parsedData.maternal.villageName || parsedData.patient?.villageName || null,
        villageCode: parsedData.maternal.villageCode || parsedData.patient?.villageCode || null,
        husbandProfile: parsedData.maternal.husbandProfile
          ? {
              ...parsedData.maternal.husbandProfile,
              fullName: parsedData.maternal.husbandProfile.fullName || parsedData.maternal.partnerName || '',
              age: parsedData.maternal.husbandProfile.age || computedPartnerAge || null
            }
          : null
      };
    }

    const currentPartnerPhone =
      formData.partnerPhone ?? parsedData.maternal?.husbandProfile?.phoneNumber ?? '';

    return {
      ...(parsedData.maternal || {}),
      ...formData,
      motherBirthDate: resolvedMotherBirthDate,
      husbandProfile: {
        ...(parsedData.maternal?.husbandProfile || {}),
        fullName: formData.partnerName || '',
        nik: formData.partnerNik || null,
        birthDate: formData.partnerBirthDate || null,
        age: formData.partnerAge || null,
        job: formData.partnerJob || null,
        education: formData.partnerEducation || null,
        bloodType: formData.partnerBloodType || null,
        phoneNumber: currentPartnerPhone || null
      }
    } as MaternityIntake;
  }, [isPregnancy, isEditing, parsedData.maternal, parsedData.patient, formData]);

  const activeChildIntake = React.useMemo(() => {
    if (!isImmunization) return null;
    if (!isEditing && !parsedData.child) return null;

    const resolvedChildBirthDate =
      (isEditing ? immunizationFormData.childBirthDate : null) ||
      parsedData.child?.childBirthDate ||
      parsedData.patient?.birthDate ||
      '';

    if (!isEditing) {
      if (!parsedData.child) return null;
      return {
        ...parsedData.child,
        childBirthDate: resolvedChildBirthDate
      };
    }
    return {
      ...(parsedData.child || {}),
      ...immunizationFormData,
      childBirthDate: resolvedChildBirthDate
    };
  }, [isImmunization, isEditing, parsedData.child, parsedData.patient, immunizationFormData]);

  const activeUnifiedData = React.useMemo<UnifiedInspectorData>(() => {
    const activePatient = parsedData.patient
      ? {
          ...parsedData.patient,
          fullName: isPregnancy
            ? formData.motherName || parsedData.patient.fullName
            : isImmunization
              ? immunizationFormData.childName || parsedData.patient.fullName
              : regularFormData.fullName || parsedData.patient.fullName,
          nik: isPregnancy
            ? formData.motherNik || parsedData.patient.nik
            : isImmunization
              ? immunizationFormData.childNik || parsedData.patient.nik
              : regularFormData.nik || parsedData.patient.nik,
          phone: isPregnancy
            ? formData.phoneNumber || parsedData.patient.phone
            : isImmunization
              ? immunizationFormData.parentPhone || parsedData.patient.phone
              : regularFormData.phone || parsedData.patient.phone,
          address: isPregnancy
            ? formData.domicileAddress || parsedData.patient.address
            : isImmunization
              ? immunizationFormData.childAddress || parsedData.patient.address
              : regularFormData.line1 || regularFormData.address || parsedData.patient.address,
          line1: isPregnancy
            ? formData.line1 || parsedData.patient.line1
            : isImmunization
              ? immunizationFormData.line1 || parsedData.patient.line1
              : regularFormData.line1 || parsedData.patient.line1,
          villageName: isPregnancy
            ? formData.villageName || parsedData.patient.villageName
            : isImmunization
              ? immunizationFormData.villageName || parsedData.patient.villageName
              : regularFormData.villageName || parsedData.patient.villageName,
          districtName: isPregnancy
            ? formData.districtName || parsedData.patient.districtName
            : isImmunization
              ? immunizationFormData.districtName || parsedData.patient.districtName
              : regularFormData.districtName || parsedData.patient.districtName,
          regencyName: isPregnancy
            ? formData.regencyName || parsedData.patient.regencyName
            : isImmunization
              ? immunizationFormData.regencyName || parsedData.patient.regencyName
              : regularFormData.regencyName || parsedData.patient.regencyName,
          provinceName: isPregnancy
            ? formData.provinceName || parsedData.patient.provinceName
            : isImmunization
              ? immunizationFormData.provinceName || parsedData.patient.provinceName
              : regularFormData.provinceName || parsedData.patient.provinceName,
          ...(isPregnancy || isImmunization
            ? {}
            : {
                medicalRecordNumber:
                  regularFormData.medicalRecordNumber || parsedData.patient.medicalRecordNumber,
                motherName: regularFormData.motherName || parsedData.patient.motherName,
                birthPlace: regularFormData.birthPlace || parsedData.patient.birthPlace,
                birthDate: regularFormData.birthDate || parsedData.patient.birthDate,
                gender: regularFormData.gender || parsedData.patient.gender,
                bloodType: regularFormData.bloodType || parsedData.patient.bloodType,
                occupation: regularFormData.occupation || parsedData.patient.occupation,
                email: regularFormData.email || parsedData.patient.email,
                emergencyContactName:
                  regularFormData.emergencyContactName || parsedData.patient.emergencyContactName,
                emergencyContactPhone:
                  regularFormData.emergencyContactPhone || parsedData.patient.emergencyContactPhone,
                emergencyContactRelationship:
                  regularFormData.emergencyContactRelationship ||
                  parsedData.patient.emergencyContactRelationship
              })
        }
      : undefined;

    return {
      ...parsedData,
      patient: activePatient,
      complaint: isPregnancy
        ? formData.currentComplaints || parsedData.complaint
        : regularFormData.complaint || parsedData.complaint,
      maternal: activeMaternityIntake || undefined,
      child: (activeChildIntake || undefined) as ChildImmunizationResponse | undefined
    };
  }, [
    parsedData,
    activeMaternityIntake,
    activeChildIntake,
    regularFormData,
    isPregnancy,
    isImmunization,
    formData.motherName,
    formData.motherNik,
    formData.phoneNumber,
    formData.domicileAddress,
    formData.line1,
    formData.villageName,
    formData.districtName,
    formData.regencyName,
    formData.provinceName,
    formData.currentComplaints,
    immunizationFormData.childName,
    immunizationFormData.childNik,
    immunizationFormData.parentPhone,
    immunizationFormData.childAddress,
    immunizationFormData.line1,
    immunizationFormData.villageName,
    immunizationFormData.districtName,
    immunizationFormData.regencyName,
    immunizationFormData.provinceName
  ]);

  const handleMaternityFieldChange = React.useCallback(
    (field: keyof MaternityIntake, val: any) => {
      if (field === 'previousPregnancies') {
        handleFieldChange('previousPregnancies', val);
      } else if (field === 'contraceptiveHistories') {
        handleFieldChange('contraceptiveHistories', val);
      } else if (field === 'conditionResponses') {
        handleFieldChange('conditionResponses', val);
        val.forEach((cond: any) => {
          handleDiseaseChange(
            cond.conditionCode,
            cond.hasCondition,
            cond.diagnosisYear ? String(cond.diagnosisYear) : undefined
          );
        });
      } else {
        handleFieldChange(field as keyof EditableMaternalData, val);
      }
    },
    [handleFieldChange, handleDiseaseChange]
  );

  const handleHusbandFieldChange = React.useCallback(
    (field: keyof MaternalHusbandProfile, val: any) => {
      if (field === 'fullName') handleFieldChange('partnerName', val);
      else if (field === 'nik') handleFieldChange('partnerNik', val);
      else if (field === 'birthDate') handleFieldChange('partnerBirthDate', val);
      else if (field === 'job') handleFieldChange('partnerJob', val);
      else if (field === 'education') handleFieldChange('partnerEducation', val);
      else if (field === 'bloodType') handleFieldChange('partnerBloodType', val);
      else if (field === 'phoneNumber') handleFieldChange('partnerPhone', val);
    },
    [handleFieldChange]
  );

  const maternalRegionValues: PatientRegionValues = React.useMemo(
    () => ({
      provinceName: formData.provinceName || parsedData.patient?.provinceName || '',
      provinceCode: formData.provinceCode || parsedData.patient?.provinceCode || '',
      regencyName: formData.regencyName || parsedData.patient?.regencyName || '',
      regencyCode: formData.regencyCode || parsedData.patient?.regencyCode || '',
      districtName: formData.districtName || parsedData.patient?.districtName || '',
      districtCode: formData.districtCode || parsedData.patient?.districtCode || '',
      villageName: formData.villageName || parsedData.patient?.villageName || '',
      villageCode: formData.villageCode || parsedData.patient?.villageCode || '',
      line1: formData.line1 || parsedData.patient?.line1 || formData.domicileAddress || ''
    }),
    [formData, parsedData.patient]
  );

  const handleMaternalRegionChange = React.useCallback(
    (updates: Partial<PatientRegionValues>) => {
      Object.entries(updates).forEach(([key, val]) => {
        handleFieldChange(key as keyof EditableMaternalData, val);
      });
      const merged = { ...maternalRegionValues, ...updates };
      const parts = [
        merged.line1,
        merged.villageName ? `Kel. ${merged.villageName}` : '',
        merged.districtName ? `Kec. ${merged.districtName}` : '',
        merged.regencyName,
        merged.provinceName ? `Prov. ${merged.provinceName}` : ''
      ].filter(Boolean);
      handleFieldChange('domicileAddress', parts.join(', '));
      if (validationErrors.domicileAddress) {
        handleClearError('domicileAddress');
      }
    },
    [handleFieldChange, maternalRegionValues, validationErrors.domicileAddress, handleClearError]
  );

  return {
    activeMaternityIntake,
    activeChildIntake,
    activeUnifiedData,
    maternalRegionValues,
    handleMaternalRegionChange,
    handleMaternityFieldChange,
    handleHusbandFieldChange
  };
}
