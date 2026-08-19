'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Icons } from '@/components/icons';
import confetti from 'canvas-confetti';
import gsap from 'gsap';
import { Appointment, Doctor, AppointmentFormData } from '../api/types';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { StepperProgress } from './stepper-progress';
import { CustomCalendar } from './custom-calendar';
import { Visual7DayStrip } from './visual-7day-strip';
import { getDoctors, getTimeSlots } from '../api/service';
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

  // Step 1 Accordion Dropdown States
  const [isServiceOpen, setIsServiceOpen] = useState(false);
  const [isVisitTypeOpen, setIsVisitTypeOpen] = useState(false);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);
  const visitTypeDropdownRef = useRef<HTMLDivElement>(null);

  // Step 2 Doctor Search & Pagination: 6 Doctors per Page
  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorPage, setDoctorPage] = useState(1);
  const doctorsPerPage = 6;
  const doctorListRef = useRef<HTMLDivElement>(null);

  const [showFullCalendar, setShowFullCalendar] = useState(false);

  const [formData, setFormData] = useState<AppointmentFormData>({
    service: 'Poliklinik Kulit & Kelamin',
    complaint: '',
    visitType: 'Pemeriksaan Baru',
    doctor: '',
    dateStr: 'Kamis, 20 Ags 2026',
    timeSlot: '09:00 - 09:30 WIB'
  });

  const allDoctors = getDoctors();
  const timeSlots = getTimeSlots();

  // Filtered & Paginated Doctors
  const filteredDoctors = useMemo(() => {
    if (!doctorSearch.trim()) return allDoctors;
    const q = doctorSearch.toLowerCase();
    return allDoctors.filter(
      (doc) =>
        doc.name.toLowerCase().includes(q) ||
        doc.spec.toLowerCase().includes(q) ||
        doc.location.toLowerCase().includes(q)
    );
  }, [allDoctors, doctorSearch]);

  const totalDoctorPages = Math.max(1, Math.ceil(filteredDoctors.length / doctorsPerPage));

  const paginatedDoctors = useMemo(() => {
    const startIndex = (doctorPage - 1) * doctorsPerPage;
    return filteredDoctors.slice(startIndex, startIndex + doctorsPerPage);
  }, [filteredDoctors, doctorPage, doctorsPerPage]);

  const morningSlots = timeSlots.filter((s) => {
    const hour = parseInt(s.split(':')[0], 10);
    return hour < 12;
  });

  const afternoonSlots = timeSlots.filter((s) => {
    const hour = parseInt(s.split(':')[0], 10);
    return hour >= 12;
  });

  const serviceOptions = [
    'Poliklinik Kulit & Kelamin',
    'Poliklinik Penyakit Dalam',
    'Poliklinik Gigi & Mulut',
    'Poliklinik Anak',
    'Poliklinik Bedah Umum',
    'Laboratorium & Radiologi'
  ];

  const visitTypeOptions = ['Pemeriksaan Baru', 'Kontrol Ulang'];

  // Reset or initialize form data
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialAppointment) {
        setFormData({
          service: initialAppointment.service || 'Poliklinik Kulit & Kelamin',
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
        setFormData({
          service: 'Poliklinik Kulit & Kelamin',
          complaint: '',
          visitType: 'Pemeriksaan Baru',
          doctor: allDoctors[0]?.name || '',
          dateStr: 'Kamis, 20 Ags 2026',
          timeSlot: '09:00 - 09:30 WIB'
        });
        setCurrentStep(1);
      }
      setIsServiceOpen(false);
      setIsVisitTypeOpen(false);
      setShowFullCalendar(false);
      setDoctorSearch('');
      setDoctorPage(1);
    }
  }, [isOpen, mode, initialAppointment, allDoctors]);

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

  // GSAP Transition on Doctor Page Change
  useEffect(() => {
    if (doctorListRef.current) {
      gsap.fromTo(
        doctorListRef.current,
        { opacity: 0.4, y: 4 },
        { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }
      );
    }
  }, [doctorPage, doctorSearch]);

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
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#13195C', '#10B981', '#F59E0B', '#6366F1', '#EC4899']
        });
      } catch {
        // confetti fallback
      }

      onSubmit(formData, initialAppointment?.id);
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      animateStepTransition(currentStep - 1, 'backward');
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.service && formData.complaint.trim().length >= 3;
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
    setFormData({ ...formData, doctor: doc.name });
    gsap.fromTo(cardEl, { scale: 0.98 }, { scale: 1, duration: 0.2, ease: 'back.out(2)' });
  };

  if (!isOpen) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[560px]'
      showCloseButton={false}
    >
      <div className='space-y-5'>
        {/* Header: Clean Title on Left, Stepper on Right */}
        <div className='flex items-center justify-between pb-3.5 border-b border-border'>
          <div>
            <span className='text-sm font-bold text-foreground leading-none'>
              {mode === 'edit' ? 'Reschedule Konsultasi' : 'Reservasi Janji Temu'}
            </span>
          </div>

          <div className='w-28 sm:w-36'>
            <StepperProgress currentStep={currentStep} totalSteps={totalSteps} />
          </div>
        </div>

        {/* Dynamic Stepper Form Content */}
        <div ref={stepContainerRef}>
          {/* STEP 1: LAYANAN & KELUHAN */}
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
                {/* 1. Layanan Poliklinik GSAP Accordion Dropdown */}
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
                    <div className='p-1 space-y-0.5 max-h-44 overflow-y-auto'>
                      {serviceOptions.map((srv) => (
                        <button
                          key={srv}
                          type='button'
                          onClick={() => {
                            setFormData({ ...formData, service: srv });
                            setIsServiceOpen(false);
                          }}
                          className={cn(
                            'dropdown-item w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center justify-between border-b last:border-b-0 border-border/60 rounded-md cursor-pointer',
                            formData.service === srv
                              ? 'bg-primary text-primary-foreground'
                              : 'text-foreground hover:bg-accent'
                          )}
                        >
                          <span>{srv}</span>
                          {formData.service === srv && <Icons.check className='size-3.5' />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Jenis Kunjungan GSAP Accordion Dropdown */}
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
                            setFormData({ ...formData, visitType: vt });
                            setIsVisitTypeOpen(false);
                          }}
                          className={cn(
                            'dropdown-item w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center justify-between border-b last:border-b-0 border-border/60 rounded-md cursor-pointer',
                            formData.visitType === vt
                              ? 'bg-primary text-primary-foreground'
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
                    onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
                    rows={3}
                    placeholder='Contoh: Ruam kemerahan pada lengan kanan sejak 2 hari yang lalu...'
                    className='w-full p-3 border border-border bg-background dark:bg-slate-800/60 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary dark:focus:border-indigo-400 transition-colors resize-none rounded-lg'
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PILIH DOKTER */}
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

              {/* Native Search Toolbar */}
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
            </div>
          )}

          {/* STEP 3: PILIH TANGGAL */}
          {currentStep === 3 && (
            <div className='space-y-4'>
              <div>
                <h3 className='text-base font-bold tracking-tight text-foreground'>
                  Pilih Tanggal Kunjungan
                </h3>
                <p className='text-xs text-muted-foreground font-normal mt-0.5 leading-relaxed'>
                  Tentukan tanggal reservasi melalui strip 7-hari, kalender, atau input manual.
                </p>
              </div>

              <div className='space-y-3.5'>
                <Visual7DayStrip
                  selectedDateStr={formData.dateStr}
                  onSelectDate={(dateStr) => setFormData({ ...formData, dateStr })}
                  onToggleCalendar={() => setShowFullCalendar(!showFullCalendar)}
                  showFullCalendar={showFullCalendar}
                />

                {showFullCalendar && (
                  <div className='mt-1'>
                    <CustomCalendar
                      value={formData.dateStr}
                      onChange={(dateStr) => setFormData({ ...formData, dateStr })}
                      label=''
                    />
                  </div>
                )}

                <div className='space-y-1 pt-1'>
                  <label
                    htmlFor='manual-date-input'
                    className='block text-xs font-normal text-muted-foreground'
                  >
                    Atau Ketik Tanggal Manual (Format: Hari, DD Bln YYYY)*
                  </label>
                  <input
                    id='manual-date-input'
                    aria-label='Tanggal kunjungan manual'
                    type='text'
                    value={formData.dateStr}
                    onChange={(e) => setFormData({ ...formData, dateStr: e.target.value })}
                    placeholder='Contoh: Kamis, 20 Ags 2026'
                    className='w-full p-2.5 border border-border bg-background dark:bg-slate-800/60 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary dark:focus:border-indigo-400 transition-colors rounded-lg'
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PILIH JAM / SLOT KONSULTASI */}
          {currentStep === 4 && (
            <div className='space-y-4'>
              <div>
                <h3 className='text-base font-bold tracking-tight text-foreground'>
                  Pilih Jam Konsultasi
                </h3>
                <p className='text-xs text-muted-foreground font-normal mt-0.5 leading-relaxed'>
                  Slot waktu praktik dokter yang tersedia untuk{' '}
                  <strong className='text-primary dark:text-indigo-300 font-semibold'>
                    {formData.dateStr}
                  </strong>
                </p>
              </div>

              <div className='space-y-3.5 max-h-72 overflow-y-auto pr-1'>
                {/* Sesi Pagi */}
                <div className='space-y-2'>
                  <span className='text-[11px] font-semibold text-muted-foreground block'>
                    Sesi Pagi
                  </span>
                  <div className='grid grid-cols-2 gap-2.5'>
                    {morningSlots.map((slot) => {
                      const isSelected = formData.timeSlot === slot;
                      return (
                        <button
                          key={slot}
                          type='button'
                          onClick={() => setFormData({ ...formData, timeSlot: slot })}
                          className={cn(
                            'py-2.5 px-3.5 rounded-xl text-center text-xs font-semibold tracking-tight transition-colors cursor-pointer select-none whitespace-nowrap',
                            isSelected
                              ? 'bg-primary dark:bg-indigo-600 text-primary-foreground shadow-2xs'
                              : 'border border-border bg-card text-foreground hover:border-primary/50'
                          )}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sesi Siang & Sore */}
                <div className='space-y-2 pt-1'>
                  <span className='text-[11px] font-semibold text-muted-foreground block'>
                    Sesi Siang & Sore
                  </span>
                  <div className='grid grid-cols-2 gap-2.5'>
                    {afternoonSlots.map((slot) => {
                      const isSelected = formData.timeSlot === slot;
                      return (
                        <button
                          key={slot}
                          type='button'
                          onClick={() => setFormData({ ...formData, timeSlot: slot })}
                          className={cn(
                            'py-2.5 px-3.5 rounded-xl text-center text-xs font-semibold tracking-tight transition-colors cursor-pointer select-none whitespace-nowrap',
                            isSelected
                              ? 'bg-primary dark:bg-indigo-600 text-primary-foreground shadow-2xs'
                              : 'border border-border bg-card text-foreground hover:border-primary/50'
                          )}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: KONFIRMASI */}
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

              {/* Minimalist Line Summary List (Underline Style) */}
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
              className='min-w-[140px]'
              trailingIcon={<Icons.arrowUpRight className='size-3 stroke-[2.5]' />}
            >
              {currentStep === totalSteps ? 'Simpan Janji Temu' : 'Lanjutkan'}
            </Button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
