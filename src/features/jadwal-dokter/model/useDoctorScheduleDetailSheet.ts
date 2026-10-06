'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStatusConfig } from '@/styles/clinical-tokens';
import { useUpdateDoctorDayStatusMutation } from '../api/mutations';
import { doctorScheduleDetailQueryOptions } from '../api/queries';
import type { DoctorSchedule, ScheduleDayStatus } from '../api/types';
import {
  DOCTOR_CARD_STATUS,
  getDoctorCardStatus,
  parseDateToIso
} from '../utils/doctor-schedule-card-utils';
import { useDoctorConflictNavigation } from './useDoctorConflictNavigation';
import {
  DOCTOR_DETAIL_TAB,
  type DoctorDetailTab,
  useDoctorDetailDrawerStore
} from './useDoctorDetailDrawerStore';
import { INSPECTION_PHASE } from '../constants/doctor-dialog.constants';
import type { ReturnDoctorContext } from './useDoctorConflictNavigation';

export function formatMonthParam(year: number, zeroBasedMonth: number): string {
  return `${year}-${String(zeroBasedMonth + 1).padStart(2, '0')}`;
}

export function formatDateParam(year: number, zeroBasedMonth: number, day: number): string {
  const daysInMonth = new Date(year, zeroBasedMonth + 1, 0).getDate();
  const safeDay = Math.min(Math.max(day, 1), daysInMonth);
  return `${formatMonthParam(year, zeroBasedMonth)}-${String(safeDay).padStart(2, '0')}`;
}

