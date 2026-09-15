'use client';

import { useEffect, useMemo, useState } from 'react';
import type {
  Appointment,
  AppointmentFormData,
  Doctor,
  MedicalAppointmentFlow,
  QueueItem
} from '../api/types';
import {
  createAppointmentRecordWithQueue,
  getDoctors,
  getDoctorsByService,
  loadStoredAppointments
} from '../api/service';
import {
  APPOINTMENT_RESERVATION_SERVICES,
  getReservationDoctorServiceName,
  getReservationMedicalFlow,
  getReservationServiceByTitle,
  getReservationServicesByCategory,
  type AppointmentReservationService,
  type AppointmentServiceCategoryId
} from '../constants/appointment-reservation-services';
import type { ServiceCardItem } from '@/features/public-site/pages/services/types';

export type ReservationEntryStep = 'category' | 'service' | 'form';

export interface UseAppointmentReservationOptions {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialAppointment?: Appointment | null;
  onClose: () => void;
  onSubmit: (formData: AppointmentFormData, appointmentId?: string) => void;
}

export interface UseAppointmentReservationResult {
  reservationEntryStep: ReservationEntryStep;
  selectedServiceCategory: AppointmentServiceCategoryId | null;
  selectedReservationServiceId: string | null;
  selectedReservationService?: AppointmentReservationService;
  activeMedicalFlow: MedicalAppointmentFlow | null;
  currentStep: number;
  formTotalSteps: number;
  totalSteps: number;
  displayStep: number;
  formData: AppointmentFormData;
  allDoctors: Doctor[];
  availableDoctorsForService: Doctor[];
  serviceSelectionItems: ServiceCardItem[];
  isProcessing: boolean;
  isQueueSuccessOpen: boolean;
  createdAppointment: Appointment | null;
  createdQueueItem: QueueItem | null;
  isStepValid: boolean;
  primaryActionLabel: string;
  isServiceSelectionStep: boolean;
  modalMaxWidth: string;
  actions: {
    selectCategory: (categoryId: AppointmentServiceCategoryId) => void;
    selectService: (service: AppointmentReservationService) => void;
    selectServiceItem: (item: ServiceCardItem) => void;
    setField: <K extends keyof AppointmentFormData>(
      field: K,
      value: AppointmentFormData[K]
    ) => void;
    nextStep: () => void;
    prevStep: () => void;
    confirmAppointment: () => void;
    closeQueueSuccess: () => void;
    closeMedicalFlow: () => void;
    setReservationEntryStep: (step: ReservationEntryStep) => void;
    setCurrentStep: (step: number) => void;
  };
}

