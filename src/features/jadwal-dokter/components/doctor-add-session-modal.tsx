'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { BookingDateStep } from '@/features/klinik/components/booking/booking-date-step';
import type { DoctorSchedule, DoctorDailySession } from '../api/types';
import { useDoctorAddSessionModal } from '../model/useDoctorAddSessionModal';
import {
  StepSessionSelect,
  StepSlotGrid,
  StepRoomSelect,
  StepConfirmation
} from './add-session';

export interface DoctorAddSessionModalProps {
  doctor: DoctorSchedule | null;
  isOpen: boolean;
  onClose: () => void;
  onSessionAdded?: (session: DoctorDailySession) => void;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
  targetDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
}

export function DoctorAddSessionModal({
  doctor,
  isOpen,
  onClose,
  onSessionAdded,
  portalContainerRef,
  targetDate,
  initialStartTime,
  initialEndTime
}: DoctorAddSessionModalProps) {
  const {
    step,
    selectedDate,
    setSelectedDate,
    formattedDisplayDate,
    selectedShift,
    setSelectedShift,
    selectedSlot,
    setSelectedSlot,
    selectedRoomId,
    setSelectedRoomId,
    selectedRoom,
    isSubmitting,
    rooms,
    isLoadingRooms,
    slotAvailability,
    isLoadingSlots,
    canProceedNext,
    isFirstStep,
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
    initialEndTime
  });

  if (!doctor) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-[500px]'
      showCloseButton={false}
      portalContainerRef={portalContainerRef}
      backdropClassName='overflow-hidden'
      className='h-auto max-h-none overflow-visible rounded-2xl border border-border bg-card p-5 sm:p-6 w-full max-w-[500px] my-auto shadow-2xl'
    >
      <div className='flex flex-col font-sans select-none h-auto min-h-0 gap-4 justify-start'>
        {/* Direct to Step Content - No Redundant Top Header, Perfectly Hugged with Morphing */}
        <div className='pr-1 h-auto overflow-visible'>
          {step === 'date' && (
            <BookingDateStep
              dateStr={selectedDate}
              setDateStr={setSelectedDate}
              title='Pilih tanggal praktik dokter'
              subtitle={`Tentukan tanggal periksa dokter ${doctor.nama_dokter} yang ingin ditambahkan jadwalnya.`}
              label='Tanggal praktik dokter*'
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
              existingSessions={doctor.sesi_harian}
              doctorName={doctor.nama_dokter}
            />
          )}

          {step === 'slot' && selectedShift && (
            <StepSlotGrid
              selectedShift={selectedShift}
              selectedSlot={selectedSlot}
              onSelectSlot={(slot) => setSelectedSlot(slot)}
              slotAvailability={slotAvailability}
              isLoadingSlots={isLoadingSlots}
              doctorName={doctor.nama_dokter}
            />
          )}

          {step === 'room' && (
            <StepRoomSelect
              rooms={rooms}
              selectedRoomId={selectedRoomId}
              onSelectRoomId={setSelectedRoomId}
              doctorName={doctor.nama_dokter}
              isLoading={isLoadingRooms}
            />
          )}

          {step === 'confirmation' && (
            <StepConfirmation
              doctor={doctor}
              formattedDisplayDate={formattedDisplayDate}
              selectedShift={selectedShift}
              selectedSlot={selectedSlot}
              selectedRoom={selectedRoom}
            />
          )}
        </div>

        {/* Footer Actions (Stepper Navigation) */}
        <div className='pt-3 flex items-center justify-between gap-3 border-t border-border/40 select-none'>
          <Button
            type='button'
            variant='outline'
            shape='pill'
            size='md'
            onClick={handleBack}
            disabled={isSubmitting}
            leadingIcon={!isFirstStep ? <Icons.arrowLeft className='size-3 stroke-[2.5]' /> : undefined}
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
              trailingIcon={<Icons.arrowUpRight className='size-3 stroke-[2.5]' />}
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
