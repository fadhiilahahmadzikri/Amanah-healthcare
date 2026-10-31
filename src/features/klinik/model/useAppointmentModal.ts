'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import gsap from 'gsap';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { AppError } from '@/core/errors/app-error';
import type { ServiceCardItem } from '@/features/public-site/pages/services/types';
import {
  patientAffiliationService,
  type PatientAffiliationProfile,
  type PatientRelationshipType,
  type BackendAppointmentItem,
  type BookingServiceContextResponse,
  type ActiveTicketConflictInfo
} from '@/features/data-pasien/api/patient-affiliation-service';
import {
  catalogService,
  type ServiceCatalogItem,
  type ServiceCategoryCatalog
} from '../api/catalog.service';
import { mapBackendAppointmentToUi } from '../utils/booking-appointment-mapper';
import { formRequirementGuard } from './form-requirement-guard';
import { requestImplicitWebPushRegistration } from '@/features/notifications';
import { getClinicTodayDateString } from '@/lib/date-format';
import { VISIT_TYPE, type CanonicalVisitType } from '@/constants/visit-type.constants';
import type { Appointment, AppointmentFormData } from '../api/types';

export type BookingModalStep =
  | 'category'
  | 'service'
  | 'select_profile'
  | 'create_profile'
  | 'date'
  | 'session'
  | 'visit_type'
  | 'complaint'
  | 'confirmation'
  | 'ticket_conflict';

export interface UseAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: AppointmentFormData, appointmentId?: string) => void;
}