export function useAppointmentReservation({
  isOpen,
  mode,
  initialAppointment,
  onClose,
  onSubmit
}: UseAppointmentReservationOptions): UseAppointmentReservationResult {
  const [reservationEntryStep, setReservationEntryStep] = useState<ReservationEntryStep>('form');
  const [selectedServiceCategory, setSelectedServiceCategory] =
    useState<AppointmentServiceCategoryId | null>(null);
  const [selectedReservationServiceId, setSelectedReservationServiceId] = useState<string | null>(
    null
  );
  const [activeMedicalFlow, setActiveMedicalFlow] = useState<MedicalAppointmentFlow | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const formTotalSteps = 4;

  const [isProcessing, setIsProcessing] = useState(false);
  const [isQueueSuccessOpen, setIsQueueSuccessOpen] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);
  const [createdQueueItem, setCreatedQueueItem] = useState<QueueItem | null>(null);

  const [formData, setFormData] = useState<AppointmentFormData>({
    service: '',
    complaint: '',
    visitType: 'Pemeriksaan Baru',
    doctor: '',
    dateStr: '',
    timeSlot: ''
  });

  const allDoctors = useMemo(() => getDoctors(), []);

  const selectedReservationService = useMemo(() => {
    if (selectedReservationServiceId) {
      return APPOINTMENT_RESERVATION_SERVICES.find(
        (service) => service.id === selectedReservationServiceId
      );
    }
    return getReservationServiceByTitle(formData.service);
  }, [selectedReservationServiceId, formData.service]);

  const totalSteps = mode === 'create' ? 6 : formTotalSteps;

  const availableDoctorsForService = useMemo(() => {
    const doctorServiceName = selectedReservationService
      ? getReservationDoctorServiceName(selectedReservationService)
      : formData.service;

    return getDoctorsByService(doctorServiceName);
  }, [formData.service, selectedReservationService]);

  const serviceSelectionItems = useMemo<ServiceCardItem[]>(() => {
    if (!selectedServiceCategory) {
      return [];
    }

    return getReservationServicesByCategory(selectedServiceCategory).map((service) => ({
      id: service.id,
      title: service.title,
      description: '',
      image: service.image,
      colSpanClass: 'col-span-12 sm:col-span-6 md:col-span-6',
      heightClass: 'min-h-[118px] sm:min-h-[132px]'
    }));
  }, [selectedServiceCategory]);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialAppointment) {
        setReservationEntryStep('form');
        setSelectedServiceCategory(null);
        setSelectedReservationServiceId(null);
        setActiveMedicalFlow(null);
        setFormData({
          service: initialAppointment.service || '',
          complaint: initialAppointment.complaint || '',
          visitType:
            initialAppointment.visit_type === 'Kontrol Ulang'
              ? 'Kontrol Ulang'
              : 'Pemeriksaan Baru',
          doctor: initialAppointment.doctor_name,
          dateStr: initialAppointment.date,
          timeSlot: initialAppointment.time
        });
        setCurrentStep(2);
      } else {
        setReservationEntryStep('category');
        setSelectedServiceCategory(null);
        setSelectedReservationServiceId(null);
        setActiveMedicalFlow(null);
        setFormData({
          service: '',
          complaint: '',
          visitType: 'Pemeriksaan Baru',
          doctor: allDoctors[0]?.name || '',
          dateStr: '',
          timeSlot: ''
        });
        setCurrentStep(1);
      }
      setIsProcessing(false);
      setIsQueueSuccessOpen(false);
      setCreatedAppointment(null);
      setCreatedQueueItem(null);
    }
  }, [isOpen, mode, initialAppointment, allDoctors]);

  useEffect(() => {
    if (availableDoctorsForService.length > 0) {
      const currentDocExists = availableDoctorsForService.some(
        (d) => d.name.toLowerCase() === formData.doctor.toLowerCase()
      );
      if (!currentDocExists && availableDoctorsForService[0]) {
        setFormData((prev) => ({
          ...prev,
          doctor: availableDoctorsForService[0].name
        }));
      }
    }
  }, [formData.service, availableDoctorsForService, formData.doctor]);

  const handleCategorySelect = (categoryId: AppointmentServiceCategoryId) => {
    setSelectedServiceCategory(categoryId);
    setSelectedReservationServiceId(null);
    setReservationEntryStep('service');
  };

  const handleServiceSelect = (service: AppointmentReservationService) => {
    const medicalFlow = getReservationMedicalFlow(service);

    if (medicalFlow) {
      setSelectedReservationServiceId(service.id);
      setActiveMedicalFlow(medicalFlow);
      return;
    }

    const doctorsForService = getDoctorsByService(getReservationDoctorServiceName(service));

    setSelectedReservationServiceId(service.id);
    setFormData((prev) => ({
      ...prev,
      service: service.title,
      doctor: doctorsForService[0]?.name || allDoctors[0]?.name || '',
      dateStr: '',
      timeSlot: ''
    }));
    setCurrentStep(1);
    setReservationEntryStep('form');
  };

  const handleServiceItemSelect = (item: ServiceCardItem) => {
    const service = getReservationServicesByCategory(selectedServiceCategory || 'general').find(
      (currentService) => currentService.id === item.id
    );

    if (service) {
      handleServiceSelect(service);
    }
  };

  const setField = <K extends keyof AppointmentFormData>(
    field: K,
    value: AppointmentFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirmAppointment = () => {
    if (mode === 'edit' && initialAppointment) {
      onSubmit(formData, initialAppointment.id);
      onClose();
      return;
    }

    setIsProcessing(true);
    setIsQueueSuccessOpen(true);

    const existing = loadStoredAppointments();
    const result = createAppointmentRecordWithQueue(formData, existing);

    setCreatedAppointment(result.appointment);
    setCreatedQueueItem(result.queueItem);

    onSubmit(formData);

    setTimeout(() => {
      setIsProcessing(false);
    }, 1400);
  };

  const nextStep = () => {
    if (currentStep < formTotalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleConfirmAppointment();
    }
  };

  const prevStep = () => {
    if (mode === 'create' && reservationEntryStep === 'form' && currentStep === 1) {
      setReservationEntryStep('service');
      return;
    }

    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const isCurrentStepValid = useMemo(() => {
    switch (currentStep) {
      case 1:
        return !!formData.service && formData.complaint.trim().length >= 3;
      case 2:
        return !!formData.dateStr;
      case 3:
        return !!formData.timeSlot;
      case 4:
        return true;
      default:
        return true;
    }
  }, [currentStep, formData.service, formData.complaint, formData.dateStr, formData.timeSlot]);

  const displayStep =
    mode === 'create'
      ? reservationEntryStep === 'category'
        ? 1
        : reservationEntryStep === 'service'
          ? 2
          : currentStep + 2
      : currentStep;

  const isServiceSelectionStep =
    mode === 'create' &&
    (reservationEntryStep === 'category' || reservationEntryStep === 'service');

  const modalMaxWidth = isServiceSelectionStep ? 'max-w-[720px]' : 'max-w-[560px]';

  const primaryActionLabel =
    currentStep === formTotalSteps && reservationEntryStep === 'form'
      ? mode === 'edit'
        ? 'Simpan Perubahan'
        : 'Konfirmasi Janji Temu'
      : 'Lanjutkan';

  return {
    reservationEntryStep,
    selectedServiceCategory,
    selectedReservationServiceId,
    selectedReservationService,
    activeMedicalFlow,
    currentStep,
    formTotalSteps,
    totalSteps,
    displayStep,
    formData,
    allDoctors,
    availableDoctorsForService,
    serviceSelectionItems,
    isProcessing,
    isQueueSuccessOpen,
    createdAppointment,
    createdQueueItem,
    isStepValid: isCurrentStepValid,
    primaryActionLabel,
    isServiceSelectionStep,
    modalMaxWidth,
    actions: {
      selectCategory: handleCategorySelect,
      selectService: handleServiceSelect,
      selectServiceItem: handleServiceItemSelect,
      setField,
      nextStep,
      prevStep,
      confirmAppointment: handleConfirmAppointment,
      closeQueueSuccess: () => {
        setIsQueueSuccessOpen(false);
        onClose();
      },
      closeMedicalFlow: () => {
        setActiveMedicalFlow(null);
        onClose();
      },
      setReservationEntryStep,
      setCurrentStep
    }
  };
}
