'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  APPOINTMENT_STATUS,
  AppointmentStatusDescriptor
} from '@/constants/appointment-status.constants';
import type { Appointment, AppointmentFormData, AppointmentStatus, Doctor } from '../api/types';
import { getDoctorByName } from '../api/service';
import {
  patientAffiliationService,
  type BackendAppointmentItem
} from '@/features/data-pasien/api/patient-affiliation-service';
import { formatClinicTime } from '@/lib/date-format';
import { formatFriendlySessionName } from '@/features/jadwal-dokter/constants/schedule-shift.constants';
import {
  type AppointmentFilterState,
  type AppointmentFormMode,
  filterAppointments,
  paginateAppointments
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
  isLoading: boolean;
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
    openDetailsModal: (appointment: Appointment) => void;
    openDetailsById: (appointmentId: string) => void;
    closeFormModal: () => void;
    closeDetailsModal: () => void;
    cancelAppointment: (appointmentId: string, reason?: string) => Promise<void>;
    submitForm: (
      data: AppointmentFormData,
      appointmentId?: string
    ) => { type: AppointmentFormMode };
    reload: () => Promise<void>;
  };
}

export function useAppointmentsView(): UseAppointmentsViewResult {
  const today = useMemo(() => new Date(), []);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [monthFilter, setMonthFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(() => new Date());
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<AppointmentStatus[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState<AppointmentFormMode>('create');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const mapBackendToUi = useCallback((apt: BackendAppointmentItem): Appointment => {
    const canonicalStatus: AppointmentStatus = AppointmentStatusDescriptor.from(apt.status).code;

    const timeSource = apt.etaRange || '';
    const timeMatches = timeSource.match(/(\d{1,2}[:.]\d{2})/g);
    const startClock = timeMatches?.[0]
      ? timeMatches[0].replace('.', ':')
      : apt.scheduledStartTime
        ? formatClinicTime(apt.scheduledStartTime)
        : '';
    const endClock = timeMatches?.[1]
      ? timeMatches[1].replace('.', ':')
      : apt.scheduledEndTime
        ? formatClinicTime(apt.scheduledEndTime)
        : '';

    const startTimeFormatted = startClock ? formatClinicTime(startClock) : '';
    const endTimeFormatted = endClock ? formatClinicTime(endClock) : '';
    const friendlySession = formatFriendlySessionName(apt.sessionName || apt.session);
    const timeDisplay =
      apt.etaRange ||
      (startTimeFormatted && endTimeFormatted
        ? `${startTimeFormatted} - ${endTimeFormatted}`
        : friendlySession || apt.session || '-');

    const rawFlow =
      apt.medicalFlow ||
      (apt.layananName?.toLowerCase().includes('imunisasi')
        ? 'immunization'
        : apt.layananName?.toLowerCase().includes('kebidanan') ||
            apt.layananName?.toLowerCase().includes('persalinan')
          ? 'pregnancy'
          : undefined);

    return {
      id: apt.id,
      patient_id: apt.patientId,
      booking_code: apt.bookingCode || apt.id.slice(0, 8).toUpperCase(),
      patient_name: apt.patientName || 'Pasien',
      patient_email: '',
      patient_avatar: '',
      doctor_name: apt.doctorName || '',
      doctor_specialty: apt.doctorSpecialty || '',
      poliklinik_name: apt.poliklinikName || '',
      room_name: apt.roomName || '',
      room_location: apt.roomLocation || '',
      scheduled_start_time: startTimeFormatted || undefined,
      scheduled_end_time: endTimeFormatted || undefined,
      actual_started_at: apt.actualStartedAt ? String(apt.actualStartedAt) : undefined,
      actual_completed_at: apt.actualCompletedAt ? String(apt.actualCompletedAt) : undefined,
      consultation_elapsed_seconds: apt.consultationElapsedSeconds ?? undefined,
      consultation_duration_formatted: apt.consultationDurationFormatted || undefined,
      estimated_duration_minutes: apt.estimatedDurationMinutes,
      eta_range: apt.etaRange || null,
      ahead_count: apt.aheadCount ?? null,
      date: apt.appointmentDate,
      time: timeDisplay,
      session: friendlySession || apt.session || undefined,
      session_name: friendlySession || undefined,
      complaint: apt.complaint || '-',
      status: canonicalStatus,
      visit_type: apt.visitType || '',
      service: apt.layananName || '',
      medical_flow: rawFlow as Appointment['medical_flow'],
      created_at: apt.createdAt,
      queue_number: apt.queueNumber || '-',
      doctor_id: apt.staffId,
      staff_id: apt.staffId,
      poliklinik_id: apt.poliklinikId,
      layanan_id: apt.layananId,
      allowedActions:
        apt.allowedActions ||
        (['BOOKED', 'WAITING', 'LATE'].includes(canonicalStatus)
          ? ['CANCEL', 'RESCHEDULE']
          : [])
    };
  }, []);

  const loadAppointments = useCallback(async () => {
    try {
      const data = await patientAffiliationService.getMyAppointments();
      if (Array.isArray(data)) {
        setAppointments(data.map(mapBackendToUi));
      } else {
        setAppointments([]);
      }
    } catch {
      setAppointments([]);
    } finally {
      setIsInitialized(true);
    }
  }, [mapBackendToUi]);

  useEffect(() => {
    loadAppointments();

    const handleRealtimeSync = () => {
      loadAppointments();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('clinic:notification_received', handleRealtimeSync);
      window.addEventListener('clinic:appointment_updated', handleRealtimeSync);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('clinic:notification_received', handleRealtimeSync);
        window.removeEventListener('clinic:appointment_updated', handleRealtimeSync);
      }
    };
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
        doctor: getDoctorByName(appointment.doctor_name || '')
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
    setDateFilter(value || new Date());
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
    setDateFilter(new Date());
    setSelectedServices([]);
    setSelectedStatuses([]);
    resetPage();
  };

  const handleOpenCreateModal = () => {
    setSelectedAppointment(null);
    setFormModalMode('create');
    setIsFormModalOpen(true);
  };

  const handleOpenDetailsModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsModalOpen(true);
  };

  const handleOpenDetailsById = (appointmentId: string) => {
    const found = appointments.find((a) => a.id === appointmentId);
    if (found) {
      setSelectedAppointment(found);
      setIsDetailsModalOpen(true);
    }
  };

  const handleCancelAppointment = async (appointmentId: string, reason?: string) => {
    try {
      await patientAffiliationService.cancelAppointment(appointmentId, reason);
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === appointmentId ? { ...item, status: APPOINTMENT_STATUS.CANCELLED } : item
        )
      );
      setSelectedAppointment((prev) =>
        prev && prev.id === appointmentId ? { ...prev, status: APPOINTMENT_STATUS.CANCELLED } : prev
      );
      toast.success('Janji temu berhasil dibatalkan');
      await loadAppointments();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal membatalkan janji temu';
      toast.error(msg);
      throw err;
    }
  };

  const handleSubmitForm = (_data: AppointmentFormData, _appointmentId?: string) => {
    loadAppointments();
    return { type: 'create' as const };
  };

  return {
    cards,
    filteredCount: filteredAppointments.length,
    totalAppointments: appointments.length,
    hasActiveFilters: isAppointmentFilterActive(filters, today),
    isLoading: !isInitialized,
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
      openDetailsModal: handleOpenDetailsModal,
      openDetailsById: handleOpenDetailsById,
      closeFormModal: () => setIsFormModalOpen(false),
      closeDetailsModal: () => setIsDetailsModalOpen(false),
      cancelAppointment: handleCancelAppointment,
      submitForm: handleSubmitForm,
      reload: loadAppointments
    }
  };
}
