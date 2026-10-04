'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { DoctorSchedule, DoctorDailySession } from '../api/types';
import type { OccupancySlot } from '@/server/contracts/schedules/doctor-schedules.dto';
import type { GridSlotData } from '../components/grid/doctor-grid-slot-item';

export interface ScheduleSlotModalData {
  doctor: DoctorSchedule;
  session: DoctorDailySession;
  slot: OccupancySlot | GridSlotData;
  date?: string;
  onOpenPatients?: (session: DoctorDailySession, slotStartTime?: string, slotEndTime?: string) => void;
  onOpenPatientDetail?: (session: DoctorDailySession, slot: OccupancySlot | GridSlotData) => void;
  onOpenReschedule?: (session: DoctorDailySession, slotStartTime?: string) => void;
  onToggleSessionStatus?: (session: DoctorDailySession) => void;
}

export interface DoctorScheduleSlotModalContextValue {
  isOpen: boolean;
  slotData: ScheduleSlotModalData | null;
  openSlotModal: (data: ScheduleSlotModalData) => void;
  closeSlotModal: () => void;
}

const DoctorScheduleSlotModalContext = createContext<DoctorScheduleSlotModalContextValue | null>(null);

export interface DoctorScheduleSlotModalProviderProps {
  children: React.ReactNode;
}

export function DoctorScheduleSlotModalProvider({ children }: DoctorScheduleSlotModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [slotData, setSlotData] = useState<ScheduleSlotModalData | null>(null);

  const openSlotModal = useCallback((data: ScheduleSlotModalData) => {
    setSlotData(data);
    setIsOpen(true);
  }, []);

  const closeSlotModal = useCallback(() => {
    setIsOpen(false);
    setSlotData(null);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      slotData,
      openSlotModal,
      closeSlotModal
    }),
    [isOpen, slotData, openSlotModal, closeSlotModal]
  );

  return (
    <DoctorScheduleSlotModalContext.Provider value={value}>
      {children}
    </DoctorScheduleSlotModalContext.Provider>
  );
}

export function useDoctorScheduleSlotModal(): DoctorScheduleSlotModalContextValue {
  const context = useContext(DoctorScheduleSlotModalContext);

  // Fallback to local state if hook is used without the context provider
  const [localIsOpen, setLocalIsOpen] = useState(false);
  const [localSlotData, setLocalSlotData] = useState<ScheduleSlotModalData | null>(null);

  const localOpenSlotModal = useCallback((data: ScheduleSlotModalData) => {
    setLocalSlotData(data);
    setLocalIsOpen(true);
  }, []);

  const localCloseSlotModal = useCallback(() => {
    setLocalIsOpen(false);
    setLocalSlotData(null);
  }, []);

  if (context) {
    return context;
  }

  return {
    isOpen: localIsOpen,
    slotData: localSlotData,
    openSlotModal: localOpenSlotModal,
    closeSlotModal: localCloseSlotModal
  };
}
