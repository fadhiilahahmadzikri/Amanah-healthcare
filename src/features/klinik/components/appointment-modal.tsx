'use client';

import React, { useRef, useEffect } from 'react';
import { Icons } from '@/components/icons';
import gsap from 'gsap';
import { Appointment, AppointmentFormData } from '../api/types';
import { ServiceBentoGrid } from '@/features/public-site/pages/services/components/organisms/ServiceBentoGrid';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StepperProgress } from './stepper-progress';
import { AppointmentCalendarDayPicker } from './appointment-calendar-day-picker';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { QueueSuccessModal } from './queue-success-modal';
import { AMANAH_SERVICES } from '../constants/services';
import {
  APPOINTMENT_SERVICE_CATEGORIES,
  getReservationServicesByCategory
} from '../constants/appointment-reservation-services';
import { MedicalAppointmentModal } from './medical-appointment-modal';
import { useAppointmentReservation } from '../model/useAppointmentReservation';
import { cn } from '@/lib/utils';

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
  const reservation = useAppointmentReservation({
    isOpen,
    mode,
    initialAppointment,
    onClose,
    onSubmit
  });

  const [isServiceOpen, setIsServiceOpen] = React.useState(false);
  const [isVisitTypeOpen, setIsVisitTypeOpen] = React.useState(false);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);
  const visitTypeDropdownRef = useRef<HTMLDivElement>(null);
  const stepContainerRef = useRef<HTMLDivElement>(null);

  const visitTypeOptions = ['Pemeriksaan Baru', 'Kontrol Ulang'];

  // GSAP Accordion Dropdown Transitions
  useEffect(() => {
    if (serviceDropdownRef.current) {
      if (isServiceOpen) {
        gsap.fromTo(
          serviceDropdownRef.current,
          { height: 0, opacity: 0 },
          { height: 'auto', opacity: 1, duration: 0.22, ease: 'power2.out' }
        );
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

  useEffect(() => {
    if (stepContainerRef.current) {
      stepContainerRef.current.scrollTop = 0;
      gsap.fromTo(
        stepContainerRef.current,
        { opacity: 0.6, y: 4 },
        { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }
      );
    }
  }, [reservation.currentStep, reservation.reservationEntryStep]);

  if (!isOpen) return null;

  return (
    <>
      <ModalWrapper
        isOpen={isOpen && !reservation.activeMedicalFlow}
        onClose={onClose}
        maxWidth={reservation.modalMaxWidth}
        backdropClassName='overflow-hidden'
        className='flex flex-col max-h-[95vh] max-h-[95dvh] w-full p-5 sm:p-6 overflow-hidden'
      >
        <div className='flex flex-col flex-auto min-h-0 justify-between gap-3 font-sans select-none'>
          {/* Header & Stepper */}
          <div className='flex flex-col shrink-0 gap-2 border-b border-border pb-3'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg sm:text-xl font-bold text-foreground'>
                {mode === 'create' ? 'Buat Janji Temu Baru' : 'Ubah Jadwal Janji Temu'}
              </h2>
            </div>
            <StepperProgress
              currentStep={reservation.displayStep}
              totalSteps={reservation.totalSteps}
            />
          </div>

          <div ref={stepContainerRef} className='flex-auto min-h-0 overflow-y-auto pr-1'>
            {/* STEP: KATEGORI LAYANAN */}
            {mode === 'create' && reservation.reservationEntryStep === 'category' && (
              <div className='space-y-4'>
                <div>
                  <h3 className='text-base font-bold tracking-tight text-foreground'>
                    Pilih Kategori Layanan
                  </h3>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    Tentukan kategori perawatan kesehatan yang ingin Anda akses.
                  </p>
                </div>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1'>
                  {APPOINTMENT_SERVICE_CATEGORIES.map((cat) => {
                    const servicesInCat = getReservationServicesByCategory(cat.id);
                    return (
                      <Card
                        key={cat.id}
                        className='p-4 border border-border/70 hover:border-primary/60 transition cursor-pointer hover:shadow-xs rounded-2xl flex flex-col justify-between group'
                        onClick={() => reservation.actions.selectCategory(cat.id)}
                      >
                        <CardHeader className='p-0 gap-1.5'>
                          <div className='flex items-center justify-between'>
                            <span className='text-xl'>{cat.icon}</span>
                            <span className='text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground'>
                              {servicesInCat.length} Layanan
                            </span>
                          </div>
                          <CardTitle className='text-sm font-bold text-foreground group-hover:text-primary transition-colors'>
                            {cat.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='p-0 pt-2'>
                          <p className='text-xs text-muted-foreground leading-relaxed'>
                            {cat.description}
                          </p>
                        </CardContent>
                        <CardAction className='p-0 pt-3 flex items-center gap-1 text-xs font-semibold text-primary'>
                          <span>Pilih Kategori</span>
                          <Icons.arrowRight className='size-3 group-hover:translate-x-0.5 transition-transform' />
                        </CardAction>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP: DAFTAR LAYANAN SPESIFIK */}
            {mode === 'create' && reservation.reservationEntryStep === 'service' && (
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='text-base font-bold tracking-tight text-foreground'>
                      Pilih Layanan Pemeriksaan
                    </h3>
                    <p className='text-xs text-muted-foreground mt-0.5'>
                      Pilih salah satu layanan untuk diarahkan ke alur reservasi yang sesuai.
                    </p>
                  </div>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => reservation.actions.setReservationEntryStep('category')}
                    className='text-xs gap-1'
                  >
                    <Icons.arrowLeft className='size-3.5' />
                    <span>Kategori</span>
                  </Button>
                </div>

                <div className='pt-1'>
                  <ServiceBentoGrid
                    items={reservation.serviceSelectionItems}
                    onItemSelect={reservation.actions.selectServiceItem}
                    cardClassName='min-h-[120px] sm:min-h-[135px] md:min-h-[145px]'
                  />
                </div>
              </div>
            )}

            {/* STEP 1 FORM: LAYANAN & KELUHAN */}
            {reservation.reservationEntryStep === 'form' && reservation.currentStep === 1 && (
              <div className='space-y-4'>
                <div>
                  <h3 className='text-base font-bold tracking-tight text-foreground'>
                    Pilih Layanan & Masukkan Keluhan
                  </h3>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    Tentukan poliklinik yang dituju dan jelaskan keluhan Anda secara singkat.
                  </p>
                </div>

                {/* Poliklinik Picker */}
                <div className='space-y-1.5'>
                  <label
                    htmlFor='service-picker-trigger'
                    className='text-xs font-semibold text-foreground'
                  >
                    Poliklinik Layanan
                  </label>
                  <div className='relative'>
                    <button
                      id='service-picker-trigger'
                      type='button'
                      onClick={() => setIsServiceOpen(!isServiceOpen)}
                      className='w-full flex items-center justify-between p-3 rounded-xl border border-border bg-card text-xs font-medium text-foreground transition-all hover:border-primary/50 text-left'
                    >
                      <div className='flex items-center gap-2'>
                        <Icons.stethoscope className='size-4 text-primary shrink-0' />
                        <span
                          className={
                            reservation.formData.service
                              ? 'text-foreground font-semibold'
                              : 'text-muted-foreground'
                          }
                        >
                          {reservation.formData.service || 'Pilih layanan poliklinik...'}
                        </span>
                      </div>
                      <Icons.chevronDown
                        className={cn(
                          'size-4 text-muted-foreground transition-transform',
                          isServiceOpen && 'rotate-180'
                        )}
                      />
                    </button>

                    <div
                      ref={serviceDropdownRef}
                      className={cn(
                        'absolute left-0 right-0 top-full mt-1.5 z-30 bg-card border border-border rounded-xl shadow-lg overflow-hidden',
                        !isServiceOpen && 'hidden'
                      )}
                    >
                      <div className='p-1.5 max-h-56 overflow-y-auto space-y-1'>
                        {AMANAH_SERVICES.map((srv) => (
                          <button
                            key={srv.id}
                            type='button'
                            onClick={() => {
                              reservation.actions.setField('service', srv.name);
                              setIsServiceOpen(false);
                            }}
                            className={cn(
                              'w-full text-left p-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition hover:bg-muted/60',
                              reservation.formData.service === srv.name &&
                                'bg-primary/10 text-primary font-bold'
                            )}
                          >
                            <span>{srv.name}</span>
                            {reservation.formData.service === srv.name && (
                              <Icons.check className='size-3.5 text-primary' />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tipe Kunjungan */}
                <div className='space-y-1.5'>
                  <label
                    htmlFor='visit-type-trigger'
                    className='text-xs font-semibold text-foreground'
                  >
                    Tipe Kunjungan
                  </label>
                  <div className='relative'>
                    <button
                      id='visit-type-trigger'
                      type='button'
                      onClick={() => setIsVisitTypeOpen(!isVisitTypeOpen)}
                      className='w-full flex items-center justify-between p-3 rounded-xl border border-border bg-card text-xs font-medium text-foreground transition-all hover:border-primary/50 text-left'
                    >
                      <span>{reservation.formData.visitType}</span>
                      <Icons.chevronDown
                        className={cn(
                          'size-4 text-muted-foreground transition-transform',
                          isVisitTypeOpen && 'rotate-180'
                        )}
                      />
                    </button>

                    <div
                      ref={visitTypeDropdownRef}
                      className={cn(
                        'absolute left-0 right-0 top-full mt-1.5 z-30 bg-card border border-border rounded-xl shadow-lg overflow-hidden',
                        !isVisitTypeOpen && 'hidden'
                      )}
                    >
                      <div className='p-1.5 space-y-1'>
                        {visitTypeOptions.map((opt) => (
                          <button
                            key={opt}
                            type='button'
                            onClick={() => {
                              reservation.actions.setField('visitType', opt);
                              setIsVisitTypeOpen(false);
                            }}
                            className={cn(
                              'w-full text-left p-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition hover:bg-muted/60',
                              reservation.formData.visitType === opt &&
                                'bg-primary/10 text-primary font-bold'
                            )}
                          >
                            <span>{opt}</span>
                            {reservation.formData.visitType === opt && (
                              <Icons.check className='size-3.5 text-primary' />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Keluhan */}
                <div className='space-y-1.5'>
                  <label
                    htmlFor='complaint-input'
                    className='text-xs font-semibold text-foreground'
                  >
                    Keluhan Medis
                  </label>
                  <textarea
                    id='complaint-input'
                    aria-label='Keluhan Medis'
                    rows={3}
                    value={reservation.formData.complaint}
                    onChange={(e) => reservation.actions.setField('complaint', e.target.value)}
                    placeholder='Contoh: Demam sejak 2 hari, batuk kering, dan sakit tenggorokan...'
                    className='w-full p-3 text-xs bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-none'
                  />
                </div>
              </div>
            )}

            {/* STEP 2 FORM: TANGGAL KUNJUNGAN */}
            {reservation.reservationEntryStep === 'form' && reservation.currentStep === 2 && (
              <div className='space-y-3.5'>
                <div>
                  <h3 className='text-base font-bold tracking-tight text-foreground'>
                    Pilih Tanggal Kunjungan
                  </h3>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    Tentukan tanggal periksa pada kalender ketersediaan jadwal dokter.
                  </p>
                </div>

                <AppointmentCalendarDayPicker
                  doctorName={reservation.formData.doctor}
                  selectedDateStr={reservation.formData.dateStr}
                  onSelectDate={(d) => reservation.actions.setField('dateStr', d)}
                />
              </div>
            )}

            {/* STEP 3 FORM: SESI KONSULTASI */}
            {reservation.reservationEntryStep === 'form' && reservation.currentStep === 3 && (
              <div className='space-y-4'>
                <div>
                  <h3 className='text-base font-bold tracking-tight text-foreground'>
                    Pilih Sesi Konsultasi
                  </h3>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    Pilih waktu kunjungan. Antrean otomatis diterbitkan berdasarkan ketersediaan
                    slot.
                  </p>
                </div>

                <RadioGroup
                  value={reservation.formData.timeSlot}
                  onValueChange={(val) => reservation.actions.setField('timeSlot', val)}
                  className='gap-2.5 pt-1'
                >
                  {CONSULTATION_SESSIONS.map((session) => {
                    const isSelected = reservation.formData.timeSlot === session.value;
                    const SessionIcon = session.icon;

                    return (
                      <label
                        key={session.id}
                        htmlFor={`session-radio-${session.id}`}
                        className={cn(
                          'flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none',
                          isSelected
                            ? 'border-2 border-primary bg-primary/5 shadow-xs'
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
                          <RadioGroupItem
                            value={session.value}
                            id={`session-radio-${session.id}`}
                          />
                        </div>
                      </label>
                    );
                  })}
                </RadioGroup>

                <div className='flex items-center gap-2 p-2.5 rounded-lg bg-muted/60 text-muted-foreground text-xs'>
                  <Icons.info className='size-4 text-primary shrink-0' />
                  <span>
                    Sistem akan mencarikan nomor antrean terdepan yang tersedia pada sesi yang Anda
                    pilih.
                  </span>
                </div>
              </div>
            )}

            {/* STEP 4 FORM: KONFIRMASI RINGKASAN */}
            {reservation.reservationEntryStep === 'form' && reservation.currentStep === 4 && (
              <div className='space-y-4'>
                <div>
                  <h3 className='text-base font-bold tracking-tight text-foreground'>
                    Konfirmasi Janji Temu
                  </h3>
                  <p className='text-xs text-muted-foreground font-normal mt-0.5 leading-relaxed'>
                    Periksa kembali ringkasan reservasi Anda sebelum disimpan.
                  </p>
                </div>

                <div className='space-y-1 text-xs pt-1'>
                  <div className='flex items-center justify-between py-2 border-b border-border'>
                    <span className='text-muted-foreground font-normal'>Poliklinik & Layanan</span>
                    <span className='font-semibold text-foreground'>
                      {reservation.formData.service}
                    </span>
                  </div>

                  <div className='flex items-center justify-between py-2 border-b border-border'>
                    <span className='text-muted-foreground font-normal'>Dokter Bertugas</span>
                    <span className='font-semibold text-foreground'>
                      {reservation.formData.doctor}
                    </span>
                  </div>

                  <div className='flex items-center justify-between py-2 border-b border-border'>
                    <span className='text-muted-foreground font-normal'>Tanggal Reservasi</span>
                    <span className='font-semibold text-primary'>
                      {reservation.formData.dateStr}
                    </span>
                  </div>

                  <div className='flex items-center justify-between py-2 border-b border-border'>
                    <span className='text-muted-foreground font-normal'>Sesi Konsultasi</span>
                    <span className='font-bold text-primary'>{reservation.formData.timeSlot}</span>
                  </div>

                  <div className='flex items-center justify-between py-2 border-b border-border'>
                    <span className='text-muted-foreground font-normal'>Tipe Kunjungan</span>
                    <span className='font-medium text-foreground'>
                      {reservation.formData.visitType}
                    </span>
                  </div>

                  <div className='py-2 space-y-1'>
                    <span className='text-muted-foreground font-normal block'>Keluhan Medis</span>
                    <p className='text-foreground font-normal'>
                      {reservation.formData.complaint || '-'}
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-2 p-2.5 rounded-lg bg-muted/60 text-muted-foreground text-xs'>
                  <Icons.check className='size-4 text-emerald-600 shrink-0' />
                  <span>
                    Setelah disimpan, tiket nomor antrean resmi klinik akan otomatis diterbitkan.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Modal Bottom Actions */}
          {reservation.isServiceSelectionStep ? (
            <div className='flex items-center justify-between shrink-0 pt-3.5 border-t border-border'>
              <Button type='button' variant='ghost' size='md' shape='pill' onClick={onClose}>
                Batal
              </Button>
            </div>
          ) : (
            <div className='flex items-center justify-between shrink-0 pt-3.5 border-t border-border'>
              <div>
                {reservation.currentStep > 1 ||
                (mode === 'create' && reservation.reservationEntryStep === 'form') ? (
                  <Button
                    type='button'
                    variant='ghost'
                    size='md'
                    shape='pill'
                    onClick={reservation.actions.prevStep}
                  >
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
                  disabled={!reservation.isStepValid}
                  onClick={reservation.actions.nextStep}
                  withTrailingCircleIcon={true}
                  className='min-w-[150px]'
                  trailingIcon={<Icons.arrowUpRight className='size-3 stroke-[2.5]' />}
                >
                  {reservation.primaryActionLabel}
                </Button>
              </div>
            </div>
          )}
        </div>
      </ModalWrapper>

      {/* Post-Submit Processing & Queue Ticket Modal */}
      <QueueSuccessModal
        isOpen={reservation.isQueueSuccessOpen}
        isProcessing={reservation.isProcessing}
        appointment={reservation.createdAppointment}
        queueItem={reservation.createdQueueItem}
        onClose={reservation.actions.closeQueueSuccess}
      />

      {reservation.activeMedicalFlow ? (
        <MedicalAppointmentModal
          flow={reservation.activeMedicalFlow}
          isOpen={isOpen}
          onBackToService={() => {
            reservation.actions.setReservationEntryStep('service');
            reservation.actions.closeMedicalFlow();
          }}
          onClose={reservation.actions.closeMedicalFlow}
          onCreated={(medicalFormData) => onSubmit(medicalFormData)}
        />
      ) : null}
    </>
  );
}
