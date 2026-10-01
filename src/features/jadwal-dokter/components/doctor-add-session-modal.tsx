'use client';

import React, { useEffect, useState } from 'react';
import { Icons } from '@/components/icons';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BookingDateStep } from '@/features/klinik/components/booking/booking-date-step';
import { parseAsString, useQueryStates } from 'nuqs';
import { cn } from '@/lib/utils';
import type { DoctorSchedule, DoctorDailySession, ClinicRoom } from '../api/types';
import { useDoctorAddSessionModal } from '../model/useDoctorAddSessionModal';
import {
  StepSessionSelect,
  StepSlotGrid,
  StepRoomSelect,
  StepConfirmation
} from './add-session';

export interface ReturnDoctorContext {
  sourceDoctorId: string;
  sourceDoctorName: string;
  sourceDate?: string;
  sourceSlotStartTime?: string;
  sourceSlotEndTime?: string;
}

export interface DoctorAddSessionModalProps {
  doctor: DoctorSchedule | null;
  isOpen: boolean;
  onClose: () => void;
  onSessionAdded?: (session: DoctorDailySession) => void;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
  targetDate?: string;
  initialStartTime?: string;
  initialEndTime?: string;
  onViewDoctorSchedule?: (
    doctorId: string,
    targetSlotTime?: string,
    returnContext?: ReturnDoctorContext
  ) => void;
}