function resolveInitialDoctorDate(
  selectedDate?: string,
  returnContext?: ReturnDoctorContext | null
): Date {
  if (returnContext?.sourceDate) {
    const parsed = new Date(`${returnContext.sourceDate}T00:00:00`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  if (selectedDate) {
    const iso = parseDateToIso(selectedDate);
    if (iso) {
      const parsed = new Date(`${iso}T00:00:00`);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
  }
  return new Date();
}

export interface UseDoctorScheduleDetailSheetProps {
  doctor: DoctorSchedule | null;
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string;
  highlightSlotTime?: string;
  openPatientsModal?: boolean;
  returnDoctorName?: string;
  returnContext?: ReturnDoctorContext | null;
  onReturnToSourceModal?: () => void;
}

export function useDoctorScheduleDetailSheet({
  doctor: propDoctor,
  isOpen,
  onClose,
  selectedDate,
  highlightSlotTime,
  openPatientsModal,
  returnDoctorName,
  returnContext,
  onReturnToSourceModal
}: UseDoctorScheduleDetailSheetProps) {
  const updateDayMutation = useUpdateDoctorDayStatusMutation();
  const conflictNav = useDoctorConflictNavigation();
  const isConflictReturning = conflictNav.phase === INSPECTION_PHASE.RETURNING;

  const cachedDoctor = useDoctorDetailDrawerStore((s) => s.cachedDoctor);
  const setCachedDoctor = useDoctorDetailDrawerStore((s) => s.setCachedDoctor);
  const targetStoreDoctorId = useDoctorDetailDrawerStore((s) => s.targetDoctorId);
  const storeActiveTab = useDoctorDetailDrawerStore((s) => s.activeTab);
  const setStoreActiveTab = useDoctorDetailDrawerStore((s) => s.setActiveTab);

  const shouldDefaultToKuotaTab = Boolean(
    highlightSlotTime ||
    openPatientsModal ||
    conflictNav.pendingReopen ||
    conflictNav.isInspecting ||
    isConflictReturning ||
    returnContext
  );

  const [activeTab, setActiveTabLocal] = React.useState<DoctorDetailTab>(() =>
    shouldDefaultToKuotaTab ? DOCTOR_DETAIL_TAB.KUOTA : storeActiveTab || DOCTOR_DETAIL_TAB.KALENDER
  );

  const setActiveTab = React.useCallback(
    (tab: DoctorDetailTab) => {
      setActiveTabLocal(tab);
      setStoreActiveTab(tab);
    },
    [setStoreActiveTab]
  );

  const initialDate = React.useMemo(
    () => resolveInitialDoctorDate(selectedDate, returnContext),
    [selectedDate, returnContext]
  );

  const [selectedDay, setSelectedDay] = React.useState<number>(initialDate.getDate());
  const [currentMonth, setCurrentMonth] = React.useState<number>(initialDate.getMonth());
  const [currentYear, setCurrentYear] = React.useState<number>(initialDate.getFullYear());
  const [pendingStatusDay, setPendingStatusDay] = React.useState<number | null>(null);

  const resetFocusState = React.useCallback(() => {
    const targetDate = resolveInitialDoctorDate(selectedDate, returnContext);
    setSelectedDay(targetDate.getDate());
    setCurrentMonth(targetDate.getMonth());
    setCurrentYear(targetDate.getFullYear());
    setActiveTab(shouldDefaultToKuotaTab ? DOCTOR_DETAIL_TAB.KUOTA : DOCTOR_DETAIL_TAB.KALENDER);
    setPendingStatusDay(null);
  }, [selectedDate, returnContext, shouldDefaultToKuotaTab, setActiveTab]);

  React.useEffect(() => {
    if (isOpen) {
      resetFocusState();
    }
  }, [isOpen, resetFocusState]);

  React.useEffect(() => {
    if (conflictNav.pendingReopen && isOpen) {
      setActiveTab(DOCTOR_DETAIL_TAB.KUOTA);
      if (conflictNav.pendingReopen.sourceDate) {
        const parts = conflictNav.pendingReopen.sourceDate.split('-').map(Number);
        if (parts.length === 3 && !Number.isNaN(parts[0])) {
          setCurrentYear(parts[0]);
          setCurrentMonth(parts[1] - 1);
          setSelectedDay(parts[2]);
        }
      }
    }
  }, [conflictNav.pendingReopen, isOpen, setActiveTab]);

  React.useEffect(() => {
    if ((highlightSlotTime || conflictNav.isInspecting) && isOpen) {
      setActiveTab(DOCTOR_DETAIL_TAB.KUOTA);
    }
  }, [highlightSlotTime, conflictNav.isInspecting, isOpen, setActiveTab]);

  const handleClose = React.useCallback(() => {
    if (conflictNav.phase === INSPECTION_PHASE.RETURNING) return;
    resetFocusState();
    onClose();
  }, [onClose, resetFocusState, conflictNav.phase]);

  const detailParams = React.useMemo(
    () => ({
      month: formatMonthParam(currentYear, currentMonth),
      date: formatDateParam(currentYear, currentMonth, selectedDay)
    }),
    [currentMonth, currentYear, selectedDay]
  );

  const effectiveDoctorId = propDoctor?.id || targetStoreDoctorId || '';

  const detailQuery = useQuery({
    ...doctorScheduleDetailQueryOptions(effectiveDoctorId, detailParams),
    enabled: isOpen && Boolean(effectiveDoctorId)
  });

  // Keep last verified doctor in memory ref to guarantee visual persistence across transitions
  const lastDoctorRef = React.useRef<DoctorSchedule | null>(null);

  React.useEffect(() => {
    if (detailQuery.data?.nama_dokter) {
      setCachedDoctor(detailQuery.data);
      lastDoctorRef.current = detailQuery.data;
    }
  }, [detailQuery.data, setCachedDoctor]);

  React.useEffect(() => {
    if (propDoctor?.nama_dokter) {
      setCachedDoctor(propDoctor);
      lastDoctorRef.current = propDoctor;
    }
  }, [propDoctor, setCachedDoctor]);

  // 100% Real Data: No dummy stubs, completely persistent across unmount transitions
  const doctor =
    (detailQuery.data?.nama_dokter ? detailQuery.data : null) ??
    (propDoctor?.nama_dokter ? propDoctor : null) ??
    (cachedDoctor?.nama_dokter ? cachedDoctor : null) ??
    lastDoctorRef.current;

  const isDetailLoading = detailQuery.isLoading && !detailQuery.data && !doctor;

  const activeTargetDate = formatDateParam(currentYear, currentMonth, selectedDay);
  const doctorStatus = doctor ? getDoctorCardStatus(doctor, undefined, activeTargetDate) : null;
  const doctorStatusConfig = doctorStatus ? getStatusConfig(doctorStatus) : null;
  const isUnconfigured = doctorStatus === DOCTOR_CARD_STATUS.BELUM_DIATUR;

  const initials = doctor?.nama_dokter
    ? doctor.nama_dokter
        .replace('dr. ', '')
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '';

  const handleDayStatusChange = React.useCallback(
    (day: number, status: ScheduleDayStatus, notes?: string) => {
      if (!doctor?.id) return;
      setPendingStatusDay(day);
      const formattedDate = formatDateParam(currentYear, currentMonth, day);
      updateDayMutation.mutate(
        {
          doctorId: doctor.id,
          date: formattedDate,
          status,
          reason: notes
        },
        {
          onSettled: () => {
            setPendingStatusDay(null);
          }
        }
      );
    },
    [doctor?.id, currentYear, currentMonth, updateDayMutation]
  );

  const handleReturnToSource = React.useCallback(() => {
    if (onReturnToSourceModal) {
      onReturnToSourceModal();
    } else {
      conflictNav.returnToSourceWizard();
    }
  }, [onReturnToSourceModal, conflictNav]);

  const effectiveReturnDoctorName =
    returnDoctorName ||
    conflictNav.returnContext?.sourceDoctorName ||
    conflictNav.pendingReopen?.sourceDoctorName ||
    '';

  const hasReturnTarget = Boolean(
    conflictNav.isInspecting || returnContext || conflictNav.pendingReopen || isConflictReturning
  );

  return {
    doctor,
    isDetailLoading,
    activeTab,
    setActiveTab,
    dateContext: {
      selectedDay,
      currentMonth,
      currentYear,
      setSelectedDay,
      setCurrentMonth,
      setCurrentYear
    },
    conflict: {
      isConflictReturning,
      isInspecting: conflictNav.isInspecting,
      pendingReopen: conflictNav.pendingReopen,
      hasReturnTarget,
      returnDoctorName: effectiveReturnDoctorName
    },
    mutation: {
      pendingStatusDay,
      isUpdatingDay: updateDayMutation.isPending,
      handleDayStatusChange
    },
    meta: {
      initials,
      doctorStatus,
      doctorStatusConfig,
      isUnconfigured
    },
    handlers: {
      handleClose,
      handleReturnToSource
    }
  };
}