export function useAppointmentModal({
  isOpen,
  onClose: _onClose,
  onSubmit
}: UseAppointmentModalProps) {
  const isMobile = useIsMobile();
  const [step, setStep] = useState<BookingModalStep>('category');
  const [categories, setCategories] = useState<ServiceCategoryCatalog[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isLoadingCatalog, setIsLoadingCatalog] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<ServiceCatalogItem | null>(null);

  const defaultDateStr = getClinicTodayDateString();

  const [dateStr, setDateStr] = useState<string>(defaultDateStr);
  const [session, setSession] = useState<string>('');
  const [visitType, setVisitType] = useState<CanonicalVisitType>(VISIT_TYPE.NEW_VISIT);
  const [complaint, setComplaint] = useState<string>('');
  const [isVisitTypeOpen, setIsVisitTypeOpen] = useState(false);

  const [patients, setPatients] = useState<PatientAffiliationProfile[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedRelationship, setSelectedRelationship] = useState<
    PatientRelationshipType | string
  >('');
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [bookingContext, setBookingContext] = useState<BookingServiceContextResponse | null>(null);
  const [isLoadingBookingContext, setIsLoadingBookingContext] = useState(false);

  const [activeMedicalFlow, setActiveMedicalFlow] = useState<string | null>(null);
  const [isResolvingMedicalFlow, setIsResolvingMedicalFlow] = useState(false);

  useEffect(() => {
    if (selectedService?.id && selectedPatientId) {
      void formRequirementGuard.prefetch(selectedService.id, selectedPatientId);
    }
  }, [selectedService?.id, selectedPatientId]);

  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQueueSuccessOpen, setIsQueueSuccessOpen] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  const [activeTicketConflict, setActiveTicketConflict] = useState<ActiveTicketConflictInfo | null>(
    null
  );
  const [isCheckingActiveTicket, setIsCheckingActiveTicket] = useState(false);

  useEffect(() => {
    const patientIdToUse = selectedPatientId || (patients[0] ? patients[0].id : '');

    if (!patientIdToUse || !dateStr) {
      setActiveTicketConflict(null);
      return;
    }

    let isSubscribed = true;
    setIsCheckingActiveTicket(true);
    patientAffiliationService
      .checkActiveTicket({
        patientId: patientIdToUse,
        categoryId: selectedCategoryId,
        date: dateStr
      })
      .then((res) => {
        if (isSubscribed) {
          setActiveTicketConflict(res.hasActiveTicket ? res.activeTicket : null);
        }
      })
      .catch(() => {
        if (isSubscribed) setActiveTicketConflict(null);
      })
      .finally(() => {
        if (isSubscribed) setIsCheckingActiveTicket(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [selectedPatientId, patients, selectedCategoryId, dateStr]);

  const visitTypeDropdownRef = useRef<HTMLDivElement>(null);
  const stepContainerRef = useRef<HTMLDivElement>(null);
  const prevIsOpenRef = useRef(false);

  const visitTypeOptions = [VISIT_TYPE.NEW_VISIT, VISIT_TYPE.FOLLOW_UP] as const;

  const loadCatalog = useCallback(async () => {
    try {
      setIsLoadingCatalog(true);
      const data = await catalogService.getServiceCatalog();
      if (Array.isArray(data) && data.length > 0) {
        setCategories(data);
        setSelectedCategoryId((prev) => prev || data[0].id);
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

  const loadPatients = useCallback(async (serviceId?: string) => {
    try {
      setIsLoadingPatients(true);
      if (serviceId) {
        setIsLoadingBookingContext(true);
        const ctx = await patientAffiliationService.getBookingContext(serviceId);
        setBookingContext(ctx);
        if (ctx?.patients) {
          setPatients(ctx.patients as unknown as PatientAffiliationProfile[]);
          return;
        }
      }
      const data = await patientAffiliationService.getMyAffiliations();
      setPatients(data);
    } catch (err) {
      console.error('Failed to load patient affiliations:', err);
    } finally {
      setIsLoadingPatients(false);
      setIsLoadingBookingContext(false);
    }
  }, []);

  useEffect(() => {
    const wasOpen = prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;

    if (isOpen && !wasOpen) {
      setStep('category');
      setSelectedService(null);
      setComplaint('');
      setDateStr(defaultDateStr);
      setSession('');
      loadPatients();
    } else if (!isOpen && wasOpen) {
      setSelectedService(null);
      setComplaint('');
      setActiveMedicalFlow(null);
      formRequirementGuard.clearActiveRequirement();
      setIsQueueSuccessOpen(false);
      setCreatedAppointment(null);
    }
  }, [isOpen, defaultDateStr, loadPatients]);

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

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId) || null,
    [patients, selectedPatientId]
  );

  const activeCategoryList = useMemo(() => {
    return categories.map((c) => ({
      id: c.id,
      code: c.code,
      title: c.name,
      icon: c.iconName || 'folder',
      description: c.description || '',
      servicesCount: c.services?.length || 0,
      services: c.services || []
    }));
  }, [categories]);

  const activeCategoryServices = useMemo(() => {
    const foundCat =
      categories.find((c) => c.id === selectedCategoryId || c.code === selectedCategoryId) ||
      categories[0];
    if (foundCat && Array.isArray(foundCat.services)) {
      return foundCat.services;
    }
    return [];
  }, [categories, selectedCategoryId]);

  const serviceBentoItems = useMemo<ServiceCardItem[]>(() => {
    return activeCategoryServices.map((srv) => {
      return {
        id: srv.id,
        title: srv.name,
        description: srv.description || '',
        iconName: srv.iconName || 'stethoscope',
        colSpanClass: 'col-span-12 sm:col-span-6 md:col-span-6',
        heightClass: 'min-h-[118px] sm:min-h-[132px]'
      };
    });
  }, [activeCategoryServices]);

  const handleSelectServiceItem = async (item: ServiceCardItem) => {
    const srv = activeCategoryServices.find((s) => s.id === item.id);
    if (!srv) return;

    setSelectedService(srv);
    setIsLoadingBookingContext(true);

    try {
      const ctx = await patientAffiliationService.getBookingContext(srv.id);
      setBookingContext(ctx);

      const relevantPatients = ctx?.patients ?? [];
      setPatients(relevantPatients as unknown as PatientAffiliationProfile[]);

      if (relevantPatients.length > 0) {
        setSelectedPatientId('');
        setStep('select_profile');
      } else {
        setSelectedPatientId('');
        setStep('create_profile');
      }
    } catch (err) {
      console.error('Failed to resolve booking context:', err);
      if (patients.length === 0) {
        setStep('create_profile');
      } else {
        setStep('select_profile');
      }
    } finally {
      setIsLoadingBookingContext(false);
    }
  };

  const handleAddNewPatient = useCallback(() => {
    setSelectedPatientId('');
    setSelectedRelationship('');
    setStep('create_profile');
  }, []);

  const handleRelationshipSubmitForMedicalFlow = useCallback(
    async (relationship: PatientRelationshipType) => {
      setSelectedRelationship(relationship);
      const currentFlow = bookingContext?.formType || null;

      if (currentFlow && currentFlow !== 'regular') {
        if (selectedService?.id) {
          setIsResolvingMedicalFlow(true);
          try {
            await formRequirementGuard.resolveAndLock(selectedService.id, selectedPatientId);
          } finally {
            setIsResolvingMedicalFlow(false);
          }
        }
        setActiveMedicalFlow(currentFlow);
      }
    },
    [bookingContext, selectedService, selectedPatientId]
  );

  const handlePatientContinue = async () => {
    const patientToUse = patients.find((p) => p.id === selectedPatientId) || null;
    if (!patientToUse) {
      toast.error('Pilih pasien yang akan berobat');
      return;
    }

    const currentFormType = bookingContext?.formType || 'regular';

    if (currentFormType !== 'regular') {
      if (selectedService?.id) {
        setIsResolvingMedicalFlow(true);
        try {
          await formRequirementGuard.resolveAndLock(selectedService.id, patientToUse.id);
        } finally {
          setIsResolvingMedicalFlow(false);
        }
      }
      setActiveMedicalFlow(currentFormType);
      return;
    }

    setStep('date');
  };

  const handlePatientCreated = async (newPatient: PatientAffiliationProfile) => {
    setPatients((prev) => [newPatient, ...prev]);
    setSelectedPatientId(newPatient.id);
    const targetFlow = bookingContext?.formType || null;
    if (targetFlow && targetFlow !== 'regular') {
      if (selectedService?.id) {
        setIsResolvingMedicalFlow(true);
        try {
          await formRequirementGuard.resolveAndLock(selectedService.id, newPatient.id);
        } finally {
          setIsResolvingMedicalFlow(false);
        }
      }
      setActiveMedicalFlow(targetFlow);
      return;
    }
    setStep('date');
    toast.success('Data profil pasien berhasil didaftarkan');
  };

  const handlePatientUpdated = useCallback((updatedPatient: PatientAffiliationProfile) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === updatedPatient.id ? { ...p, ...updatedPatient } : p))
    );
  }, []);

  const handleSessionContinue = useCallback(() => {
    if (activeTicketConflict) {
      toast.info(
        `Pasien sudah memiliki tiket antrean aktif (${activeTicketConflict.queueNumber}) untuk tanggal ini.`
      );
      setStep('ticket_conflict');
      return;
    }
    setStep('visit_type');
  }, [activeTicketConflict]);

  const handleFinalSubmit = async () => {
    const patientIdToUse = selectedPatientId || (patients[0] ? patients[0].id : '');

    if (!patientIdToUse) {
      toast.error('Silakan tentukan data pasien terlebih dahulu');
      setStep('create_profile');
      return;
    }

    if (activeTicketConflict) {
      toast.warning(
        `Pasien sudah memiliki tiket antrean aktif (${activeTicketConflict.queueNumber}) untuk tanggal ini.`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const res: BackendAppointmentItem = await patientAffiliationService.createAppointment({
        patientId: patientIdToUse,
        poliklinikId: selectedService?.poliklinikId || '',
        layananId: selectedService?.id || '',
        appointmentDate: dateStr,
        session: session,
        visitType,
        complaint: complaint.trim() || 'Konsultasi dan pemeriksaan kesehatan'
      });

      void requestImplicitWebPushRegistration();

      const currentPatient = patients.find((p) => p.id === patientIdToUse);
      const uiApt = mapBackendAppointmentToUi({
        res,
        currentPatient,
        dateStr,
        complaint,
        selectedService
      });

      setCreatedAppointment(uiApt);
      setIsQueueSuccessOpen(true);

      onSubmit({
        service: uiApt.service || '',
        complaint: uiApt.complaint,
        visitType: visitType as any,
        doctor: uiApt.doctor_name || '',
        dateStr: uiApt.date,
        session: session
      });

      toast.success('Janji temu berhasil dibuat beserta tiket antrean resmi');
    } catch (err: unknown) {
      if (err instanceof AppError && err.status === 409) {
        const activeTicket = (
          err.problemDetails as { activeTicket?: ActiveTicketConflictInfo } | undefined
        )?.activeTicket;
        if (activeTicket) {
          setActiveTicketConflict(activeTicket);
          toast.warning(
            `Pasien sudah memiliki tiket antrean aktif (${activeTicket.queueNumber}) untuk kategori ini pada tanggal tersebut.`
          );
          return;
        }
      }
      const msg = err instanceof Error ? err.message : 'Gagal memproses janji temu';
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
    session,
    setSession,
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
    selectedRelationship,
    setSelectedRelationship,
    isLoadingPatients,
    bookingContext,
    isLoadingBookingContext,
    activeMedicalFlow,
    setActiveMedicalFlow,
    isResolvingMedicalFlow,
    isSubmitting,
    isQueueSuccessOpen,
    setIsQueueSuccessOpen,
    createdAppointment,
    activeTicketConflict,
    isCheckingActiveTicket,
    visitTypeDropdownRef,
    stepContainerRef,
    isMobile,
    handleSelectServiceItem,
    handlePatientCreated,
    handlePatientUpdated,
    handleAddNewPatient,
    handleRelationshipSubmitForMedicalFlow,
    handlePatientContinue,
    handleSessionContinue,
    handleFinalSubmit
  };
}
