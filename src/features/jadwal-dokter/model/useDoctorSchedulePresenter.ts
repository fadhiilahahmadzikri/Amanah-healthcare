'use client';

import { useState, useCallback } from 'react';
import { useDoctorScheduleView, toDateParam } from './useDoctorScheduleView';
import { useDoctorScheduleSettingsCycle } from './useDoctorScheduleSettingsCycle';
import type { DoctorSchedule } from '../api/types';
import type { ConfigurationCategory } from './useDoctorScheduleSettingsModal';

export interface UseDoctorSchedulePresenterResult {
  scheduleView: ReturnType<typeof useDoctorScheduleView>;
  settingsCycle: ReturnType<typeof useDoctorScheduleSettingsCycle>;
  assignmentModal: {
    isOpen: boolean;
    doctor: DoctorSchedule | null;
    focusedDow: number | undefined;
    open: (doctor: DoctorSchedule, focusedDow?: number) => void;
    close: () => void;
  };
  selectedDateParam: string | undefined;
  actions: {
    openAssignment: (doctor: DoctorSchedule, focusedDow?: number) => void;
    closeAssignment: () => void;
    openSettingsForDoctor: (doctor: DoctorSchedule) => void;
    openConfiguration: (category: ConfigurationCategory, subView?: 'defs' | 'operating_days') => void;
  };
}

export function useDoctorSchedulePresenter(): UseDoctorSchedulePresenterResult {
  const scheduleView = useDoctorScheduleView();
  const settingsCycle = useDoctorScheduleSettingsCycle();

  const [selectedDoctorForAssignment, setSelectedDoctorForAssignment] =
    useState<DoctorSchedule | null>(null);
  const [assignmentFocusedDow, setAssignmentFocusedDow] = useState<number | undefined>(undefined);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  const openAssignment = useCallback((doctor: DoctorSchedule, focusedDow?: number) => {
    setSelectedDoctorForAssignment(doctor);
    setAssignmentFocusedDow(focusedDow);
    setIsAssignmentModalOpen(true);
  }, []);

  const closeAssignment = useCallback(() => {
    setIsAssignmentModalOpen(false);
    setSelectedDoctorForAssignment(null);
    setAssignmentFocusedDow(undefined);
  }, []);

  const openSettingsForDoctor = useCallback(
    (doctor: DoctorSchedule) => {
      openAssignment(doctor, undefined);
    },
    [openAssignment]
  );

  const openConfiguration = useCallback(
    (category: ConfigurationCategory, subView?: 'defs' | 'operating_days') => {
      settingsCycle.openSettings(category, subView);
    },
    [settingsCycle]
  );

  const selectedDateParam = scheduleView.dateFilter
    ? toDateParam(scheduleView.dateFilter)
    : undefined;

  return {
    scheduleView,
    settingsCycle,
    assignmentModal: {
      isOpen: isAssignmentModalOpen,
      doctor: selectedDoctorForAssignment,
      focusedDow: assignmentFocusedDow,
      open: openAssignment,
      close: closeAssignment
    },
    selectedDateParam,
    actions: {
      openAssignment,
      closeAssignment,
      openSettingsForDoctor,
      openConfiguration
    }
  };
}
