'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Icons } from '@/components/icons';
import gsap from 'gsap';
import {
  Appointment,
  QueueItem,
  AppointmentFormData,
  type MedicalAppointmentFlow
} from '../api/types';
import type { ServiceCardItem } from '@/features/public-site/pages/services/types';
import { ServiceBentoGrid } from '@/features/public-site/pages/services/components/organisms/ServiceBentoGrid';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StepperProgress } from './stepper-progress';
import { AppointmentCalendarDayPicker } from './appointment-calendar-day-picker';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { QueueSuccessModal } from './queue-success-modal';
import {
  getDoctors,
  getDoctorsByService,
  createAppointmentRecordWithQueue,
  loadStoredAppointments
} from '../api/service';
import { AMANAH_SERVICES } from '../constants/services';
import {
  APPOINTMENT_RESERVATION_SERVICES,
  APPOINTMENT_SERVICE_CATEGORIES,
  getReservationDoctorServiceName,
  getReservationMedicalFlow,
  getReservationServiceByTitle,
  getReservationServicesByCategory,
  type AppointmentReservationService,
  type AppointmentServiceCategoryId
} from '../constants/appointment-reservation-services';
import { MedicalAppointmentModal } from './medical-appointment-modal';
import { cn } from '@/lib/utils';

type ReservationEntryStep = 'category' | 'service' | 'form';

export const CONSULTATION_SESSIONS = [
  {
    id: 'pagi',
    label: 'Sesi Pagi',
    timeRange: '08:00 - 12:00 WIB',
    value: 'Sesi Pagi (08:00 - 12:00 WIB)',
    desc: 'Kunjungan poliklinik pagi hari',
    icon: Icons.sun
  },
  {
    id: 'siang',
    label: 'Sesi Siang',
    timeRange: '13:00 - 16:00 WIB',
    value: 'Sesi Siang (13:00 - 16:00 WIB)',
    desc: 'Kunjungan poliklinik siang / sore',
    icon: Icons.clock
  },
  {
    id: 'malam',
    label: 'Sesi Malam',
    timeRange: '18:30 - 21:00 WIB',
    value: 'Sesi Malam (18:30 - 21:00 WIB)',
    desc: 'Kunjungan poliklinik malam hari',
    icon: Icons.moon
  }
];

export interface AppointmentModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialAppointment?: Appointment | null;
  onClose: () => void;
  onSubmit: (formData: AppointmentFormData, appointmentId?: string) => void;
}

