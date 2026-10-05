'use client';

import React, { useMemo, useCallback } from 'react';
import { Icons } from '@/components/icons';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { BookingDateStep } from '@/features/klinik/components/booking/booking-date-step';
import { parseAsString, useQueryStates } from 'nuqs';
import { cn } from '@/lib/utils';
import type { DoctorSchedule, DoctorDailySession } from '../api/types';
import { useDoctorAddSessionModal, type AddSessionStep } from '../model/useDoctorAddSessionModal';
import {
  useDoctorConflictNavigation,
  type DoctorConflictReturnContext
} from '../model/useDoctorConflictNavigation';
import { DOCTOR_DIALOG_TYPE, WIZARD_STEP } from '../constants/doctor-dialog.constants';
import {
  ALL_SCHEDULE_SHIFTS,
  SCHEDULE_SHIFT_LABELS,
  SCHEDULE_SHIFT_BOUNDARIES
} from '../constants/schedule-shift.constants';
import { StepRoomSelect } from './add-session/step-room-select';
import { StepConfirmation } from './add-session/step-confirmation';
import { DoctorGridSlotItem, type GridSlotData } from './grid/doctor-grid-slot-item';

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
  initialStep,
  onViewDoctorSchedule
}: DoctorAddSessionModalProps) {
  const conflictNav = useDoctorConflictNavigation();
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
    availableSlots,
    isLoadingSlots,
    canProceedNext,
    isFirstStep,
    isDirectSlotMode,
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

  const [, setParams] = useQueryStates(
    {
      selectedDoctorId: parseAsString.withDefault(''),
      highlightSlotTime: parseAsString.withDefault(''),
      dialog: parseAsString.withDefault('')
    },
    { shallow: true }
  );

  const handleViewOccupantDoctorSchedule = useCallback(
    (occupantDoctorId?: string | null, slotTime?: string) => {
      if (!occupantDoctorId || !doctor) return;

      const context: DoctorConflictReturnContext = {
        sourceDoctorId: doctor.id,
        sourceDoctorName: doctor.nama_dokter,
        sourceDate: selectedDate,
        sourceSlotStartTime: selectedSlot?.time || initialStartTime,
        sourceSlotEndTime: selectedSlot?.endTime || initialEndTime,
        sourceRoomId: selectedRoomId,
        wizardType: DOCTOR_DIALOG_TYPE.WIZARD_ADD_SESSION,
        initialStep: step === 'slot' ? WIZARD_STEP.SLOT : WIZARD_STEP.ROOM
      };

      conflictNav.inspectConflictDoctor({
        occupantDoctorId,
        targetSlotTime: slotTime,
        context,
        onNavigate: (id, time) => {
          onClose();
          if (onViewDoctorSchedule) {
            onViewDoctorSchedule(id, time, context);
          } else {
            setParams(
              {
                selectedDoctorId: id,
                highlightSlotTime: time || null,
                dialog: DOCTOR_DIALOG_TYPE.DETAIL_SHEET
              },
              { shallow: true }
            );
          }
        }
      });
    },
    [doctor, onClose, onViewDoctorSchedule, selectedDate, selectedSlot, setParams, conflictNav]
  );

  const shiftBounds = SCHEDULE_SHIFT_BOUNDARIES[selectedShift];

  const stepMeta = useMemo(() => {
    const docName = doctor?.nama_dokter ? `dokter ${doctor.nama_dokter}` : 'dokter';
    switch (step) {
      case 'date':
        return {
          title: 'Pilih Tanggal Praktik',
          subtitle: `Tentukan tanggal praktik ${docName} yang ingin ditambahkan jadwalnya.`
        };
      case 'room':
        return {
          title: 'Pilih Ruangan Praktik',
          subtitle:
            isDirectSlotMode && selectedSlot
              ? `Tentukan ruangan poliklinik untuk jadwal ${selectedSlot.time} - ${selectedSlot.endTime} WIB.`
              : `Tentukan ruangan poliklinik tempat ${docName} akan bertugas.`
        };
      case 'slot':
        return {
          title: 'Pilih Jam Praktik',
          subtitle: `Pilih jam praktik dokter pada rentang ${shiftBounds.timeRange}.`
        };
      case 'confirmation':
        return {
          title: 'Konfirmasi Jadwal Praktik',
          subtitle: `Periksa kembali rincian sesi ${docName} sebelum menyimpan jadwal.`
        };
    }
  }, [step, doctor?.nama_dokter, isDirectSlotMode, selectedSlot, shiftBounds.timeRange]);

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
        {/* Top Header - Unified matching Reschedule */}
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

        {/* Wizard Steps Content */}
        <div key={step} className='w-full animate-in fade-in-50 duration-200'>
          {/* STEP 1: Tanggal Praktik */}
          {step === 'date' && (
            <BookingDateStep
              dateStr={selectedDate}
              setDateStr={(d) => {
                setSelectedDate(d);
                setSelectedSlot(null);
              }}
              showHeader={false}
              label='Tanggal Praktik Dokter*'
              placeholder='Pilih tanggal praktik...'
              id='tanggalPraktikDoctorTrigger'
              ariaLabel='Tanggal praktik dokter'
              disablePastDates={true}
            />
          )}

          {/* STEP 2: Ruang Praktik */}
          {step === 'room' && (
            <StepRoomSelect
              rooms={rooms}
              selectedRoomId={selectedRoomId}
              onSelectRoomId={(id) => {
                setSelectedRoomId(id);
                if (!isDirectSlotMode) {
                  setSelectedSlot(null);
                }
              }}
              doctorName={doctor.nama_dokter}
              isLoading={isLoadingRooms}
              showHeader={false}
            />
          )}

          {/* STEP 3: Jam Mulai (Grid-Based with Shift Switcher) */}
          {step === 'slot' && (
            <div className='space-y-3.5'>
              {/* Shift Selector Switcher */}
              <div className='grid grid-cols-4 gap-1 p-1 rounded-xl bg-muted/40 border border-border/40'>
                {ALL_SCHEDULE_SHIFTS.map((shiftKey) => {
                  const isActive = selectedShift === shiftKey;
                  return (
                    <button
                      key={shiftKey}
                      type='button'
                      onClick={() => {
                        setSelectedShift(shiftKey);
                        setSelectedSlot(null);
                      }}
                      className={cn(
                        'py-1.5 px-1 rounded-lg text-xs font-semibold transition-all text-center cursor-pointer truncate',
                        isActive
                          ? 'bg-card text-foreground shadow-xs font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {SCHEDULE_SHIFT_LABELS[shiftKey]}
                    </button>
                  );
                })}
              </div>

              {/* Grid of Slots */}
              {isLoadingSlots && availableSlots.length === 0 ? (
                <div className='grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[42vh] overflow-y-auto pr-1'>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className='h-[56px] w-full rounded-xl' />
                  ))}
                </div>
              ) : availableSlots.length === 0 ? (
                <EmptyState
                  animated
                  title='Tidak Ada Slot Pada Sesi Ini'
                  description='Silakan beralih ke sesi lain untuk melihat ketersediaan slot.'
                  className='border-0 bg-transparent py-2 min-h-0'
                  animationClassName='w-32 h-32 sm:w-36 sm:h-36'
                />
              ) : (
                <div className='grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[42vh] overflow-y-auto pr-1'>
                  {availableSlots.map((rawSlot) => {
                    const isSelected = selectedSlot?.time === rawSlot.time;
                    const isPurpleConflict = rawSlot.status === 'OCCUPIED_BY_OTHER';
                    const isClickable = rawSlot.isAvailable || isPurpleConflict;

                    const occupancySlot: GridSlotData = {
                      slotIndex: rawSlot.slotIndex,
                      startTime: rawSlot.time,
                      endTime: rawSlot.endTime,
                      status: rawSlot.isAvailable
                        ? 'AVAILABLE'
                        : isPurpleConflict
                          ? 'OCCUPIED_BY_OTHER'
                          : rawSlot.status || 'CLOSED',
                      isAvailable: rawSlot.isAvailable,
                      displayLabel:
                        rawSlot.displayLabel || (rawSlot.isAvailable ? 'Tersedia' : 'Terisi'),
                      isClickable,
                      uiVariant: rawSlot.isAvailable
                        ? 'available'
                        : isPurpleConflict
                          ? 'purple_other'
                          : 'neutral_disabled',
                      uiStatus: rawSlot.isAvailable
                        ? 'AVAILABLE'
                        : isPurpleConflict
                          ? 'OCCUPIED_BY_OTHER'
                          : 'CLOSED',
                      conflictInfo: rawSlot.conflict
                        ? {
                            type: rawSlot.conflict.type,
                            occupantName: rawSlot.conflict.occupantName ?? undefined
                          }
                        : null
                    };

                    return (
                      <DoctorGridSlotItem
                        key={`${rawSlot.slotIndex}-${rawSlot.time}`}
                        slot={occupancySlot}
                        isFinished={false}
                        isNow={false}
                        isClickable={isClickable}
                        isSelected={isSelected}
                        onSlotClick={() => {
                          if (rawSlot.isAvailable) {
                            setSelectedSlot({ time: rawSlot.time, endTime: rawSlot.endTime });
                          } else if (isPurpleConflict) {
                            const occupantId =
                              rawSlot.conflict?.practitionerId ||
                              rawSlot.conflict?.staffId;
                            if (occupantId) {
                              handleViewOccupantDoctorSchedule(occupantId, rawSlot.time);
                            }
                          }
                        }}
                      />
                    );
                  })}
                </div>
              )}

              {/* Selected Slot Information Display */}
              {selectedSlot && (
                <div className='flex items-center justify-between p-2.5 rounded-xl border border-primary/30 bg-primary/5 text-xs'>
                  <span className='font-semibold text-foreground'>Slot Terpilih:</span>
                  <span className='font-mono font-bold text-primary'>
                    {selectedSlot.time} - {selectedSlot.endTime} WIB
                  </span>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Konfirmasi */}
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

        {/* Stepper Navigation Footer - Unified matching Reschedule */}
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
