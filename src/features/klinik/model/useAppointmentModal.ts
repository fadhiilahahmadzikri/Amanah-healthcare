'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import gsap from 'gsap';
import { toast } from 'sonner';
import type { ServiceCardItem } from '@/features/public-site/pages/services/types';
import {
  patientAffiliationService,
  type PatientAffiliationProfile,
  type PatientRelationshipType,
  type BackendAppointmentItem,
  type BookingServiceContextResponse
} from '@/features/data-pasien/api/patient-affiliation-service';
import {
  catalogService,
  type ServiceCatalogItem,
  type ServiceCategoryCatalog
} from '../api/catalog.service';
import { getServiceImage } from '../constants/appointment-reservation-services';
import { mapBackendAppointmentToUi } from '../utils/booking-appointment-mapper';
import { formRequirementGuard } from './form-requirement-guard';
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
  const [step, setStep] = useState<BookingModalStep>('category');
  const [categories, setCategories] = useState<ServiceCategoryCatalog[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isLoadingCatalog, setIsLoadingCatalog] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<ServiceCatalogItem | null>(null);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().slice(0, 10);

  const [dateStr, setDateStr] = useState<string>(defaultDateStr);
  const [timeSlot, setTimeSlot] = useState<string>('PAGI');
  const [visitType, setVisitType] = useState<'Pemeriksaan Baru' | 'Kontrol Ulang'>(
    'Pemeriksaan Baru'
  );
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

  const [activeMedicalFlow, setActiveMedicalFlow] = useState<'pregnancy' | 'immunization' | null>(
    null
  );
  const [isResolvingMedicalFlow, setIsResolvingMedicalFlow] = useState(false);

  useEffect(() => {
    if (selectedService?.id && selectedPatientId) {
      void formRequirementGuard.prefetch(selectedService.id, selectedPatientId);
    }
  }, [selectedService?.id, selectedPatientId]);

  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [rescheduleStaffId, setRescheduleStaffId] = useState<string>('');
  const [reschedulePoliklinikId, setReschedulePoliklinikId] = useState<string>('');
  const [rescheduleStaffIdReady, setRescheduleStaffIdReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQueueSuccessOpen, setIsQueueSuccessOpen] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  const visitTypeDropdownRef = useRef<HTMLDivElement>(null);
  const stepContainerRef = useRef<HTMLDivElement>(null);
  const prevIsOpenRef = useRef(false);

  const visitTypeOptions = ['Pemeriksaan Baru', 'Kontrol Ulang'] as const;

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
      if (mode === 'edit' && initialAppointment) {
        setStep('date');
        setDateStr(initialAppointment.date || defaultDateStr);
        setComplaint(initialAppointment.complaint || '');
        setTimeSlot(initialAppointment.session || 'PAGI');

        const initialDoctorId = initialAppointment.staff_id || initialAppointment.doctor_id || '';
        const initialPoliId = initialAppointment.poliklinik_id || '';
        setReschedulePoliklinikId(initialPoliId);
        setRescheduleStaffIdReady(false);

        if (initialDoctorId) {
          setRescheduleStaffId(initialDoctorId);
          setRescheduleStaffIdReady(true);
        }

        if (initialAppointment.id) {
          patientAffiliationService.getRescheduleOptions(initialAppointment.id).then((options) => {
            if (options?.doctor?.id) {
              setRescheduleStaffId(options.doctor.id);
              setRescheduleStaffIdReady(true);
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
        setRescheduleStaffIdReady(true);
      }
      loadPatients();
    } else if (!isOpen && wasOpen) {
      setSelectedService(null);
      setComplaint('');
      setActiveMedicalFlow(null);
      formRequirementGuard.clearActiveRequirement();
      setIsQueueSuccessOpen(false);
      setCreatedAppointment(null);
      setRescheduleStaffId('');
      setReschedulePoliklinikId('');
      setRescheduleStaffIdReady(false);
    }
  }, [isOpen, mode, initialAppointment, defaultDateStr, loadPatients]);

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
      icon: c.code.includes('kia') || c.code.includes('midwifery') ? 'kia' : 'general',
      description:
        c.description ||
        (c.code.includes('kia')
          ? 'Pemeriksaan kehamilan, persalinan, nifas, KB, dan imunisasi anak.'
          : 'Pemeriksaan kesehatan umum, cek laboratorium, dan konsultasi dokter.'),
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
        setStep('patient');
      } else {
        setStep('patient_new');
      }
    } catch (err) {
      console.error('Failed to resolve booking context:', err);
      if (patients.length === 0) {
        setStep('patient_new');
      } else {
        setStep('patient');
      }
    } finally {
      setIsLoadingBookingContext(false);
    }
  };

  const handleAddNewPatient = useCallback(() => {
    setSelectedPatientId('');
    setSelectedRelationship('');
    setStep('patient_new');
  }, []);

  const handleRelationshipSubmitForMedicalFlow = useCallback(
    async (relationship: PatientRelationshipType) => {
      setSelectedRelationship(relationship);
      const currentFlow =
        bookingContext?.formType ||
        (selectedService?.medicalFlow === 'pregnancy'
          ? 'pregnancy'
          : selectedService?.medicalFlow === 'immunization'
            ? 'immunization'
            : null);

      if (currentFlow === 'pregnancy' || currentFlow === 'immunization') {
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

    const currentFormType =
      bookingContext?.formType ||
      (selectedService?.medicalFlow === 'pregnancy'
        ? 'pregnancy'
        : selectedService?.medicalFlow === 'immunization'
          ? 'immunization'
          : 'regular');

    if (currentFormType === 'pregnancy' || currentFormType === 'immunization') {
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
    if (
      selectedService?.medicalFlow === 'pregnancy' ||
      selectedService?.medicalFlow === 'immunization'
    ) {
      const targetFlow = selectedService.medicalFlow;
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

  const handleFinalSubmit = async () => {
    const isEdit = mode === 'edit' && Boolean(initialAppointment?.id);
    const patientIdToUse = selectedPatientId || (patients[0] ? patients[0].id : '');

    if (!isEdit && !patientIdToUse) {
      toast.error('Silakan tentukan data pasien terlebih dahulu');
      setStep('patient_new');
      return;
    }

    try {
      setIsSubmitting(true);
      const res: BackendAppointmentItem = isEdit
        ? await patientAffiliationService.rescheduleAppointment(initialAppointment!.id, {
            targetDate: dateStr,
            targetSessionId: selectedSessionId || undefined,
            targetSession: timeSlot,
            reason: complaint.trim() || 'Penjadwalan ulang sesi periksa'
          })
        : await patientAffiliationService.createAppointment({
            patientId: patientIdToUse,
            poliklinikId: selectedService?.poliklinikId || '',
            layananId: selectedService?.id || '',
            appointmentDate: dateStr,
            session: timeSlot,
            visitType,
            complaint: complaint.trim() || 'Konsultasi dan pemeriksaan kesehatan'
          });

      const currentPatient = patients.find((p) => p.id === patientIdToUse);
      const uiApt = mapBackendAppointmentToUi({
        res,
        currentPatient,
        initialAppointment,
        dateStr,
        complaint,
        timeSlot,
        selectedService
      });

      setCreatedAppointment(uiApt);
      setIsQueueSuccessOpen(true);

      onSubmit(
        {
          service: uiApt.service || '',
          complaint: uiApt.complaint,
          visitType: visitType as any,
          doctor: uiApt.doctor_name || '',
          dateStr: uiApt.date,
          timeSlot: uiApt.time
        },
        isEdit ? initialAppointment!.id : undefined
      );

      toast.success(
        isEdit
          ? 'Jadwal janji temu berhasil di-reschedule'
          : 'Janji temu berhasil dibuat beserta tiket antrean resmi'
      );
    } catch (err: unknown) {
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
    timeSlot,
    setTimeSlot,
    selectedSessionId,
    setSelectedSessionId,
    visitType, setVisitType, complaint, setComplaint,
    isVisitTypeOpen, setIsVisitTypeOpen, visitTypeOptions,
    patients, selectedPatientId, setSelectedPatientId, selectedPatient,
    selectedRelationship, setSelectedRelationship,
    isLoadingPatients, bookingContext, isLoadingBookingContext,
    activeMedicalFlow, setActiveMedicalFlow, isResolvingMedicalFlow,
    rescheduleStaffId, reschedulePoliklinikId, rescheduleStaffIdReady,
    isSubmitting, isQueueSuccessOpen, setIsQueueSuccessOpen,
    createdAppointment, visitTypeDropdownRef, stepContainerRef,
    handleSelectServiceItem, handlePatientCreated, handleAddNewPatient,
    handleRelationshipSubmitForMedicalFlow, handlePatientContinue, handleFinalSubmit
  };
}

export default useAppointmentModal;
