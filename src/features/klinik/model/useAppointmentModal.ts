'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import gsap from 'gsap';
import { toast } from 'sonner';
import type { ServiceCardItem } from '@/features/public-site/pages/services/types';
import {
  patientAffiliationService,
  type PatientAffiliationProfile,
  type BackendAppointmentItem
} from '@/features/data-pasien/api/patient-affiliation-service';
import {
  catalogService,
  type ServiceCatalogItem,
  type ServiceCategoryCatalog
} from '../api/catalog.service';
import { getServiceImage } from '../constants/appointment-reservation-services';
import type { Appointment, AppointmentFormData } from '../api/types';

export type BookingModalStep =
  | 'category'
  | 'service'
  | 'patient'
  | 'patient_new'
  | 'date'
  | 'session'
  | 'visit_type'
  | 'complaint'
  | 'confirmation';

export interface UseAppointmentModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialAppointment?: Appointment | null;
  onClose: () => void;
  onSubmit: (formData: AppointmentFormData, appointmentId?: string) => void;
}

export function useAppointmentModal({
  isOpen,
  mode,
  initialAppointment,
  onClose,
  onSubmit
}: UseAppointmentModalProps) {
  // Wizard state
  const [step, setStep] = useState<BookingModalStep>('category');
  const [categories, setCategories] = useState<ServiceCategoryCatalog[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isLoadingCatalog, setIsLoadingCatalog] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<ServiceCatalogItem | null>(null);

  // Form state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().slice(0, 10);

  const [dateStr, setDateStr] = useState<string>(defaultDateStr);
  const [timeSlot, setTimeSlot] = useState<string>('PAGI');
  const [visitType, setVisitType] = useState<'Pemeriksaan Baru' | 'Kontrol Ulang'>('Pemeriksaan Baru');
  const [complaint, setComplaint] = useState<string>('');
  const [isVisitTypeOpen, setIsVisitTypeOpen] = useState(false);

  // Patient profiles state
  const [patients, setPatients] = useState<PatientAffiliationProfile[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);

  // Specialized flows (Persalinan / Imunisasi)
  const [activeMedicalFlow, setActiveMedicalFlow] = useState<'pregnancy' | 'immunization' | null>(null);

  // Submission & Queue Ticket Modal
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [rescheduleStaffId, setRescheduleStaffId] = useState<string>('');
  const [reschedulePoliklinikId, setReschedulePoliklinikId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQueueSuccessOpen, setIsQueueSuccessOpen] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  // Refs for GSAP transitions
  const visitTypeDropdownRef = useRef<HTMLDivElement>(null);
  const stepContainerRef = useRef<HTMLDivElement>(null);

  const visitTypeOptions = ['Pemeriksaan Baru', 'Kontrol Ulang'] as const;

  // 1. Load Categories & Services from Backend Catalog
  const loadCatalog = useCallback(async () => {
    try {
      setIsLoadingCatalog(true);
      const data = await catalogService.getServiceCatalog();
      if (Array.isArray(data) && data.length > 0) {
        setCategories(data);
        setSelectedCategoryId((prev) => prev || data[0].id || data[0].code);
      }
    } catch (err) {
      console.error('Failed to load clinic catalog:', err);
    } finally {
      setIsLoadingCatalog(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  // Track open state transitions to prevent unintended resets on state updates
  const prevIsOpenRef = useRef(false);

  // 2. Load Patient Profiles
  const loadPatients = useCallback(async () => {
    try {
      setIsLoadingPatients(true);
      const data = await patientAffiliationService.getMyAffiliations();
      setPatients(data);
      setSelectedPatientId((prev) => prev || (data.length > 0 ? data[0].id : ''));
    } catch (err) {
      console.error('Failed to load patient affiliations:', err);
    } finally {
      setIsLoadingPatients(false);
    }
  }, []);

  // 3. Reset or initialize ONLY on modal open transition
  useEffect(() => {
    const wasOpen = prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;

    if (isOpen && !wasOpen) {
      if (mode === 'edit' && initialAppointment) {
        setStep('date');
        setDateStr(initialAppointment.date || defaultDateStr);
        setComplaint(initialAppointment.complaint || '');
        setTimeSlot(initialAppointment.session || 'PAGI');

        const initialDoctorId = initialAppointment.staff_id || initialAppointment.doctor_id || '';
        const initialPoliId = initialAppointment.poliklinik_id || '';
        setRescheduleStaffId(initialDoctorId);
        setReschedulePoliklinikId(initialPoliId);

        // Fetch canonical reschedule options to ensure 100% accurate doctor ID from backend SSOT
        if (initialAppointment.id) {
          patientAffiliationService.getRescheduleOptions(initialAppointment.id).then((options) => {
            if (options?.doctor?.id) {
              setRescheduleStaffId(options.doctor.id);
            }
          });
        }
      } else {
        setStep('category');
        setSelectedService(null);
        setComplaint('');
        setDateStr(defaultDateStr);
        setTimeSlot('PAGI');
        setRescheduleStaffId('');
        setReschedulePoliklinikId('');
      }
      loadPatients();
    } else if (!isOpen && wasOpen) {
      setSelectedService(null);
      setComplaint('');
      setActiveMedicalFlow(null);
      setIsQueueSuccessOpen(false);
      setCreatedAppointment(null);
      setRescheduleStaffId('');
      setReschedulePoliklinikId('');
    }
  }, [isOpen, mode, initialAppointment, defaultDateStr, loadPatients]);

  // 4. GSAP Step Animations
  useEffect(() => {
    if (stepContainerRef.current) {
      stepContainerRef.current.scrollTop = 0;
      gsap.fromTo(
        stepContainerRef.current,
        { opacity: 0.6, y: 6 },
        { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' }
      );
    }
  }, [step]);

  // 5. GSAP Dropdown Animation for Visit Type
  useEffect(() => {
    if (visitTypeDropdownRef.current) {
      if (isVisitTypeOpen) {
        gsap.fromTo(
          visitTypeDropdownRef.current,
          { height: 0, opacity: 0 },
          { height: 'auto', opacity: 1, duration: 0.2, ease: 'power2.out' }
        );
      } else {
        gsap.to(visitTypeDropdownRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.15,
          ease: 'power2.in'
        });
      }
    }
  }, [isVisitTypeOpen]);

  // Derived selected patient
  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId) || patients[0] || null,
    [patients, selectedPatientId]
  );

  // Derived categories display list - 100% backend SSOT, NO dummy fallback
  const activeCategoryList = useMemo(() => {
    return categories.map((c) => ({
      id: c.id,
      code: c.code,
      title: c.name,
      icon: c.code.includes('kia') || c.code.includes('midwifery') ? '👶' : '🩺',
      description:
        c.description ||
        (c.code.includes('kia')
          ? 'Pemeriksaan kehamilan, persalinan, nifas, KB, dan imunisasi anak.'
          : 'Pemeriksaan kesehatan umum, cek laboratorium, dan konsultasi dokter.'),
      servicesCount: c.services?.length || 0,
      services: c.services || []
    }));
  }, [categories]);

  // Derived services for the selected category
  const activeCategoryServices = useMemo(() => {
    const foundCat =
      categories.find((c) => c.id === selectedCategoryId || c.code === selectedCategoryId) ||
      categories[0];
    if (foundCat && Array.isArray(foundCat.services)) {
      return foundCat.services;
    }
    return [];
  }, [categories, selectedCategoryId]);

  // Bento Grid Items mapping images from frontend assets
  const serviceBentoItems = useMemo<ServiceCardItem[]>(() => {
    return activeCategoryServices.map((srv) => {
      const img = getServiceImage(srv.name);
      return {
        id: srv.id,
        title: srv.name,
        description: srv.description || '',
        image: img,
        colSpanClass: 'col-span-12 sm:col-span-6 md:col-span-6',
        heightClass: 'min-h-[118px] sm:min-h-[132px]'
      };
    });
  }, [activeCategoryServices]);

  // Handle service card click in Bento Grid
  const handleSelectServiceItem = (item: ServiceCardItem) => {
    const srv = activeCategoryServices.find((s) => s.id === item.id);
    if (!srv) return;

    setSelectedService(srv);

    // Specialized Flow Trigger
    if (srv.medicalFlow === 'pregnancy') {
      setActiveMedicalFlow('pregnancy');
      return;
    }
    if (srv.medicalFlow === 'immunization') {
      setActiveMedicalFlow('immunization');
      return;
    }

    // Regular On-Demand Flow: Proceed to Patient Profile Step
    if (patients.length === 0) {
      setStep('patient_new');
    } else {
      setStep('patient');
    }
  };

  // Handle patient created via regular patient form
  const handlePatientCreated = (newPatient: PatientAffiliationProfile) => {
    setPatients((prev) => [newPatient, ...prev]);
    setSelectedPatientId(newPatient.id);
    setStep('date');
    toast.success('Data profil pasien berhasil didaftarkan');
  };

  // Handle final submission to backend API
  const handleFinalSubmit = async () => {
    if (mode === 'edit' && initialAppointment?.id) {
      try {
        setIsSubmitting(true);
        const res: BackendAppointmentItem = await patientAffiliationService.rescheduleAppointment(
          initialAppointment.id,
          {
            targetDate: dateStr,
            targetSessionId: selectedSessionId || undefined,
            targetSession: timeSlot,
            reason: complaint.trim() || 'Penjadwalan ulang sesi periksa'
          }
        );

        const formatTime = (t?: string) => {
          if (!t) return '';
          const match = t.match(/^(\d{1,2}):(\d{2})/);
          return match ? `${match[1].padStart(2, '0')}.${match[2]}` : t;
        };
        const startTimeFormatted = formatTime(res.scheduledStartTime);
        const endTimeFormatted = formatTime(res.scheduledEndTime);
        const timeDisplay =
          startTimeFormatted && endTimeFormatted
            ? `${startTimeFormatted} - ${endTimeFormatted} WIB`
            : res.session || timeSlot;

        const uiApt: Appointment = {
          id: res.id,
          booking_code: res.id.slice(0, 8).toUpperCase(),
          patient_name: res.patientName || initialAppointment.patient_name || 'Pasien',
          patient_email: initialAppointment.patient_email || '',
          patient_avatar: initialAppointment.patient_avatar || '',
          doctor_name: res.doctorName || initialAppointment.doctor_name || '',
          doctor_specialty: res.doctorSpecialty || initialAppointment.doctor_specialty || '',
          poliklinik_name: res.poliklinikName || initialAppointment.poliklinik_name || '',
          room_name: res.roomName || initialAppointment.room_name || '',
          room_location: res.roomLocation || initialAppointment.room_location || '',
          scheduled_start_time: startTimeFormatted || initialAppointment.scheduled_start_time,
          scheduled_end_time: endTimeFormatted || initialAppointment.scheduled_end_time,
          date: res.appointmentDate || dateStr,
          time: timeDisplay,
          complaint: res.complaint || complaint,
          status: 'Sudah Buat Janji',
          visit_type: res.visitType || initialAppointment.visit_type || '',
          service: res.layananName || initialAppointment.service || '',
          created_at: res.createdAt || new Date().toISOString(),
          queue_number: res.queueNumber || initialAppointment.queue_number || '-'
        };

        setCreatedAppointment(uiApt);
        setIsQueueSuccessOpen(true);

        onSubmit(
          {
            service: uiApt.service || '',
            complaint: uiApt.complaint,
            visitType: visitType as any,
            doctor: uiApt.doctor_name,
            dateStr: uiApt.date,
            timeSlot: uiApt.time
          },
          initialAppointment.id
        );

        toast.success('Jadwal janji temu berhasil di-reschedule');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Gagal me-reschedule janji temu';
        toast.error(msg);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!selectedPatientId && patients.length > 0) {
      setSelectedPatientId(patients[0].id);
    }

    const patientIdToUse = selectedPatientId || (patients[0] ? patients[0].id : '');
    if (!patientIdToUse) {
      toast.error('Silakan tentukan data pasien terlebih dahulu');
      setStep('patient_new');
      return;
    }

    try {
      setIsSubmitting(true);
      const res: BackendAppointmentItem = await patientAffiliationService.createAppointment({
        patientId: patientIdToUse,
        poliklinikId: selectedService?.poliklinikId || '',
        layananId: selectedService?.id || '',
        appointmentDate: dateStr,
        session: timeSlot,
        visitType,
        complaint: complaint.trim() || 'Konsultasi dan pemeriksaan kesehatan'
      });

      const currentPatient = patients.find((p) => p.id === patientIdToUse);

      const formatTime = (t?: string) => {
        if (!t) return '';
        const match = t.match(/^(\d{1,2}):(\d{2})/);
        return match ? `${match[1].padStart(2, '0')}.${match[2]}` : t;
      };
      const startTimeFormatted = formatTime(res.scheduledStartTime);
      const endTimeFormatted = formatTime(res.scheduledEndTime);
      const timeDisplay =
        startTimeFormatted && endTimeFormatted
          ? `${startTimeFormatted} - ${endTimeFormatted} WIB`
          : res.session || timeSlot;

      const uiApt: Appointment = {
        id: res.id,
        booking_code: res.id.slice(0, 8).toUpperCase(),
        patient_name: res.patientName || currentPatient?.fullName || 'Pasien',
        patient_email: '',
        patient_avatar: '',
        doctor_name: res.doctorName || '',
        doctor_specialty: res.doctorSpecialty || '',
        poliklinik_name: res.poliklinikName || '',
        room_name: res.roomName || '',
        room_location: res.roomLocation || '',
        scheduled_start_time: startTimeFormatted || undefined,
        scheduled_end_time: endTimeFormatted || undefined,
        date: res.appointmentDate || dateStr,
        time: timeDisplay,
        complaint: res.complaint || complaint,
        status: 'Sudah Buat Janji',
        visit_type: res.visitType || '',
        service: res.layananName || selectedService?.name || '',
        created_at: res.createdAt || new Date().toISOString(),
        queue_number: res.queueNumber || '-'
      };

      setCreatedAppointment(uiApt);
      setIsQueueSuccessOpen(true);

      // Notify parent view
      onSubmit({
        service: uiApt.service || '',
        complaint: uiApt.complaint,
        visitType: visitType as any,
        doctor: uiApt.doctor_name,
        dateStr: uiApt.date,
        timeSlot: uiApt.time
      });

      toast.success('Janji temu berhasil dibuat beserta tiket antrean resmi');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membuat janji temu';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step,
    setStep,
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    isLoadingCatalog,
    selectedService,
    activeCategoryList,
    activeCategoryServices,
    serviceBentoItems,
    dateStr,
    setDateStr,
    timeSlot,
    setTimeSlot,
    selectedSessionId,
    setSelectedSessionId,
    visitType,
    setVisitType,
    complaint,
    setComplaint,
    isVisitTypeOpen,
    setIsVisitTypeOpen,
    visitTypeOptions,
    patients,
    selectedPatientId,
    setSelectedPatientId,
    selectedPatient,
    isLoadingPatients,
    activeMedicalFlow,
    setActiveMedicalFlow,
    rescheduleStaffId,
    reschedulePoliklinikId,
    isSubmitting,
    isQueueSuccessOpen,
    setIsQueueSuccessOpen,
    createdAppointment,
    visitTypeDropdownRef,
    stepContainerRef,
    handleSelectServiceItem,
    handlePatientCreated,
    handleFinalSubmit
  };
}
