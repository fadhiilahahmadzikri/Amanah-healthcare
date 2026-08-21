'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Icons } from '@/components/icons';
import gsap from 'gsap';
import { Appointment, Doctor, QueueItem, AppointmentFormData } from '../api/types';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { StepperProgress } from './stepper-progress';
import { AppointmentCalendarDayPicker } from './appointment-calendar-day-picker';
import { AppointmentTimeSlotPicker } from './appointment-time-slot-picker';
import { QueueSuccessModal } from './queue-success-modal';
import {
  getDoctors,
  getDoctorsByService,
  createAppointmentRecordWithQueue,
  loadStoredAppointments
} from '../api/service';
import { AMANAH_SERVICES } from '../constants/services';
import { cn } from '@/lib/utils';

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
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const stepContainerRef = useRef<HTMLDivElement>(null);

  // Step 1 Dropdowns
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [isVisitTypeOpen, setIsVisitTypeOpen] = useState(false);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);
  const visitTypeDropdownRef = useRef<HTMLDivElement>(null);

  // Step 2 Doctor Search & Pagination
  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorPage, setDoctorPage] = useState(1);
  const doctorsPerPage = 6;
  const doctorListRef = useRef<HTMLDivElement>(null);

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
    dateStr: 'Kamis, 20 Ags 2026',
    timeSlot: '09:00 - 09:30 WIB'
  });

  const allDoctors = useMemo(() => getDoctors(), []);

  // Filter doctors based on selected service from Step 1
  const availableDoctorsForService = useMemo(() => {
    return getDoctorsByService(formData.service);
  }, [formData.service]);

  // Filtered & Paginated Doctors for Step 2
  const filteredDoctors = useMemo(() => {
    const pool = availableDoctorsForService.length > 0 ? availableDoctorsForService : allDoctors;
    if (!doctorSearch.trim()) return pool;
    const q = doctorSearch.toLowerCase();
    return pool.filter(
      (doc) =>
        doc.name.toLowerCase().includes(q) ||
        doc.spec.toLowerCase().includes(q) ||
        doc.location.toLowerCase().includes(q) ||
        (doc.tags && doc.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }, [availableDoctorsForService, allDoctors, doctorSearch]);

  const totalDoctorPages = Math.max(1, Math.ceil(filteredDoctors.length / doctorsPerPage));

  const paginatedDoctors = useMemo(() => {
    const startIndex = (doctorPage - 1) * doctorsPerPage;
    return filteredDoctors.slice(startIndex, startIndex + doctorsPerPage);
  }, [filteredDoctors, doctorPage, doctorsPerPage]);

  const visitTypeOptions = ['Pemeriksaan Baru', 'Kontrol Ulang'];

  // Reset or initialize form data
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialAppointment) {
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
        setCurrentStep(3);
      } else {
        const defaultService = 'Poli Penyakit Dalam';
        const defaultDocs = getDoctorsByService(defaultService);
        setFormData({
          service: defaultService,
          complaint: '',
          visitType: 'Pemeriksaan Baru',
          doctor: defaultDocs[0]?.name || allDoctors[0]?.name || '',
          dateStr: 'Kamis, 20 Ags 2026',
          timeSlot: '09:00 - 09:30 WIB'
        });
        setCurrentStep(1);
      }
      setIsServiceOpen(false);
      setIsVisitTypeOpen(false);
      setDoctorSearch('');
      setDoctorPage(1);
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
  const animateStepTransition = (nextStep: number, direction: 'forward' | 'backward') => {
    if (stepContainerRef.current) {
      const yOut = direction === 'forward' ? -10 : 10;
      const yIn = direction === 'forward' ? 10 : -10;

      gsap.to(stepContainerRef.current, {
        opacity: 0,
        y: yOut,
        duration: 0.18,
        ease: 'power2.in',
        onComplete: () => {
          setCurrentStep(nextStep);
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
      setCurrentStep(nextStep);
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep < totalSteps) {
      animateStepTransition(currentStep + 1, 'forward');
    } else {
      // Final Step: Submit with processing animation + queue ticket modal
      handleConfirmAppointment();
    }
  };

  const handleBack = () => {
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

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return !!formData.service && formData.complaint.trim().length >= 3;
      case 2:
        return !!formData.doctor;
      case 3:
        return !!formData.dateStr;
      case 4:
        return !!formData.timeSlot;
      case 5:
        return true;
      default:
        return true;
    }
  };

  const selectDoctorWithAnimation = (doc: Doctor, cardEl: HTMLElement) => {
    setFormData((prev) => ({ ...prev, doctor: doc.name }));
    gsap.fromTo(cardEl, { scale: 0.98 }, { scale: 1, duration: 0.2, ease: 'back.out(2)' });
  };

  if (!isOpen) return null;

  return (
    <>
      <ModalWrapper
        isOpen={isOpen && !isQueueSuccessOpen}
        onClose={onClose}
        maxWidth='max-w-[560px]'
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
              <StepperProgress currentStep={currentStep} totalSteps={totalSteps} />
            </div>
          </div>

          {/* Dynamic Stepper Form Content */}
          <div ref={stepContainerRef}>
            {/* =============================================================== */}
            {/* STEP 1: INFORMASI LAYANAN & KELUHAN PASIEN */}
            {/* =============================================================== */}
            {currentStep === 1 && (
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
            {/* STEP 2: PILIH DOKTER SPESIALIS */}
            {/* =============================================================== */}
            {currentStep === 2 && (
              <div className='space-y-3.5'>
                <div>
                  <h3 className='text-base font-bold tracking-tight text-foreground'>
                    Pilih Dokter Spesialis
                  </h3>
                  <p className='text-xs text-muted-foreground font-normal mt-0.5 leading-relaxed'>
                    Pilih tenaga medis profesional yang bertugas pada layanan ini.
                  </p>
                </div>

                {/* Doctor Search Toolbar */}
                <div className='flex items-center justify-between gap-3'>
                  <div className='relative flex-1'>
                    <Icons.search className='absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground' />
                    <input
                      type='text'
                      aria-label='Cari nama dokter atau spesialis'
                      value={doctorSearch}
                      onChange={(e) => {
                        setDoctorSearch(e.target.value);
                        setDoctorPage(1);
                      }}
                      placeholder='Cari nama dokter atau spesialis...'
                      className='w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary dark:focus:ring-indigo-400 transition-colors'
                    />
                    {doctorSearch && (
                      <button
                        type='button'
                        aria-label='Hapus pencarian'
                        onClick={() => {
                          setDoctorSearch('');
                          setDoctorPage(1);
                        }}
                        className='absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground cursor-pointer'
                      >
                        <Icons.close className='size-3' />
                      </button>
                    )}
                  </div>

                  <span className='text-[11px] font-medium text-muted-foreground shrink-0 select-none'>
                    {filteredDoctors.length} dokter
                  </span>
                </div>

                {/* Doctor Cards List */}
                <div ref={doctorListRef} className='space-y-2 max-h-[300px] overflow-y-auto pr-1'>
                  {paginatedDoctors.length === 0 ? (
                    <div className='py-8 text-center text-xs text-muted-foreground'>
                      Tidak ada dokter yang sesuai dengan pencarian &quot;{doctorSearch}&quot;.
                    </div>
                  ) : (
                    paginatedDoctors.map((doc: Doctor) => {
                      const isSelected = formData.doctor === doc.name;
                      return (
                        <button
                          key={doc.name}
                          type='button'
                          aria-label={`Pilih dokter ${doc.name}`}
                          onClick={(e) => selectDoctorWithAnimation(doc, e.currentTarget)}
                          className={cn(
                            'w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer select-none',
                            isSelected
                              ? 'border-2 border-primary dark:border-indigo-400 bg-primary/5 dark:bg-indigo-950/40 shadow-xs'
                              : 'border-border bg-card hover:border-primary/40'
                          )}
                        >
                          <div className='size-11 min-w-[44px] min-h-[44px] max-w-[44px] max-h-[44px] rounded-full overflow-hidden shrink-0 ring-1 ring-border bg-muted aspect-square'>
                            <Image
                              src={doc.avatar}
                              alt={doc.name}
                              width={44}
                              height={44}
                              unoptimized
                              className='w-full h-full object-cover object-center'
                            />
                          </div>

                          <div className='min-w-0 flex-1 space-y-0.5'>
                            <h4 className='font-bold text-xs sm:text-[13px] text-foreground truncate'>
                              {doc.name}
                            </h4>
                            <p className='text-[11px] text-primary dark:text-indigo-400 font-semibold truncate'>
                              {doc.spec}
                            </p>
                            <div className='flex items-center gap-2 pt-0.5'>
                              <span className='inline-flex items-center gap-0.5 rounded-[4px] bg-amber-400 px-1.5 py-0.2 text-[9px] font-bold text-slate-900 shadow-2xs'>
                                <span>★</span>
                                <span>{doc.rating}</span>
                              </span>
                              <span className='text-[10px] text-muted-foreground truncate'>
                                {doc.location}
                              </span>
                            </div>
                          </div>

                          <div className='shrink-0'>
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1 rounded-full select-none',
                                isSelected
                                  ? 'bg-primary dark:bg-indigo-600 text-primary-foreground shadow-2xs'
                                  : 'bg-muted text-muted-foreground border border-border hover:bg-accent'
                              )}
                            >
                              {isSelected ? (
                                <>
                                  <Icons.check className='size-3 stroke-[2.5]' />
                                  <span>Dipilih</span>
                                </>
                              ) : (
                                <span>Pilih</span>
                              )}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Native Pagination Footer */}
                {totalDoctorPages > 1 && (
                  <div className='flex items-center justify-between pt-2 border-t border-border'>
                    <span className='text-[11px] text-muted-foreground select-none'>
                      Halaman {doctorPage} dari {totalDoctorPages}
                    </span>

                    <div className='flex items-center gap-1.5'>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        shape='compact'
                        onClick={() => setDoctorPage((p) => Math.max(1, p - 1))}
                        disabled={doctorPage === 1}
                        leadingIcon={<Icons.chevronLeft className='size-3.5' />}
                      >
                        Sebelumnya
                      </Button>

                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        shape='compact'
                        onClick={() => setDoctorPage((p) => Math.min(totalDoctorPages, p + 1))}
                        disabled={doctorPage === totalDoctorPages}
                        trailingIcon={<Icons.chevronRight className='size-3.5' />}
                      >
                        Selanjutnya
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* =============================================================== */}
            {/* STEP 3: PILIH TANGGAL KUNJUNGAN (POV HARI SAJA) */}
            {/* =============================================================== */}
            {currentStep === 3 && (
              <div className='space-y-3.5'>
                <div>
                  <h3 className='text-base font-bold tracking-tight text-foreground'>
                    Pilih Tanggal Kunjungan
                  </h3>
                  <p className='text-xs text-muted-foreground font-normal mt-0.5 leading-relaxed'>
                    Pilih hari praktik dokter{' '}
                    <strong className='text-primary dark:text-indigo-300 font-semibold'>
                      {formData.doctor}
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
            {/* STEP 4: PILIH JAM KONSULTASI (POV SIANG/MALAM HOUR) */}
            {/* =============================================================== */}
            {currentStep === 4 && (
              <div className='space-y-3.5'>
                <div>
                  <h3 className='text-base font-bold tracking-tight text-foreground'>
                    Pilih Jam Konsultasi
                  </h3>
                  <p className='text-xs text-muted-foreground font-normal mt-0.5 leading-relaxed'>
                    Slot waktu praktik dokter yang tersedia untuk{' '}
                    <strong className='text-primary dark:text-indigo-300 font-semibold'>
                      {formData.dateStr}
                    </strong>
                    .
                  </p>
                </div>

                <AppointmentTimeSlotPicker
                  doctorName={formData.doctor}
                  selectedDateStr={formData.dateStr}
                  selectedTimeSlot={formData.timeSlot}
                  onSelectTimeSlot={(timeSlot) => {
                    setFormData((prev) => ({
                      ...prev,
                      timeSlot
                    }));
                  }}
                />
              </div>
            )}

            {/* =============================================================== */}
            {/* STEP 5: KONFIRMASI JANJI TEMU (CLEAN UNDERLINE STYLE) */}
            {/* =============================================================== */}
            {currentStep === 5 && (
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
                    <span className='text-muted-foreground font-normal'>Dokter Tujuan</span>
                    <span className='font-semibold text-foreground'>{formData.doctor}</span>
                  </div>

                  <div className='flex items-center justify-between py-2 border-b border-border'>
                    <span className='text-muted-foreground font-normal'>Poliklinik & Layanan</span>
                    <span className='font-semibold text-foreground'>{formData.service}</span>
                  </div>

                  <div className='flex items-center justify-between py-2 border-b border-border'>
                    <span className='text-muted-foreground font-normal'>Tanggal Reservasi</span>
                    <span className='font-semibold text-primary dark:text-indigo-400'>
                      {formData.dateStr}
                    </span>
                  </div>

                  <div className='flex items-center justify-between py-2 border-b border-border'>
                    <span className='text-muted-foreground font-normal'>Jam / Slot</span>
                    <span className='font-mono font-bold text-primary dark:text-indigo-300'>
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
              </div>
            )}
          </div>

          {/* Modal Bottom Actions */}
          <div className='flex items-center justify-between pt-3.5 border-t border-border'>
            <div>
              {currentStep > 1 ? (
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
                {currentStep === totalSteps ? 'Simpan Janji Temu' : 'Lanjutkan'}
              </Button>
            </div>
          </div>
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
    </>
  );
}
