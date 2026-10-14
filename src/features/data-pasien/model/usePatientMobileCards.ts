'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Patient } from '../api/types';
import { formatClinicDate } from '@/lib/date-format';
import {
  getRelationshipLabel,
  getRelationshipStatusKey,
  getGenderLabel
} from '../components/patient-tables/columns-helpers';

export interface DemographicSlotItem {
  id: string;
  label: string;
  isMono?: boolean;
  isHighlighted?: boolean;
}

export interface UsePatientMobileCardsResult {
  // Action Drawer state
  selectedActionPatient: Patient | null;
  openActionDrawer: (patient: Patient) => void;
  closeActionDrawer: () => void;

  // Reusable formatters (SSOT & Agnostic)
  getCleanRelationLabel: (type?: string | null, customLabel?: string | null) => string;
  getRelationStatusKey: (type?: string | null) => string;
  getDemographicSlots: (patient: Patient) => DemographicSlotItem[];
  formatVisitDate: (date?: string | null) => string;
}

/**
 * Custom hook dedicated to mobile card interactions and actions.
 * Follows SSOT and Agnostic presentation guidelines.
 */
export function usePatientMobileCards(): UsePatientMobileCardsResult {
  const [selectedActionPatient, setSelectedActionPatient] = useState<Patient | null>(null);

  const openActionDrawer = useCallback((patient: Patient) => {
    setSelectedActionPatient(patient);
  }, []);

  const closeActionDrawer = useCallback(() => {
    setSelectedActionPatient(null);
  }, []);

  const getCleanRelationLabel = useCallback(
    (type?: string | null, customLabel?: string | null): string => {
      return getRelationshipLabel(type, customLabel);
    },
    []
  );

  const getRelationStatusKey = useCallback((type?: string | null): string => {
    return getRelationshipStatusKey(type);
  }, []);

  const getDemographicSlots = useCallback((patient: Patient): DemographicSlotItem[] => {
    const slots: DemographicSlotItem[] = [];

    // 1. Gender (Laki-laki / Perempuan)
    if (patient.gender) {
      slots.push({
        id: 'gender',
        label: getGenderLabel(patient.gender)
      });
    }

    // 2. Age (e.g. 42 th)
    if (patient.age !== undefined && patient.age !== null) {
      slots.push({
        id: 'age',
        label: `${patient.age} th`,
        isMono: true
      });
    }

    // 3. Blood type (e.g. Gol. A)
    const blood = patient.blood_type;
    const isUnknownBlood = !blood || blood === 'unknown' || blood === 'Belum Tahu';
    if (!isUnknownBlood) {
      slots.push({
        id: 'blood-type',
        label: `Gol. ${blood}`,
        isMono: true
      });
    }

    return slots;
  }, []);

  const formatVisitDate = useCallback((date?: string | null): string => {
    if (!date) return 'Belum ada kunjungan';
    return formatClinicDate(date, { style: 'human_short' });
  }, []);

  return useMemo(
    () => ({
      selectedActionPatient,
      openActionDrawer,
      closeActionDrawer,
      getCleanRelationLabel,
      getRelationStatusKey,
      getDemographicSlots,
      formatVisitDate
    }),
    [
      selectedActionPatient,
      openActionDrawer,
      closeActionDrawer,
      getCleanRelationLabel,
      getRelationStatusKey,
      getDemographicSlots,
      formatVisitDate
    ]
  );
}