function computeSlotDurationText(startTime: string, endTime: string): string {
  if (!startTime || !endTime || startTime === '--:--' || endTime === '--:--') return 'WIB';
  const [h1, m1] = startTime.split(':').map((v) => parseInt(v, 10));
  const [h2, m2] = endTime.split(':').map((v) => parseInt(v, 10));
  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return 'WIB';
  const diff = h2 * 60 + m2 - (h1 * 60 + m1);
  if (diff > 0) return `${diff} Menit`;
  return 'WIB';
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
  onViewDoctorSchedule
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

  const [selectedConflictRoom, setSelectedConflictRoom] = useState<ClinicRoom | null>(null);

  const [, setParams] = useQueryStates(
    {
      selectedDoctorId: parseAsString.withDefault(''),
      highlightSlotTime: parseAsString.withDefault('')
    },
    { shallow: true }
  );

  useEffect(() => {
    if (step !== 'room') {
      setSelectedConflictRoom(null);
    }
  }, [step]);

  if (!doctor) return null;

  const conflictDetails = selectedConflictRoom?.occupantDetails;
  const occupantDoctorName =
    conflictDetails?.practitionerName ||
    selectedConflictRoom?.occupiedBy ||
    'Dokter Lain';
  const occupantSpecialty =
    conflictDetails?.specialty ||
    conflictDetails?.unitName ||
    'Dokter Spesialis';
  const unitName = conflictDetails?.unitName || null;
  const roomName =
    conflictDetails?.roomName || selectedConflictRoom?.name || 'Ruang Praktik';

  const displaySlotStartTime =
    selectedSlot?.time ||
    initialStartTime ||
    conflictDetails?.startTime ||
    '--:--';
  const displaySlotEndTime =
    selectedSlot?.endTime ||
    initialEndTime ||
    conflictDetails?.endTime ||
    '--:--';
  const durationText = computeSlotDurationText(displaySlotStartTime, displaySlotEndTime);

  const occupantDoctorId =
    conflictDetails?.staffProfileId ||
    conflictDetails?.practitionerId ||
    null;

  const handleViewOccupantDoctorSchedule = (targetDoctorId: string) => {
    setSelectedConflictRoom(null);
    onClose();
    const targetSlotTime =
      selectedSlot?.time || initialStartTime || conflictDetails?.startTime;
    const returnContext: ReturnDoctorContext | undefined = doctor
      ? {
          sourceDoctorId: doctor.id,
          sourceDoctorName: doctor.nama_dokter,
          sourceDate: targetDate || selectedDate,
          sourceSlotStartTime: displaySlotStartTime !== '--:--' ? displaySlotStartTime : undefined,
          sourceSlotEndTime: displaySlotEndTime !== '--:--' ? displaySlotEndTime : undefined
        }
      : undefined;

    if (onViewDoctorSchedule) {
      onViewDoctorSchedule(targetDoctorId, targetSlotTime, returnContext);
    } else {
      setParams(
        {
          selectedDoctorId: targetDoctorId,
          highlightSlotTime: targetSlotTime || null
        },
        { shallow: true }
      );
    }
  };

  const occupantInitials =
    occupantDoctorName
      .replace(/^dr\.\s*/i, '')
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((n: string) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'DR';

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={() => {
        setSelectedConflictRoom(null);
        onClose();
      }}
      maxWidth={selectedConflictRoom ? 'max-w-[870px]' : 'max-w-[508px]'}
      showCloseButton={false}
      portalContainerRef={portalContainerRef}
      backdropClassName='overflow-hidden'
      className={cn(
        'h-auto max-h-none overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6 w-full transition-[max-width,width] duration-300 ease-out my-auto shadow-2xl',
        selectedConflictRoom ? 'max-w-[870px]' : 'max-w-[508px]'
      )}
    >
      <div
        className={cn(
          'grid grid-cols-1 items-stretch gap-6 min-h-[480px]',
          selectedConflictRoom ? 'md:grid-cols-[460px_340px]' : 'md:grid-cols-[460px]'
        )}
      >
        <div className='w-full flex flex-col font-sans select-none justify-between h-full min-h-0'>
          <div className='pr-1 flex-1 overflow-y-auto min-h-0'>
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
                onSelectRoomId={(id) => {
                  setSelectedRoomId(id);
                  setSelectedConflictRoom(null);
                }}
                doctorName={doctor.nama_dokter}
                isLoading={isLoadingRooms}
                onViewConflict={(room) => setSelectedConflictRoom(room)}
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

          {/* Stepper Navigation Footer */}
          <div className='pt-4 flex items-center justify-between gap-3 border-t border-border/40 select-none shrink-0 mt-auto'>
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
                trailingIcon={<Icons.arrowUpRight className='size-3 stroke-[2.5]' />}
                className='min-w-[160px] cursor-pointer'
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Jadwal Praktik'}
              </Button>
            )}
          </div>
        </div>

        {/* Extendable Conflict Inspector Side Panel */}
        {selectedConflictRoom && (
          <div className='w-full flex flex-col border-t md:border-t-0 md:border-l border-border/50 md:pl-6 pt-4 md:pt-0 font-sans select-none justify-between h-full min-h-0 animate-in fade-in-0 slide-in-from-right-3 duration-300 ease-out'>
            {/* Top Header */}
            <div className='flex items-center justify-between gap-2 pb-3 border-b border-border/40 shrink-0'>
              <div>
                <h5 className='text-sm font-bold text-foreground tracking-tight'>
                  Penggunaan Ruangan
                </h5>
                <p className='text-xs text-muted-foreground'>
                  {selectedConflictRoom.name}
                </p>
              </div>
              <button
                type='button'
                onClick={() => setSelectedConflictRoom(null)}
                className='p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer'
                aria-label='Tutup panel detail'
              >
                <Icons.close className='size-4' />
              </button>
            </div>

            {/* Body: Doctor Info + Janji Temu Style Jam Praktik + Room Details - ZERO PILLS */}
            <div className='space-y-3 py-3 flex-1 overflow-y-auto min-h-0'>
              {/* Doctor Identity */}
              <div className='flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/40'>
                <Avatar className='size-10 rounded-full border border-border/60 bg-muted shrink-0'>
                  <AvatarFallback className='bg-primary/10 text-primary font-bold text-xs'>
                    {occupantInitials}
                  </AvatarFallback>
                </Avatar>

                <div className='min-w-0 flex-1'>
                  <h6 className='text-sm font-bold text-foreground truncate'>
                    {occupantDoctorName}
                  </h6>
                  <p className='text-xs text-muted-foreground truncate'>
                    {occupantSpecialty}
                  </p>
                </div>
              </div>

              {/* Jam Praktik Visual Component ala Janji Temu */}
              <div className='flex items-center justify-between bg-muted/20 p-3 sm:p-3.5 rounded-xl border border-border/50'>
                <div className='flex flex-col items-start min-w-[55px]'>
                  <span className='text-lg sm:text-xl font-bold font-mono text-foreground leading-tight tracking-tight'>
                    {displaySlotStartTime}
                  </span>
                  <span className='text-[11px] font-normal text-muted-foreground mt-0.5'>Mulai</span>
                </div>

                <div className='flex-1 flex flex-col items-center px-2.5'>
                  <span className='text-[11px] font-semibold text-muted-foreground mb-1 font-mono'>
                    {durationText}
                  </span>
                  <div className='w-full flex items-center justify-center relative'>
                    <span className='size-1.5 rounded-full bg-border shrink-0' />
                    <div className='flex-1 border-t border-dashed border-border/80 mx-1.5' />
                    <span className='size-1.5 rounded-full bg-border shrink-0' />
                  </div>
                  <span className='text-[10.5px] font-semibold text-destructive mt-1 truncate max-w-full'>
                    Sedang Digunakan
                  </span>
                </div>

                <div className='flex flex-col items-end min-w-[55px]'>
                  <span className='text-lg sm:text-xl font-bold font-mono text-foreground leading-tight tracking-tight'>
                    {displaySlotEndTime}
                  </span>
                  <span className='text-[11px] font-normal text-muted-foreground mt-0.5'>Selesai</span>
                </div>
              </div>

              {/* Structured Text-Based Details: Room & Poliklinik */}
              <div className='grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-muted/15 border border-border/40 text-xs'>
                <div>
                  <span className='text-muted-foreground font-medium'>Ruang Praktik</span>
                  <p className='font-semibold text-foreground mt-0.5 truncate'>{roomName}</p>
                </div>
                <div>
                  <span className='text-muted-foreground font-medium'>Poliklinik / Unit</span>
                  <p className='font-semibold text-foreground mt-0.5 truncate'>
                    {unitName || occupantSpecialty}
                  </p>
                </div>
              </div>

              {/* Notice Text */}
              <p className='text-xs text-muted-foreground leading-relaxed px-0.5'>
                Ruangan ini tidak dapat dijadwalkan pada jam {displaySlotStartTime} - {displaySlotEndTime} WIB karena sedang digunakan oleh {occupantDoctorName}{conflictDetails?.startTime && conflictDetails?.endTime ? ` (${conflictDetails.startTime} - ${conflictDetails.endTime} WIB)` : ''}. Anda dapat memilih ruangan lain atau jam berbeda.
              </p>
            </div>

            {/* Panel Footer: EXACT SAME SHAPE & SIZE AS WIZARD FOOTER - PINNED TO BOTTOM */}
            <div className='pt-4 flex items-center justify-end gap-2.5 border-t border-border/40 shrink-0 mt-auto'>
              <Button
                type='button'
                variant='outline'
                shape='pill'
                size='md'
                onClick={() => setSelectedConflictRoom(null)}
                className='cursor-pointer min-w-[80px]'
              >
                Tutup
              </Button>

              {occupantDoctorId && (
                <Button
                  type='button'
                  variant='primary'
                  shape='pill'
                  size='md'
                  onClick={() => handleViewOccupantDoctorSchedule(occupantDoctorId)}
                  withTrailingCircleIcon={true}
                  trailingIcon={<Icons.calendar className='size-3 stroke-[2.5]' />}
                  className='cursor-pointer'
                >
                  Lihat Detail Jadwal
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
}
