'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import type { Appointment, AppointmentFormData, AppointmentStatus, Doctor } from '../api/types';
import { getDoctorByName } from '../api/service';
import {
  patientAffiliationService,
  type BackendAppointmentItem
} from '@/features/data-pasien/api/patient-affiliation-service';
import {
  type AppointmentFilterState,
  type AppointmentFormMode,
  filterAppointments,
  paginateAppointments,
  updateAppointmentList
} from './appointmentViewModel';
import { isAppointmentFilterActive } from './appointment-filters.rules';

export interface AppointmentCardItem {
  appointment: Appointment;
  doctor: Doctor | undefined;
}

export interface UseAppointmentsViewResult {
  cards: AppointmentCardItem[];
  filteredCount: number;
  totalAppointments: number;
  hasActiveFilters: boolean;
  filters: AppointmentFilterState;
  currentPage: number;
  pageSize: number;
  isFormModalOpen: boolean;
  formModalMode: AppointmentFormMode;
  selectedAppointment: Appointment | null;
  isDetailsModalOpen: boolean;
  actions: {
    changeSearch: (value: string) => void;
    changeMonthFilter: (value: string) => void;
    changeDateFilter: (value: Date | undefined) => void;
    changeSelectedServices: (services: string[]) => void;
    changeSelectedStatuses: (statuses: AppointmentStatus[]) => void;
    resetFilters: () => void;
    changePage: (page: number) => void;
    changePageSize: (size: number) => void;
    openCreateModal: () => void;
    openRescheduleModal: (appointment: Appointment) => void;
    openDetailsModal: (appointment: Appointment) => void;
    closeFormModal: () => void;
    closeDetailsModal: () => void;
    submitForm: (
      data: AppointmentFormData,
      appointmentId?: string
    ) => { type: AppointmentFormMode };
  };
}

export function useAppointmentsView(): UseAppointmentsViewResult {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [monthFilter, setMonthFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<AppointmentStatus[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState<AppointmentFormMode>('create');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const mapBackendToUi = useCallback((apt: BackendAppointmentItem): Appointment => {
    let uiStatus: AppointmentStatus = 'Sudah Buat Janji';
    const st = (apt.status || '').toUpperCase();
    if (st === 'MENUNGGU' || st === 'WAITING' || st === 'CHECKED_IN') uiStatus = 'Menunggu';
    else if (st === 'SEDANG_DIPERIKSA' || st === 'IN_SERVICE') uiStatus = 'Sedang Diperiksa';
    else if (st === 'SELESAI' || st === 'COMPLETED') uiStatus = 'Selesai';
    else if (st === 'BATAL' || st === 'CANCELLED') uiStatus = 'Batal';
    else if (st === 'TIDAK_HADIR' || st === 'NO_SHOW') uiStatus = 'Tidak Hadir';

    return {
      id: apt.id,
      booking_code: apt.id.slice(0, 8).toUpperCase(),
      patient_name: apt.patientName || 'Pasien',
      patient_email: '',
      patient_avatar: '',
      doctor_name: apt.doctorName || 'Dokter Jaga',
      date: apt.appointmentDate,
      time: apt.session,
      complaint: apt.complaint || '-',
      status: uiStatus,
      service: apt.layananName || 'Poliklinik',
      created_at: apt.createdAt,
      queue_number: apt.queueNumber || '-'
    };
  }, []);

  const loadAppointments = useCallback(async () => {
    try {
      const data = await patientAffiliationService.getMyAppointments();
      if (Array.isArray(data) && data.length > 0) {
        setAppointments(data.map(mapBackendToUi));
      } else {
        setAppointments(loadStoredAppointments());
      }
    } catch {
      setAppointments(loadStoredAppointments());
    } finally {
      setIsInitialized(true);
    }
  }, [mapBackendToUi]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const filters = useMemo(
    () => ({
      searchQuery,
      monthFilter,
      dateFilter,
      selectedServices,
      selectedStatuses
    }),
    [dateFilter, monthFilter, searchQuery, selectedServices, selectedStatuses]
  );

  const filteredAppointments = useMemo(
    () => filterAppointments(appointments, filters),
    [appointments, filters]
  );

  const cards = useMemo(
    () =>
      paginateAppointments(filteredAppointments, currentPage, pageSize).map((appointment) => ({
        appointment,
        doctor: getDoctorByName(appointment.doctor_name)
      })),
    [currentPage, filteredAppointments, pageSize]
  );

  const resetPage = () => setCurrentPage(1);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    resetPage();
  };

  const handleMonthFilterChange = (value: string) => {
    setMonthFilter(value);
    resetPage();
  };

  const handleDateFilterChange = (value: Date | undefined) => {
    setDateFilter(value);
    resetPage();
  };

  const handleSelectedServicesChange = (services: string[]) => {
    setSelectedServices(services);
    resetPage();
  };

  const handleSelectedStatusesChange = (statuses: AppointmentStatus[]) => {
    setSelectedStatuses(statuses);
    resetPage();
  };

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setMonthFilter('ALL');
    setDateFilter(undefined);
    setSelectedServices([]);
    setSelectedStatuses([]);
    resetPage();
  };

  const handleOpenCreateModal = () => {
    setSelectedAppointment(null);
    setFormModalMode('create');
    setIsFormModalOpen(true);
  };

  const handleOpenRescheduleModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setFormModalMode('edit');
    setIsFormModalOpen(true);
  };

  const handleOpenDetailsModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsModalOpen(true);
  };

  const handleSubmitForm = (data: AppointmentFormData, appointmentId?: string) => {
    if (formModalMode === 'edit' && appointmentId) {
      setAppointments((prev) =>
        updateAppointmentList(prev, appointmentId, data, new Date().toISOString())
      );
      return { type: 'edit' as const };
    }

    loadAppointments();
    return { type: 'create' as const };
  };

  return {
    cards,
    filteredCount: filteredAppointments.length,
    totalAppointments: appointments.length,
    hasActiveFilters: isAppointmentFilterActive(filters),
    filters,
    currentPage,
    pageSize,
    isFormModalOpen,
    formModalMode,
    selectedAppointment,
    isDetailsModalOpen,
    actions: {
      changeSearch: handleSearchChange,
      changeMonthFilter: handleMonthFilterChange,
      changeDateFilter: handleDateFilterChange,
      changeSelectedServices: handleSelectedServicesChange,
      changeSelectedStatuses: handleSelectedStatusesChange,
      resetFilters: handleResetAllFilters,
      changePage: setCurrentPage,
      changePageSize: setPageSize,
      openCreateModal: handleOpenCreateModal,
      openRescheduleModal: handleOpenRescheduleModal,
      openDetailsModal: handleOpenDetailsModal,
      closeFormModal: () => setIsFormModalOpen(false),
      closeDetailsModal: () => setIsDetailsModalOpen(false),
      submitForm: handleSubmitForm,
      reload: loadAppointments
    }
  };
}
