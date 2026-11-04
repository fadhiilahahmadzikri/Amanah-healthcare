'use client';

import * as React from 'react';
import { usePatientFormReferences } from '@/features/data-pasien/model/usePatientFormReferences';
import {
  BIRTH_ATTENDANT_OPTIONS,
  CONTRACEPTIVE_TYPE_OPTIONS,
  DELIVERY_METHOD_OPTIONS,
  DELIVERY_PLACE_OPTIONS
} from '@/features/maternity/constants/maternity.constants';
import { GENDER_OPTIONS } from '@/constants/gender.constants';
import type {
  MedicalChoiceOption,
  MedicalFlowDefinition,
  MedicalFormField,
  MedicalFormSection
} from '../constants/medical-appointment-types';

export interface MaternalCatalogs {
  educationChoices?: string[];
  religionChoices?: string[];
  bloodTypeChoices?: string[];
  tetanusChoices?: string[];
  occupationChoices?: string[];
  deliveryMethodChoices?: string[];
  deliveryPlaceChoices?: string[];
  childSexChoices?: MedicalChoiceOption[];
  birthAttendantChoices?: string[];
  contraceptiveTypeChoices?: string[];
}

export function useMaternalCatalogs(_enabled = true) {
  const patientRefs = usePatientFormReferences();

  const catalogs = React.useMemo<MaternalCatalogs>(() => {
    return {
      educationChoices: patientRefs.educationLevels.map((item) => item.label),
      religionChoices: patientRefs.religions.map((item) => item.label),
      bloodTypeChoices: patientRefs.bloodTypes.map((item) => item.label),
      occupationChoices: patientRefs.occupations.map((item) => item.name),
      tetanusChoices: [
        'T0 (Belum pernah TT)',
        'T1 (Langkah 1)',
        'T2 (Langkah 2)',
        'T3 (Langkah 3)',
        'T4 (Langkah 4)',
        'T5 (Lengkap)'
      ],
      deliveryMethodChoices: [...DELIVERY_METHOD_OPTIONS],
      deliveryPlaceChoices: [...DELIVERY_PLACE_OPTIONS],
      childSexChoices:
        patientRefs.genders.length > 0 ? patientRefs.genders : GENDER_OPTIONS,
      birthAttendantChoices: [...BIRTH_ATTENDANT_OPTIONS],
      contraceptiveTypeChoices: [...CONTRACEPTIVE_TYPE_OPTIONS]
    };
  }, [
    patientRefs.educationLevels,
    patientRefs.religions,
    patientRefs.bloodTypes,
    patientRefs.occupations,
    patientRefs.genders
  ]);

  return {
    catalogs,
    isLoading: patientRefs.isLoading
  };
}

export function enrichMedicalFlowDefinition(
  definition: MedicalFlowDefinition,
  catalogs: MaternalCatalogs
): MedicalFlowDefinition {
  if (definition.flow !== 'pregnancy') {
    return definition;
  }

  const sections = (definition.sections || [])
    .filter((section): section is MedicalFormSection => Boolean(section && Array.isArray(section.fields)))
    .map((section) => {
      const fields = section.fields.map((f: MedicalFormField) => {
        if (f.id === 'motherEducation' && catalogs.educationChoices && catalogs.educationChoices.length > 0) {
          return { ...f, choices: catalogs.educationChoices };
        }
        if (f.id === 'partnerEducation' && catalogs.educationChoices && catalogs.educationChoices.length > 0) {
          return { ...f, choices: catalogs.educationChoices };
        }
        if (f.id === 'religion' && catalogs.religionChoices && catalogs.religionChoices.length > 0) {
          return { ...f, choices: catalogs.religionChoices };
        }
        if (f.id === 'motherBloodType' && catalogs.bloodTypeChoices && catalogs.bloodTypeChoices.length > 0) {
          return { ...f, choices: catalogs.bloodTypeChoices };
        }
        if (f.id === 'partnerBloodType' && catalogs.bloodTypeChoices && catalogs.bloodTypeChoices.length > 0) {
          return { ...f, choices: catalogs.bloodTypeChoices };
        }
        if (f.id === 'tetanusStatus' && catalogs.tetanusChoices && catalogs.tetanusChoices.length > 0) {
          return { ...f, choices: catalogs.tetanusChoices };
        }
        if (f.id === 'motherJob' && catalogs.occupationChoices && catalogs.occupationChoices.length > 0) {
          return { ...f, choices: catalogs.occupationChoices };
        }
        if (f.id === 'partnerJob' && catalogs.occupationChoices && catalogs.occupationChoices.length > 0) {
          return { ...f, choices: catalogs.occupationChoices };
        }
        if (f.id.endsWith('DeliveryMethod') && catalogs.deliveryMethodChoices && catalogs.deliveryMethodChoices.length > 0) {
          return { ...f, choices: catalogs.deliveryMethodChoices };
        }
        if (f.id.endsWith('DeliveryPlace') && catalogs.deliveryPlaceChoices && catalogs.deliveryPlaceChoices.length > 0) {
          return { ...f, choices: catalogs.deliveryPlaceChoices };
        }
        if (f.id.endsWith('ChildSex') && catalogs.childSexChoices && catalogs.childSexChoices.length > 0) {
          return { ...f, choices: catalogs.childSexChoices };
        }
        if (f.id.endsWith('BirthAttendant') && catalogs.birthAttendantChoices && catalogs.birthAttendantChoices.length > 0) {
          return { ...f, choices: catalogs.birthAttendantChoices };
        }
        if (f.id.endsWith('Type') && catalogs.contraceptiveTypeChoices && catalogs.contraceptiveTypeChoices.length > 0) {
          return { ...f, choices: catalogs.contraceptiveTypeChoices };
        }
        return f;
      });

      return { ...section, fields };
    });

  return { ...definition, sections };
}
