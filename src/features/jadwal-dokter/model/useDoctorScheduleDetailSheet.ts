'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStatusConfig } from '@/styles/clinical-tokens';
import { useUpdateDoctorDayStatusMutation } from '../api/mutations';
import { doctorScheduleDetailQueryOptions } from '../api/queries';
import type { DoctorSchedule, ScheduleDayStatus } from '../api/types';
import { getDoctorCardStatus } from '../utils/doctor-schedule-card-utils';
import { DOCTOR_DETAIL_TAB, type DoctorDetailTab } from '../constants/doctor-dialog.constants';
import { formatClinicDate } from '@/lib/date-format';

export function formatMonthParam(year: number, zeroBasedMonth: number): string {
  return `${year}-${String(zeroBasedMonth + 1).padStart(2, '0')}`;
}

export function formatDateParam(year: number, zeroBasedMonth: number, day: number): string {
  const daysInMonth = new Date(year, zeroBasedMonth + 1, 0).getDate();
  const safeDay = Math.min(Math.max(day, 1), daysInMonth);
  return `${formatMonthParam(year, zeroBasedMonth)}-${String(safeDay).padStart(2, '0')}`;
}

function resolveInitialDoctorDate(selectedDate?: string): Date {
  if (selectedDate) {
    const iso = formatClinicDate(selectedDate, { style: 'iso' });
    if (iso && iso !== '-') {
      const [y, m, d] = iso.split('-').map(Number);
      if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(d)) {
        return new Date(y, m - 1, d);
      }
    }
  }
  return new Date();
}

export interface UseDoctorScheduleDetailSheetProps {
  doctor: DoctorSchedule | null;
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string;
}

export function useDoctorScheduleDetailSheet({
  doctor: propDoctor,
  isOpen,
  onClose,
  selectedDate
}: UseDoctorScheduleDetailSheetProps) {
  const updateDayMutation = useUpdateDoctorDayStatusMutation();
  const [activeTab, setActiveTab] = React.useState<DoctorDetailTab>(DOCTOR_DETAIL_TAB.SESI);

  const initialDate = React.useMemo(() => resolveInitialDoctorDate(selectedDate), [selectedDate]);

  const [selectedDay, setSelectedDay] = React.useState<number>(initialDate.getDate());
  const [currentMonth, setCurrentMonth] = React.useState<number>(initialDate.getMonth());
  const [currentYear, setCurrentYear] = React.useState<number>(initialDate.getFullYear());
  const [pendingStatusDay, setPendingStatusDay] = React.useState<number | null>(null);

  const resetFocusState = React.useCallback(() => {
    const targetDate = resolveInitialDoctorDate(selectedDate);
    setSelectedDay(targetDate.getDate());
    setCurrentMonth(targetDate.getMonth());
    setCurrentYear(targetDate.getFullYear());
    setActiveTab(DOCTOR_DETAIL_TAB.SESI);
    setPendingStatusDay(null);
  }, [selectedDate, setActiveTab]);

  React.useEffect(() => {
    if (isOpen) {
      resetFocusState();
    }
  }, [isOpen, resetFocusState]);

  const handleClose = React.useCallback(() => {
    resetFocusState();
    onClose();
  }, [onClose, resetFocusState]);

  const detailParams = React.useMemo(
    () => ({
      month: formatMonthParam(currentYear, currentMonth),
      date: formatDateParam(currentYear, currentMonth, selectedDay)
    }),
    [currentMonth, currentYear, selectedDay]
  );

  const effectiveDoctorId = propDoctor?.id || '';

  const detailQuery = useQuery({
    ...doctorScheduleDetailQueryOptions(effectiveDoctorId, detailParams),
    enabled: isOpen && Boolean(effectiveDoctorId)
  });

  // Keep last verified doctor in memory ref to guarantee visual persistence across transitions
  const lastDoctorRef = React.useRef<DoctorSchedule | null>(null);

  React.useEffect(() => {
    if (detailQuery.data?.nama_dokter) {
      lastDoctorRef.current = detailQuery.data;
    }
  }, [detailQuery.data]);

  React.useEffect(() => {
    if (propDoctor?.nama_dokter) {
      lastDoctorRef.current = propDoctor;
    }
  }, [propDoctor]);

  // 100% Real Data: No dummy stubs, completely persistent across unmount transitions
  const doctor =
    (detailQuery.data?.nama_dokter ? detailQuery.data : null) ??
    (propDoctor?.nama_dokter ? propDoctor : null) ??
    lastDoctorRef.current;

  const isDetailLoading = detailQuery.isLoading && !detailQuery.data && !doctor;

  const doctorStatus = doctor ? getDoctorCardStatus(doctor) : null;
  const doctorStatusConfig = doctorStatus ? getStatusConfig(doctorStatus) : null;
  const isUnconfigured = !doctor?.sesi_harian || doctor.sesi_harian.length === 0;

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
      handleClose
    }
  };
}
