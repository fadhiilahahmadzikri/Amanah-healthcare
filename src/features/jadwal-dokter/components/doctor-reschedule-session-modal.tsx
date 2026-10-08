'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
import { StatusBadge } from '@/components/ui/status-badge';
import { BookingDateStep } from '@/features/klinik/components/booking/booking-date-step';
import { StepSessionSelect } from './add-session/step-session-select';
import { StepRescheduleConfirmation } from './reschedule-session/step-reschedule-confirmation';
import type { DoctorSchedule, DoctorDailySession } from '../api/types';
import {
  useDoctorRescheduleSessionModal,
  type RescheduleStep
} from '../model/useDoctorRescheduleSessionModal';
import type { DoctorConflictReturnContext } from '../model/useDoctorConflictNavigation';

export type { RescheduleStep };
export type ReturnDoctorContext = DoctorConflictReturnContext;

export interface DoctorRescheduleSessionModalProps {
  doctor: DoctorSchedule | null;
  session?: DoctorDailySession | null;
  isOpen: boolean;
  onClose: () => void;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
  initialDate?: string;
  initialStartTime?: string;
  initialStep?: RescheduleStep;
  onViewDoctorSchedule?: (
    doctorId: string,
    targetSlotTime?: string,
    returnContext?: ReturnDoctorContext
  ) => void;
}

export function DoctorRescheduleSessionModal({
  doctor,
  session,
  isOpen,
  onClose,
  portalContainerRef,
  initialDate,
  initialStartTime,
  initialStep,
  onViewDoctorSchedule
}: DoctorRescheduleSessionModalProps) {
  const {
    step,
    targetDate,
    setTargetDate,
    selectedShift,
    setSelectedShift,
    targetStartTime,
    targetEndTime,
    notes,
    setNotes,
    rescheduleActiveAppointments,
    setRescheduleActiveAppointments,
    unscheduleSourceSlot,
    setUnscheduleSourceSlot,
    effectiveSession,
    isLoadingDetail,
    targetRoomName,
    formattedDisplayDate,
    hasActiveAppointments,
    canProceedNext,
    handleNext,
    handleBack,
    handleFinalSubmit,
    stepMeta,
    isSubmitting,
    isError,
    errorMessage
  } = useDoctorRescheduleSessionModal({
    doctor,
    session,
    isOpen,
    onClose,
    initialDate,
    initialStartTime,
    initialStep,
    onViewDoctorSchedule
  });

  if (!doctor) return null;

  if (!effectiveSession) {
    if (isLoadingDetail) {
      return (
        <ModalWrapper
          isOpen={isOpen}
          onClose={onClose}
          maxWidth='max-w-[508px]'
          showCloseButton={false}
          portalContainerRef={portalContainerRef}
          className='h-auto max-h-none overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6 w-full my-auto shadow-2xl'
        >
          <div className='p-6 space-y-4'>
            <Skeleton className='h-8 w-1/2' />
            <Skeleton className='h-24 w-full rounded-xl' />
            <Skeleton className='h-48 w-full rounded-xl' />
          </div>
        </ModalWrapper>
      );
    }
    return null;
  }

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

        {step === 'date' && (
          <div className='w-full p-2.5 rounded-xl bg-muted/30 border border-border/50 text-xs space-y-1.5 shrink-0'>
            <div className='flex items-center justify-between gap-2'>
              <div className='flex items-center gap-1.5 font-semibold text-foreground truncate'>
                <Icons.calendar className='size-3.5 text-primary shrink-0' />
                <span className='truncate'>
                  {effectiveSession.nama_sesi}
                  {initialStartTime ? (
                    <>
                      {' '}
                      &bull; <span className='font-mono'>{initialStartTime}</span>
                    </>
                  ) : (
                    <>
                      {' '}
                      ({effectiveSession.jam_mulai} - {effectiveSession.jam_selesai})
                    </>
                  )}
                </span>
              </div>
              <StatusBadge status={effectiveSession.status_sesi} size='sm' className='shrink-0' />
            </div>
            <div className='text-[11.5px] text-muted-foreground flex items-center gap-1.5'>
              <Icons.location className='size-3 text-muted-foreground/70 shrink-0' />
              <span className='truncate'>
                {effectiveSession.ruang || doctor.ruang_praktik || 'Ruang Praktik'}
              </span>
            </div>
          </div>
        )}

        <div key={step} className='w-full animate-in fade-in-50 duration-200'>
          {step === 'date' && (
            <div className='space-y-4'>
              <BookingDateStep
                dateStr={targetDate}
                setDateStr={(d) => {
                  setTargetDate(d);
                }}
                showHeader={false}
                label='Tanggal Baru*'
                placeholder='Pilih tanggal praktik...'
                id='tanggalTujuanRescheduleTrigger'
                ariaLabel='Tanggal tujuan reschedule'
                disablePastDates={true}
              />

              <StepSessionSelect
                selectedShift={selectedShift}
                onSelectShift={(shift) => setSelectedShift(shift)}
                selectedDate={targetDate}
                formattedDisplayDate={formattedDisplayDate}
                existingSessions={[]}
                doctorName={doctor.nama_dokter}
                showHeader={true}
              />
            </div>
          )}

          {step === 'note' && (
            <StepRescheduleConfirmation
              formattedDisplayDate={formattedDisplayDate}
              targetRoomName={targetRoomName}
              targetStartTime={targetStartTime}
              targetEndTime={targetEndTime}
              targetEndTimeCalculated={targetEndTime}
              notes={notes}
              onNotesChange={setNotes}
              hasActiveAppointments={hasActiveAppointments}
              rescheduleActiveAppointments={rescheduleActiveAppointments}
              onRescheduleActiveAppointmentsChange={setRescheduleActiveAppointments}
              unscheduleSourceSlot={unscheduleSourceSlot}
              onUnscheduleSourceSlotChange={setUnscheduleSourceSlot}
              initialStartTime={initialStartTime}
              sessionStartTime={session?.jam_mulai?.slice(0, 5)}
              isError={isError}
              errorMessage={errorMessage}
            />
          )}
        </div>

        <div className='pt-2 flex items-center justify-between gap-3 select-none shrink-0'>
          <Button
            type='button'
            variant='outline'
            shape='pill'
            size='md'
            onClick={handleBack}
            disabled={isSubmitting}
            leadingIcon={
              step !== 'date' ? <Icons.arrowLeft className='size-3 stroke-[2.5]' /> : undefined
            }
            className='min-w-[100px] cursor-pointer'
          >
            {step === 'date' ? 'Batal' : 'Kembali'}
          </Button>

          {step !== 'note' ? (
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
              {isSubmitting ? 'Menyimpan...' : 'Konfirmasi Reschedule'}
            </Button>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}