export function AppointmentModal({
  isOpen,
  mode,
  initialAppointment,
  onClose,
  onSubmit
}: AppointmentModalProps) {
  const [reservationEntryStep, setReservationEntryStep] = useState<ReservationEntryStep>('form');
  const [selectedServiceCategory, setSelectedServiceCategory] =
    useState<AppointmentServiceCategoryId | null>(null);
  const [selectedReservationServiceId, setSelectedReservationServiceId] = useState<string | null>(
    null
  );
  const [activeMedicalFlow, setActiveMedicalFlow] = useState<MedicalAppointmentFlow | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const formTotalSteps = 4;
  const stepContainerRef = useRef<HTMLDivElement>(null);

  // Step 1 Dropdowns
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [isVisitTypeOpen, setIsVisitTypeOpen] = useState(false);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);
  const visitTypeDropdownRef = useRef<HTMLDivElement>(null);

  // Processing & Queue Success Modal States
  const [isProcessing, setIsProcessing] = useState(false);
  const [isQueueSuccessOpen, setIsQueueSuccessOpen] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);
  const [createdQueueItem, setCreatedQueueItem] = useState<QueueItem | null>(null);

  const [formData, setFormData] = useState<AppointmentFormData>({
    service: 'Poli Penyakit Dalam',
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

  // Doctors for the selected service (used for day availability & assignment)
  const availableDoctorsForService = useMemo(() => {
    const doctorServiceName = selectedReservationService
      ? getReservationDoctorServiceName(selectedReservationService)
      : formData.service;

    return getDoctorsByService(doctorServiceName);
  }, [formData.service, selectedReservationService]);

  const visitTypeOptions = ['Pemeriksaan Baru', 'Kontrol Ulang'];

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

  // Reset or initialize form data
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialAppointment) {
        setReservationEntryStep('form');
        setSelectedServiceCategory(null);
        setSelectedReservationServiceId(null);
        setActiveMedicalFlow(null);
        setFormData({
          service: initialAppointment.service || 'Poli Penyakit Dalam',
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
      setIsServiceOpen(false);
      setIsVisitTypeOpen(false);
      setIsProcessing(false);
      setIsQueueSuccessOpen(false);
      setCreatedAppointment(null);
      setCreatedQueueItem(null);
    }
  }, [isOpen, mode, initialAppointment, allDoctors]);

  // When service changes, ensure doctor is set to an available doctor in that service
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

  // GSAP Accordion Dropdown Transitions
  useEffect(() => {
    if (serviceDropdownRef.current) {
      if (isServiceOpen) {
        gsap.fromTo(
          serviceDropdownRef.current,
          { height: 0, opacity: 0 },
          { height: 'auto', opacity: 1, duration: 0.22, ease: 'power2.out' }
        );
        const items = serviceDropdownRef.current.querySelectorAll('.dropdown-item');
        if (items.length > 0) {
          gsap.fromTo(
            items,
            { opacity: 0, y: -6 },
            {
              opacity: 1,
              y: 0,
              duration: 0.18,
              stagger: 0.035,
              ease: 'power2.out',
              delay: 0.04
            }
          );
        }
      } else {
        gsap.to(serviceDropdownRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.16,
          ease: 'power2.in'
        });
      }
    }
  }, [isServiceOpen]);

  useEffect(() => {
    if (visitTypeDropdownRef.current) {
      if (isVisitTypeOpen) {
        gsap.fromTo(
          visitTypeDropdownRef.current,
          { height: 0, opacity: 0 },
          { height: 'auto', opacity: 1, duration: 0.22, ease: 'power2.out' }
        );
        const items = visitTypeDropdownRef.current.querySelectorAll('.dropdown-item');
        if (items.length > 0) {
          gsap.fromTo(
            items,
            { opacity: 0, y: -6 },
            {
              opacity: 1,
              y: 0,
              duration: 0.18,
              stagger: 0.035,
              ease: 'power2.out',
              delay: 0.04
            }
          );
        }
      } else {
        gsap.to(visitTypeDropdownRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.16,
          ease: 'power2.in'
        });
      }
    }
  }, [isVisitTypeOpen]);

  // GSAP Stepper Transition between steps
  const animateContentTransition = (
    direction: 'forward' | 'backward',
    updateContent: () => void
  ) => {
    if (stepContainerRef.current) {
      const yOut = direction === 'forward' ? -10 : 10;
      const yIn = direction === 'forward' ? 10 : -10;

      gsap.to(stepContainerRef.current, {
        opacity: 0,
        y: yOut,
        duration: 0.18,
        ease: 'power2.in',
        onComplete: () => {
          updateContent();
          if (stepContainerRef.current) {
            gsap.fromTo(
              stepContainerRef.current,
              { opacity: 0, y: yIn },
              { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }
            );
          }
        }
      });
    } else {
      updateContent();
    }
  };

  const animateStepTransition = (nextStep: number, direction: 'forward' | 'backward') => {
    animateContentTransition(direction, () => setCurrentStep(nextStep));
  };

  const animateReservationEntryTransition = (
    nextStep: ReservationEntryStep,
    direction: 'forward' | 'backward'
  ) => {
    animateContentTransition(direction, () => setReservationEntryStep(nextStep));
  };

  const handleCategorySelect = (categoryId: AppointmentServiceCategoryId) => {
    setSelectedServiceCategory(categoryId);
    setSelectedReservationServiceId(null);
    animateReservationEntryTransition('service', 'forward');
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
    setIsServiceOpen(false);
    setIsVisitTypeOpen(false);
    setCurrentStep(1);
    animateReservationEntryTransition('form', 'forward');
  };

  const handleServiceItemSelect = (item: ServiceCardItem) => {
    const service = getReservationServicesByCategory(selectedServiceCategory || 'general').find(
      (currentService) => currentService.id === item.id
    );

    if (service) {
      handleServiceSelect(service);
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep < formTotalSteps) {
      animateStepTransition(currentStep + 1, 'forward');
    } else {
      // Final Step: Submit with processing animation + queue ticket modal
      handleConfirmAppointment();
    }
  };

  const handleBack = () => {
    if (mode === 'create' && reservationEntryStep === 'form' && currentStep === 1) {
      animateReservationEntryTransition('service', 'backward');
      return;
    }

    if (currentStep > 1) {
      animateStepTransition(currentStep - 1, 'backward');
    }
  };

  const handleConfirmAppointment = () => {
    if (mode === 'edit' && initialAppointment) {
      onSubmit(formData, initialAppointment.id);
      onClose();
      return;
    }

    // 1. Trigger processing state in QueueSuccessModal
    setIsProcessing(true);
    setIsQueueSuccessOpen(true);

    // 2. Generate appointment + synced queue item
    const existing = loadStoredAppointments();
    const result = createAppointmentRecordWithQueue(formData, existing);

    setCreatedAppointment(result.appointment);
    setCreatedQueueItem(result.queueItem);

    // 3. Notify parent view of newly created appointment
    onSubmit(formData);

    // 4. Transition from processing animation to final Queue Ticket + Confetti
    setTimeout(() => {
      setIsProcessing(false);
    }, 1400);
  };

  const handleMedicalFlowClose = () => {
    setActiveMedicalFlow(null);
    onClose();
  };

  const isStepValid = () => {
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
  };

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
      ? 'Simpan Janji Temu'
      : 'Lanjutkan';

  if (!isOpen) return null;

  return (
    <>
      <ModalWrapper
        isOpen={isOpen && !isQueueSuccessOpen && !activeMedicalFlow}
        onClose={onClose}
        maxWidth={modalMaxWidth}
        showCloseButton={false}
      >
        <div className='space-y-5 font-sans'>
          {/* Header: Clean Title on Left, Stepper on Right */}
          <div className='flex items-center justify-between pb-3.5 border-b border-border'>
            <div>
              <span className='text-sm font-bold text-foreground leading-none'>
                {mode === 'edit' ? 'Reschedule Konsultasi' : 'Reservasi Janji Temu Pasien'}
              </span>
            </div>

            <div className='w-28 sm:w-36'>
              <StepperProgress currentStep={displayStep} totalSteps={totalSteps} />
            </div>
          </div>

          {/* Dynamic Stepper Form Content */}
          <div ref={stepContainerRef}>
            {mode === 'create' && reservationEntryStep === 'category' && (
              <div className='flex flex-col gap-4'>
                <div>
                  <h3 className='text-base font-bold tracking-tight text-foreground'>
                    Pilih jenis layanan
                  </h3>
                  <p className='mt-0.5 text-xs leading-relaxed font-normal text-muted-foreground'>
                    Pilih kategori layanan yang ingin Anda reservasi.
                  </p>
                </div>

                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  {APPOINTMENT_SERVICE_CATEGORIES.map((category) => (
                    <Button
                      key={category.id}
                      type='button'
                      variant='outline'
                      size='lg'
                      shape='card'
                      align='left'
                      fullWidth
                      onClick={() => handleCategorySelect(category.id)}
                      className='h-24 flex-col items-start justify-between p-4'
                    >
                      <span className='text-sm font-bold text-foreground'>{category.title}</span>
                      <span className='inline-flex items-center gap-2 text-xs text-muted-foreground'>
                        Pilih layanan
                        <Icons.arrowRight className='size-3.5' />
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {mode === 'create' && reservationEntryStep === 'service' && (
              <div className='flex flex-col gap-4'>
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <h3 className='text-base font-bold tracking-tight text-foreground'>
                      Pilih layanan
                    </h3>
                    <p className='mt-0.5 text-xs leading-relaxed font-normal text-muted-foreground'>
                      {APPOINTMENT_SERVICE_CATEGORIES.find(
                        (category) => category.id === selectedServiceCategory
                      )?.title || 'Layanan'}
                    </p>
                  </div>

                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    shape='pill'
                    onClick={() => {
                      setSelectedReservationServiceId(null);
                      setActiveMedicalFlow(null);
                      animateReservationEntryTransition('category', 'backward');
                    }}
                    leadingIcon={<Icons.chevronLeft className='size-3.5' />}
                  >
                    Kembali
                  </Button>
                </div>

                <div className='max-h-[430px] overflow-y-auto pr-1'>
                  <ServiceBentoGrid
                    items={serviceSelectionItems}
                    onItemSelect={handleServiceItemSelect}
                    getItemAriaLabel={(item) => `Pilih ${item.title}`}
                    className='gap-3 sm:gap-3'
                  />
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* STEP 1: INFORMASI LAYANAN & KELUHAN PASIEN */}
            {/* =============================================================== */}
            {reservationEntryStep === 'form' && currentStep === 1 && (
              <div className='space-y-4'>
                <div>
                  <h3 className='text-base font-bold tracking-tight text-foreground'>
                    Informasi Layanan & Keluhan
                  </h3>
                  <p className='text-xs text-muted-foreground font-normal mt-0.5 leading-relaxed'>
                    Pilih poliklinik tujuan serta deskripsikan keluhan medis yang Anda rasakan.
                  </p>
                </div>

                <div className='space-y-3.5'>
                  {/* 1. Layanan Poliklinik Dropdown */}
                  {mode === 'create' && selectedReservationService ? (
                    <Card className='gap-3 py-4 shadow-xs'>
                      <CardHeader className='px-4'>
                        <CardTitle className='text-xs font-normal text-muted-foreground'>
                          Layanan dipilih
                        </CardTitle>
                        <CardAction>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            shape='pill'
                            onClick={() => animateReservationEntryTransition('service', 'backward')}
                          >
                            Ubah
                          </Button>
                        </CardAction>
                      </CardHeader>
                      <CardContent className='px-4'>
                        <div className='flex items-center gap-3'>
                          <div className='relative size-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted'>
                            <Image
                              src={selectedReservationService.image.src}
                              alt={selectedReservationService.image.alt}
                              fill
                              sizes='56px'
                              className='object-cover object-center'
                            />
                          </div>
                          <div className='min-w-0'>
                            <p className='text-sm font-bold text-foreground'>
                              {selectedReservationService.title}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              Lanjutkan dengan jenis kunjungan dan keluhan.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className='space-y-1 relative'>
                      <span className='block text-xs font-normal text-muted-foreground'>
                        Layanan Poliklinik*
                      </span>
                      <button
                        type='button'
                        aria-label='Pilih layanan poliklinik'
                        onClick={() => {
                          setIsServiceOpen(!isServiceOpen);
                          setIsVisitTypeOpen(false);
                        }}
                        className='w-full flex items-center justify-between p-3 border border-border bg-background dark:bg-slate-800/60 text-xs font-semibold text-foreground hover:border-primary/40 transition-colors cursor-pointer rounded-lg'
                      >
                        <span>{formData.service}</span>
                        <Icons.chevronDown
                          className={cn(
                            'size-4 text-muted-foreground transition-transform duration-200',
                            isServiceOpen && 'rotate-180 text-primary'
                          )}
                        />
                      </button>

                      <div
                        ref={serviceDropdownRef}
                        className='overflow-hidden border border-border bg-popover rounded-lg shadow-md mt-1 z-30'
                        style={{ height: 0, opacity: 0 }}
                      >
                        <div className='p-1 space-y-0.5 max-h-52 overflow-y-auto'>
                          {AMANAH_SERVICES.map((srv) => {
                            const isSelected = formData.service === srv.name;
                            return (
                              <button
                                key={srv.id}
                                type='button'
                                onClick={() => {
                                  setFormData((prev) => ({ ...prev, service: srv.name }));
                                  setIsServiceOpen(false);
                                }}
                                className={cn(
                                  'dropdown-item w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center justify-between border-b last:border-b-0 border-border/60 rounded-md cursor-pointer',
                                  isSelected
                                    ? 'bg-primary text-primary-foreground font-bold'
                                    : 'text-foreground hover:bg-accent'
                                )}
                              >
                                <div className='space-y-0.5 min-w-0 flex-1 pr-2'>
                                  <div className='flex items-center gap-2'>
                                    <span className='font-bold'>{srv.name}</span>
                                    <span className='text-[10px] opacity-75 px-1.5 py-0.2 rounded bg-background/30'>
                                      {srv.category}
                                    </span>
                                  </div>
                                  <p className='text-[10.5px] opacity-85 truncate'>
                                    {srv.description}
                                  </p>
                                </div>
                                {isSelected && <Icons.check className='size-3.5 shrink-0' />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. Jenis Kunjungan Dropdown */}
                  <div className='space-y-1 relative'>
                    <span className='block text-xs font-normal text-muted-foreground'>
                      Jenis Kunjungan*
                    </span>
                    <button
                      type='button'
                      aria-label='Pilih jenis kunjungan'
                      onClick={() => {
                        setIsVisitTypeOpen(!isVisitTypeOpen);
                        setIsServiceOpen(false);
                      }}
                      className='w-full flex items-center justify-between p-3 border border-border bg-background dark:bg-slate-800/60 text-xs font-semibold text-foreground hover:border-primary/40 transition-colors cursor-pointer rounded-lg'
                    >
                      <span>{formData.visitType}</span>
                      <Icons.chevronDown
                        className={cn(
                          'size-4 text-muted-foreground transition-transform duration-200',
                          isVisitTypeOpen && 'rotate-180 text-primary'
                        )}
                      />
                    </button>

                    <div
                      ref={visitTypeDropdownRef}
                      className='overflow-hidden border border-border bg-popover rounded-lg shadow-md mt-1 z-30'
                      style={{ height: 0, opacity: 0 }}
                    >
                      <div className='p-1 space-y-0.5'>
                        {visitTypeOptions.map((vt) => (
                          <button
                            key={vt}
                            type='button'
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, visitType: vt }));
                              setIsVisitTypeOpen(false);
                            }}
                            className={cn(
                              'dropdown-item w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center justify-between border-b last:border-b-0 border-border/60 rounded-md cursor-pointer',
                              formData.visitType === vt
                                ? 'bg-primary text-primary-foreground font-bold'
                                : 'text-foreground hover:bg-accent'
                            )}
                          >
                            <span>{vt}</span>
                            {formData.visitType === vt && <Icons.check className='size-3.5' />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3. Keluhan Medis Input */}
                  <div className='space-y-1'>
                    <label
                      htmlFor='complaint-input'
                      className='block text-xs font-normal text-muted-foreground'
                    >
                      Keluhan atau Catatan Medis*
                    </label>
                    <textarea
                      id='complaint-input'
                      aria-label='Keluhan atau catatan medis'
                      value={formData.complaint}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, complaint: e.target.value }))
                      }
                      rows={3}
                      placeholder='Contoh: Ruam kemerahan pada lengan kanan sejak 2 hari yang lalu...'
                      className='w-full p-3 border border-border bg-background dark:bg-slate-800/60 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary dark:focus:border-indigo-400 transition-colors resize-none rounded-lg'
                    />
                  </div>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* STEP 2: PILIH TANGGAL KUNJUNGAN */}
            {/* =============================================================== */}
            {reservationEntryStep === 'form' && currentStep === 2 && (
              <div className='space-y-3.5'>
                <div>
                  <h3 className='text-base font-bold tracking-tight text-foreground'>
                    Pilih Tanggal Kunjungan
                  </h3>
                  <p className='text-xs text-muted-foreground font-normal mt-0.5 leading-relaxed'>
                    Pilih hari kunjungan untuk{' '}
                    <strong className='text-primary dark:text-indigo-300 font-semibold'>
                      {formData.service}
                    </strong>{' '}
                    yang berstatus Buka (Tersedia).
                  </p>
                </div>

                <AppointmentCalendarDayPicker
                  doctorName={formData.doctor}
                  selectedDateStr={formData.dateStr}
                  onSelectDate={(dateStr) => {
                    setFormData((prev) => ({
                      ...prev,
                      dateStr
                    }));
                  }}
                />
              </div>
            )}

            {/* =============================================================== */}
            {/* STEP 3: PILIH SESI KONSULTASI (RADIO BUTTON PAGI / SIANG / MALAM) */}
            {/* =============================================================== */}
            {reservationEntryStep === 'form' && currentStep === 3 && (
              <div className='space-y-3.5'>
                <div>
                  <h3 className='text-base font-bold tracking-tight text-foreground'>
                    Pilih Sesi Konsultasi
                  </h3>
                  <p className='text-xs text-muted-foreground font-normal mt-0.5 leading-relaxed'>
                    Pilih sesi kedatangan Anda untuk tanggal{' '}
                    <strong className='text-primary dark:text-indigo-300 font-semibold'>
                      {formData.dateStr}
                    </strong>
                    . Jam perkiraan dan nomor antrean akan otomatis diatur oleh sistem klinik.
                  </p>
                </div>

                <RadioGroup
                  value={formData.timeSlot}
                  onValueChange={(val) => setFormData((prev) => ({ ...prev, timeSlot: val }))}
                  className='gap-2.5 pt-1'
                >
                  {CONSULTATION_SESSIONS.map((session) => {
                    const isSelected = formData.timeSlot === session.value;
                    const SessionIcon = session.icon;

                    return (
                      <label
                        key={session.id}
                        htmlFor={`session-radio-${session.id}`}
                        className={cn(
                          'flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none',
                          isSelected
                            ? 'border-2 border-primary dark:border-indigo-400 bg-primary/5 dark:bg-indigo-950/40 shadow-xs'
                            : 'border-border bg-card hover:border-primary/40'
                        )}
                      >
                        <div className='flex items-center gap-3.5 min-w-0'>
                          <div
                            className={cn(
                              'size-10 rounded-full flex items-center justify-center shrink-0 transition-colors',
                              isSelected
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            <SessionIcon className='size-5' />
                          </div>
                          <div className='min-w-0 space-y-0.5'>
                            <div className='flex items-center gap-2'>
                              <span className='text-sm font-bold text-foreground'>
                                {session.label}
                              </span>
                              <span className='inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground'>
                                {session.timeRange}
                              </span>
                            </div>
                            <p className='text-xs text-muted-foreground'>{session.desc}</p>
                          </div>
                        </div>

                        <div className='shrink-0 pl-3'>
                          <RadioGroupItem value={session.value} id={`session-radio-${session.id}`} />
                        </div>
                      </label>
                    );
                  })}
                </RadioGroup>

                <div className='flex items-center gap-2 p-2.5 rounded-lg bg-muted/60 text-muted-foreground text-xs'>
                  <Icons.info className='size-4 text-primary shrink-0' />
                  <span>
                    Sistem akan mencarikan nomor antrean terdepan yang tersedia pada sesi yang Anda pilih.
                  </span>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* STEP 4: KONFIRMASI JANJI TEMU (CLEAN UNDERLINE STYLE) */}
            {/* =============================================================== */}
            {reservationEntryStep === 'form' && currentStep === 4 && (
              <div className='space-y-4'>
                <div>
                  <h3 className='text-base font-bold tracking-tight text-foreground'>
                    Konfirmasi Janji Temu
                  </h3>
                  <p className='text-xs text-muted-foreground font-normal mt-0.5 leading-relaxed'>
                    Periksa kembali ringkasan reservasi Anda sebelum disimpan.
                  </p>
                </div>

                {/* Minimalist Line Summary List (Underline Style Matching Original) */}
                <div className='space-y-1 text-xs pt-1'>
                  <div className='flex items-center justify-between py-2 border-b border-border'>
                    <span className='text-muted-foreground font-normal'>Poliklinik & Layanan</span>
                    <span className='font-semibold text-foreground'>{formData.service}</span>
                  </div>

                  <div className='flex items-center justify-between py-2 border-b border-border'>
                    <span className='text-muted-foreground font-normal'>Dokter Bertugas</span>
                    <span className='font-semibold text-foreground'>{formData.doctor}</span>
                  </div>

                  <div className='flex items-center justify-between py-2 border-b border-border'>
                    <span className='text-muted-foreground font-normal'>Tanggal Reservasi</span>
                    <span className='font-semibold text-primary dark:text-indigo-400'>
                      {formData.dateStr}
                    </span>
                  </div>

                  <div className='flex items-center justify-between py-2 border-b border-border'>
                    <span className='text-muted-foreground font-normal'>Sesi Konsultasi</span>
                    <span className='font-bold text-primary dark:text-indigo-300'>
                      {formData.timeSlot}
                    </span>
                  </div>

                  <div className='flex items-center justify-between py-2 border-b border-border'>
                    <span className='text-muted-foreground font-normal'>Tipe Kunjungan</span>
                    <span className='font-medium text-foreground'>{formData.visitType}</span>
                  </div>

                  <div className='py-2 space-y-1'>
                    <span className='text-muted-foreground font-normal block'>Keluhan Medis</span>
                    <p className='text-foreground font-normal'>{formData.complaint || '-'}</p>
                  </div>
                </div>

                <div className='flex items-center gap-2 p-2.5 rounded-lg bg-muted/60 text-muted-foreground text-xs'>
                  <Icons.check className='size-4 text-emerald-600 dark:text-emerald-400 shrink-0' />
                  <span>
                    Setelah disimpan, tiket nomor antrean resmi klinik akan otomatis diterbitkan.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Modal Bottom Actions */}
          {isServiceSelectionStep ? (
            <div className='flex items-center justify-between pt-3.5 border-t border-border'>
              <Button type='button' variant='ghost' size='md' shape='pill' onClick={onClose}>
                Batal
              </Button>
            </div>
          ) : (
            <div className='flex items-center justify-between pt-3.5 border-t border-border'>
              <div>
                {currentStep > 1 || (mode === 'create' && reservationEntryStep === 'form') ? (
                  <Button type='button' variant='ghost' size='md' shape='pill' onClick={handleBack}>
                    Kembali
                  </Button>
                ) : (
                  <Button type='button' variant='ghost' size='md' shape='pill' onClick={onClose}>
                    Batal
                  </Button>
                )}
              </div>

              <div>
                <Button
                  type='button'
                  variant='primary'
                  size='md'
                  shape='pill'
                  disabled={!isStepValid()}
                  onClick={handleNext}
                  withTrailingCircleIcon={true}
                  className='min-w-[150px]'
                  trailingIcon={<Icons.arrowUpRight className='size-3 stroke-[2.5]' />}
                >
                  {primaryActionLabel}
                </Button>
              </div>
            </div>
          )}
        </div>
      </ModalWrapper>

      {/* Post-Submit Processing & Queue Ticket Modal with Confetti */}
      <QueueSuccessModal
        isOpen={isQueueSuccessOpen}
        isProcessing={isProcessing}
        appointment={createdAppointment}
        queueItem={createdQueueItem}
        onClose={() => {
          setIsQueueSuccessOpen(false);
          onClose();
        }}
      />

      {activeMedicalFlow ? (
        <MedicalAppointmentModal
          flow={activeMedicalFlow}
          isOpen={isOpen}
          onBackToService={() => setActiveMedicalFlow(null)}
          onClose={handleMedicalFlowClose}
          onCreated={(medicalFormData) => onSubmit(medicalFormData)}
        />
      ) : null}
    </>
  );
}
