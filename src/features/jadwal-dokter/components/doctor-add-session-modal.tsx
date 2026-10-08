'use client';

import React, { useMemo } from 'react';
import { Icons } from '@/components/icons';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { BookingDateStep } from '@/features/klinik/components/booking/booking-date-step';
import type { DoctorSchedule, DoctorDailySession } from '../api/types';
import { useDoctorAddSessionModal, type AddSessionStep } from '../model/useDoctorAddSessionModal';
import { StepSessionSelect } from './add-session/step-session-select';
import { StepRoomSelect } from './add-session/step-room-select';
import { StepConfirmation } from './add-session/step-confirmation';
import type { DoctorConflictReturnContext } from '../model/useDoctorConflictNavigation';

export type { AddSessionStep };
export type ReturnDoctorContext = DoctorConflictReturnContext;

export interface DoctorAddSessionModalProps {
  doctor: DoctorSchedule | null;
  isOpen: boolean;
  onClose: () => void;
  onSessionAdded?: (session: DoctorDailySession) => void;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
  targetDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  initialStep?: AddSessionStep;
  onViewDoctorSchedule?: (
    doctorId: string,
    targetSlotTime?: string,
    returnContext?: ReturnDoctorContext
  ) => void;
}

export function DoctorAddSessionModal({
  doctor,
  isOpen,
  onClose,
  onSessionAdded,
  portalContainerRef,
  targetDate,
  initialStartTime,
  initialEndTime,
  initialStep
}: DoctorAddSessionModalProps) {
  const {
    step,
    selectedDate,
    setSelectedDate,
    formattedDisplayDate,
    selectedShift,
    setSelectedShift,
    selectedSlot,
    selectedRoomId,
    setSelectedRoomId,
    selectedRoom,
    isSubmitting,
    rooms,
    isLoadingRooms,
    canProceedNext,
    isFirstStep,
    effectiveExistingSessions,
    handleNext,
    handleBack,
    handleFinalSubmit
  } = useDoctorAddSessionModal({
    doctor,
    isOpen,
    onClose,
    onSessionAdded,
    targetDate,
    initialStartTime,
    initialEndTime,
    initialStep
  });

  const stepMeta = useMemo(() => {
    const docName = doctor?.nama_dokter ? `dokter ${doctor.nama_dokter}` : 'dokter';
    switch (step) {
      case 'date':
        return {
          title: 'Pilih Tanggal Praktik',
          subtitle: `Tentukan tanggal praktik ${docName} yang ingin ditambahkan jadwalnya.`
        };
      case 'session':
        return {
          title: 'Pilih Sesi Praktik',
          subtitle: `Tentukan sesi shift operasional praktik ${docName}.`
        };
      case 'room':
        return {
          title: 'Pilih Ruangan Praktik',
          subtitle: `Tentukan ruangan poliklinik tempat ${docName} akan bertugas.`
        };
      case 'confirmation':
        return {
          title: 'Konfirmasi Jadwal Praktik',
          subtitle: `Periksa kembali rincian sesi ${docName} sebelum menyimpan jadwal.`
        };
    }
  }, [step, doctor?.nama_dokter]);

  if (!doctor) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[508px]'
      showCloseButton={false}
      portalContainerRef={portalContainerRef}
      className='h-auto max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-5 sm:p-6 w-full my-auto shadow-2xl'
    >
      <div className='flex flex-col font-sans select-none gap-4'>
        {/* Header */}
        <div className='flex items-start justify-between gap-3 shrink-0'>
          <div className='space-y-0.5 min-w-0 flex-1'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              {stepMeta.title}
            </h3>
            <p className='text-xs text-muted-foreground leading-relaxed'>{stepMeta.subtitle}</p>
          </div>
          <button
            type='button'
            onClick={onClose}
            aria-label='Tutup'
            className='rounded-full p-1.5 text-muted-foreground hover:bg-muted transition-colors cursor-pointer shrink-0 -mr-1 -mt-1'
          >
            <Icons.close className='size-4' />
          </button>
        </div>

        {/* Wizard Steps */}
        <div key={step} className='w-full animate-in fade-in-50 duration-200'>
          {step === 'date' && (
            <BookingDateStep
              dateStr={selectedDate}
              setDateStr={(d) => {
                setSelectedDate(d);
              }}
              showHeader={false}
              label='Tanggal Praktik Dokter*'
              placeholder='Pilih tanggal praktik...'
              id='tanggalPraktikDoctorTrigger'
              ariaLabel='Tanggal praktik dokter'
              disablePastDates={true}
            />
          )}

          {step === 'session' && (
            <StepSessionSelect
              selectedShift={selectedShift}
              onSelectShift={(shift) => setSelectedShift(shift)}
              selectedDate={selectedDate}
              formattedDisplayDate={formattedDisplayDate}
              existingSessions={effectiveExistingSessions}
              doctorName={doctor.nama_dokter}
              showHeader={false}
            />
          )}

          {step === 'room' && (
            <StepRoomSelect
              rooms={rooms}
              selectedRoomId={selectedRoomId}
              onSelectRoomId={(id) => setSelectedRoomId(id)}
              doctorName={doctor.nama_dokter}
              isLoading={isLoadingRooms}
              showHeader={false}
            />
          )}

          {step === 'confirmation' && (
            <StepConfirmation
              doctor={doctor}
              formattedDisplayDate={formattedDisplayDate}
              selectedShift={selectedShift}
              selectedSlot={selectedSlot}
              selectedRoom={selectedRoom}
              showHeader={false}
            />
          )}
        </div>

        {/* Stepper Navigation Footer */}
        <div className='pt-2 flex items-center justify-between gap-3 select-none shrink-0'>
          <Button
            type='button'
            variant='outline'
            shape='pill'
            size='md'
            onClick={handleBack}
            disabled={isSubmitting}
            leadingIcon={
              !isFirstStep ? <Icons.arrowLeft className='size-3 stroke-[2.5]' /> : undefined
            }
            className='min-w-[100px] cursor-pointer'
          >
            {isFirstStep ? 'Batal' : 'Kembali'}
          </Button>

          {step !== 'confirmation' ? (
            <Button
              type='button'
              variant='primary'
              shape='pill'
              size='md'
              disabled={!canProceedNext || isSubmitting}
              onClick={handleNext}
              withTrailingCircleIcon={true}
              trailingIcon={<Icons.arrowRight className='size-3 stroke-[2.5]' />}
              className='min-w-[120px] cursor-pointer'
            >
              Lanjut
            </Button>
          ) : (
            <Button
              type='button'
              variant='primary'
              shape='pill'
              size='md'
              disabled={!canProceedNext || isSubmitting}
              onClick={handleFinalSubmit}
              isLoading={isSubmitting}
              withTrailingCircleIcon={true}
              trailingIcon={<Icons.calendar className='size-3 stroke-[2.5]' />}
              className='min-w-[160px] cursor-pointer'
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Jadwal Praktik'}
            </Button>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}
