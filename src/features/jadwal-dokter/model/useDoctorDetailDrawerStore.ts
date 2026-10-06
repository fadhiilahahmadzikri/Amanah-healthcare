'use client';

import { create } from 'zustand';
import type { DoctorSchedule } from '../api/types';

export const DOCTOR_DETAIL_TAB = {
  KALENDER: 'kalender',
  KUOTA: 'kuota',
  INFORMASI: 'informasi'
} as const;

export type DoctorDetailTab = (typeof DOCTOR_DETAIL_TAB)[keyof typeof DOCTOR_DETAIL_TAB];

export interface DoctorDrawerOpenOptions {
  tab?: DoctorDetailTab;
  highlightSlotTime?: string | null;
  openPatients?: boolean;
  date?: string | null;
}

export interface DoctorDetailDrawerState {
  isOpen: boolean;
  targetDoctorId: string | null;
  cachedDoctor: DoctorSchedule | null;
  activeTab: DoctorDetailTab;
  highlightSlotTime: string | null;
  openPatients: boolean;
  selectedDate: string | null;

  // Actions
  openWithDoctor: (doctor: DoctorSchedule, options?: DoctorDrawerOpenOptions) => void;
  openWithId: (doctorId: string, options?: DoctorDrawerOpenOptions) => void;
  closeDrawer: () => void;
  setCachedDoctor: (doctor: DoctorSchedule) => void;
  setActiveTab: (tab: DoctorDetailTab) => void;
  setHighlightSlotTime: (time: string | null) => void;
  setOpenPatients: (open: boolean) => void;
  setSelectedDate: (date: string | null) => void;
}

/**
 * Global managerial state for Doctor Schedule Detail Drawer.
 * Guarantees in-memory persistence during exit animations (no skeleton flicker on close),
 * clean separation of presentation vs table query lifecycle, and seamless deep-linking.
 */
export const useDoctorDetailDrawerStore = create<DoctorDetailDrawerState>((set, get) => ({
  isOpen: false,
  targetDoctorId: null,
  cachedDoctor: null,
  activeTab: DOCTOR_DETAIL_TAB.KALENDER,
  highlightSlotTime: null,
  openPatients: false,
  selectedDate: null,

  openWithDoctor: (doctor, options = {}) => {
    const isSpecialized = Boolean(
      options.highlightSlotTime || options.openPatients || options.tab === DOCTOR_DETAIL_TAB.KUOTA
    );
    set({
      isOpen: true,
      targetDoctorId: doctor.id,
      cachedDoctor: doctor,
      activeTab: options.tab ?? (isSpecialized ? DOCTOR_DETAIL_TAB.KUOTA : DOCTOR_DETAIL_TAB.KALENDER),
      highlightSlotTime: options.highlightSlotTime ?? null,
      openPatients: options.openPatients ?? false,
      selectedDate: options.date ?? null
    });
  },

  openWithId: (doctorId, options = {}) => {
    const current = get().cachedDoctor;
    const sameDoctor = current && (current.id === doctorId || current.practitioner_id === doctorId);
    const isSpecialized = Boolean(
      options.highlightSlotTime || options.openPatients || options.tab === DOCTOR_DETAIL_TAB.KUOTA
    );

    set({
      isOpen: true,
      targetDoctorId: doctorId,
      // If we already have this doctor in cache, keep it! Do not reset to null!
      cachedDoctor: sameDoctor ? current : null,
      activeTab: options.tab ?? (isSpecialized ? DOCTOR_DETAIL_TAB.KUOTA : DOCTOR_DETAIL_TAB.KALENDER),
      highlightSlotTime: options.highlightSlotTime ?? null,
      openPatients: options.openPatients ?? false,
      selectedDate: options.date ?? null
    });
  },

  closeDrawer: () => {
    // Crucial: keep cachedDoctor in memory so during Radix ~300ms exit transition,
    // the content remains visually stable without collapsing into a skeleton.
    set({
      isOpen: false,
      highlightSlotTime: null,
      openPatients: false
    });
  },

  setCachedDoctor: (doctor) => {
    set((state) => {
      // Only update if it belongs to current target doctor
      if (!state.targetDoctorId || state.targetDoctorId === doctor.id || state.targetDoctorId === doctor.practitioner_id) {
        return { cachedDoctor: doctor };
      }
      return {};
    });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setHighlightSlotTime: (highlightSlotTime) => set({ highlightSlotTime }),
  setOpenPatients: (openPatients) => set({ openPatients }),
  setSelectedDate: (selectedDate) => set({ selectedDate })
}));
