'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { kiaIntakeService } from '../api/kia-intake-service';
import { klinikKeys } from '../api/query-keys';
import type { MedicalFlowDefinition } from '../constants/medical-appointment-types';

export interface MaternalCatalogs {
  educationChoices?: string[];
  religionChoices?: string[];
  bloodTypeChoices?: string[];
  tetanusChoices?: string[];
  occupationChoices?: string[];
  deliveryMethodChoices?: string[];
  childSexChoices?: string[];
}

export function useMaternalCatalogs(enabled = true) {
  const { data: refOptions, isLoading: isLoadingRef } = useQuery({
    queryKey: klinikKeys.maternalReferenceOptions(),
    queryFn: () => kiaIntakeService.getMaternalReferenceOptions(),
    enabled,
    staleTime: 300_000
  });

  const { data: occupations, isLoading: isLoadingOcc } = useQuery({
    queryKey: klinikKeys.occupations(),
    queryFn: () => kiaIntakeService.getOccupations(),
    enabled,
    staleTime: 300_000
  });

  const catalogs = React.useMemo<MaternalCatalogs>(() => {
    return {
      educationChoices: refOptions?.educationLevels?.map((item) => item.label),
      religionChoices: refOptions?.religions?.map((item) => item.label),
      bloodTypeChoices: refOptions?.bloodTypes?.map((item) => item.label),
      tetanusChoices: refOptions?.tetanusStatuses?.map((item) => item.label),
      occupationChoices: occupations?.map((item) => item.name),
      deliveryMethodChoices: refOptions?.deliveryMethods?.map((item) => item.label),
      childSexChoices: refOptions?.genders?.map((item) => item.label)
    };
  }, [refOptions, occupations]);

  return {
    catalogs,
    isLoading: isLoadingRef || isLoadingOcc
  };
}

export function enrichMedicalFlowDefinition(
  definition: MedicalFlowDefinition,
  catalogs: MaternalCatalogs
): MedicalFlowDefinition {
  if (definition.flow !== 'pregnancy') {
    return definition;
  }

  const sections = definition.sections.map((section) => {
    const fields = section.fields.map((f) => {
      if (f.id === 'motherEducation' && catalogs.educationChoices?.length) {
        return { ...f, choices: catalogs.educationChoices };
      }
      if (f.id === 'partnerEducation' && catalogs.educationChoices?.length) {
        return { ...f, choices: catalogs.educationChoices };
      }
      if (f.id === 'religion' && catalogs.religionChoices?.length) {
        return { ...f, choices: catalogs.religionChoices };
      }
      if (f.id === 'motherBloodType' && catalogs.bloodTypeChoices?.length) {
        return { ...f, choices: catalogs.bloodTypeChoices };
      }
      if (f.id === 'partnerBloodType' && catalogs.bloodTypeChoices?.length) {
        return { ...f, choices: catalogs.bloodTypeChoices };
      }
      if (f.id === 'tetanusStatus' && catalogs.tetanusChoices?.length) {
        return { ...f, choices: catalogs.tetanusChoices };
      }
      if (f.id === 'motherJob' && catalogs.occupationChoices?.length) {
        return { ...f, choices: catalogs.occupationChoices };
      }
      if (f.id === 'partnerJob' && catalogs.occupationChoices?.length) {
        return { ...f, choices: catalogs.occupationChoices };
      }
      if (f.id.endsWith('DeliveryMethod') && catalogs.deliveryMethodChoices?.length) {
        return { ...f, choices: catalogs.deliveryMethodChoices };
      }
      if (f.id.endsWith('ChildSex') && catalogs.childSexChoices?.length) {
        return { ...f, choices: catalogs.childSexChoices };
      }
      return f;
    });

    return { ...section, fields };
  });

  return { ...definition, sections };
}
