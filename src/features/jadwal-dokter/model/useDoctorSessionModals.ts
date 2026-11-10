'use client';

import { useState } from 'react';
import type { DoctorSchedule, DoctorDailySession } from '../api/types';
import type { BookedPatientItem } from '@/server/contracts/schedules/doctor-schedules.dto';

export interface UseDoctorSessionModalsProps {
  doctor?: DoctorSchedule;
  formattedSelectedDate: string;
  isDayCuti: boolean;
  onAddSchedule?: () => void;
}

export function useDoctorSessionModals(_props: UseDoctorSessionModalsProps) {
  // Patients Modal
  const [isPatientsModalOpen, setIsPatientsModalOpen] = useState(false);
  const [selectedSessionForPatients, setSelectedSessionForPatients] =
    useState<DoctorDailySession | null>(null);

  // Patient Detail Modal
  const [selectedPatientForDetail, setSelectedPatientForDetail] =
    useState<BookedPatientItem | null>(null);
  const [isPatientDetailOpen, setIsPatientDetailOpen] = useState(false);

  const handleOpenPatients = (session: DoctorDailySession) => {
    setSelectedSessionForPatients(session);
    setIsPatientsModalOpen(true);
  };

  const handleClosePatientsModal = () => {
    setIsPatientsModalOpen(false);
    setSelectedSessionForPatients(null);
  };

  const handleOpenPatientDetail = (patient: BookedPatientItem) => {
    setSelectedPatientForDetail(patient);
    setIsPatientDetailOpen(true);
  };

  const handleClosePatientDetail = () => {
    setIsPatientDetailOpen(false);
    setSelectedPatientForDetail(null);
  };

  return {
    isPatientsModalOpen,
    setIsPatientsModalOpen,
    selectedSessionForPatients,
    selectedPatientForDetail,
    isPatientDetailOpen,
    handleOpenPatients,
    handleClosePatientsModal,
    handleOpenPatientDetail,
    handleClosePatientDetail
  };
}
