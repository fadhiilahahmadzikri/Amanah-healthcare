'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { FacetedFilter } from '@/shared/ui/faceted-filter';
import { SearchInput } from '@/shared/ui/search-input';
import type { DoctorDailySession, DoctorSchedule } from '../api/types';
import {
  type FilterStatusType,
  PATIENT_STATUS_OPTIONS,
  useDoctorSessionPatients
} from '../model/useDoctorSessionPatients';
import { BookedPatientDetailModal } from './booked-patient-detail-modal';
import { BookedPatientOuterCard } from './booked-patient-outer-card';

export interface DoctorSessionPatientsModalProps {
  doctor: DoctorSchedule;
  session: DoctorDailySession;
  selectedDate?: string;
  slotStartTime?: string;
  slotEndTime?: string;
  sessionShift?: string;
  shiftLabel?: string;
  isOpen: boolean;
  onClose: () => void;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
  onOpenReschedule?: (session: DoctorDailySession) => void;
}

export function DoctorSessionPatientsModal({
  doctor,
  session,
  selectedDate,
  slotStartTime,
  slotEndTime,
  sessionShift,
  shiftLabel,
  isOpen,
  onClose,
  portalContainerRef,
  onOpenReschedule
}: DoctorSessionPatientsModalProps) {
  const doctorId = doctor.id !== '' ? doctor.id : (doctor.practitioner_id ?? '');
  const sessionId = session.id;
  const effectiveShift = sessionShift;

  const {
    selectedStatus,
    setSelectedStatus,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    selectedPatientForDetail,
    setSelectedPatientForDetail,
    patientsList,
    paginatedPatients,
    scheduleDate,
    totalPatients,
    totalPages,
    isLoading,
    isError,
    error,
    refetch,
    isFiltered,
    hasNoPatients,
    resetFilters
  } = useDoctorSessionPatients({
    doctorId,
    sessionId,
    date: selectedDate,
    sessionShift: effectiveShift,
    isOpen,
    slotStartTime,
    initialCapacity: session.kuota_pasien
  });

  const statusFacetOptions = React.useMemo(
    () =>
      PATIENT_STATUS_OPTIONS.filter((opt) => opt.value !== 'all').map((opt) => ({
        value: opt.value,
        label: opt.label,
        dotColor: opt.dotColor
      })),
    []
  );

  const formattedDisplayDate = React.useMemo(() => {
    const rawDate = scheduleDate || selectedDate || session.tanggal || doctor.tanggal_praktik || '';
    if (!rawDate) return '';
    if (
      rawDate.includes('Januari') ||
      rawDate.includes('Februari') ||
      rawDate.includes('Maret') ||
      rawDate.includes('April') ||
      rawDate.includes('Mei') ||
      rawDate.includes('Juni') ||
      rawDate.includes('Juli') ||
      rawDate.includes('Agustus') ||
      rawDate.includes('September') ||
      rawDate.includes('Oktober') ||
      rawDate.includes('November') ||
      rawDate.includes('Desember') ||
      rawDate.includes('Senin') ||
      rawDate.includes('Minggu')
    ) {
      return rawDate;
    }
    const parts = rawDate.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m - 1, d).toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }
    }
    return rawDate;
  }, [scheduleDate, selectedDate, session.tanggal, doctor.tanggal_praktik]);

  const slotTimeDisplay = React.useMemo(() => {
    if (slotStartTime) {
      return slotEndTime ? `${slotStartTime} - ${slotEndTime} WIB` : `${slotStartTime} WIB`;
    }
    return `${session.jam_mulai} - ${session.jam_selesai} WIB`;
  }, [slotStartTime, slotEndTime, session.jam_mulai, session.jam_selesai]);

  const sessionContext = React.useMemo(
    () => ({
      doctorName: doctor.nama_dokter,
      doctorSpecialty: doctor.spesialisasi,
      date: formattedDisplayDate,
      sessionTime: slotTimeDisplay
    }),
    [doctor.nama_dokter, doctor.spesialisasi, formattedDisplayDate, slotTimeDisplay]
  );

  return (
    <>
      <ModalWrapper
        isOpen={isOpen}
        onClose={onClose}
        maxWidth='w-[96vw] max-w-[96vw]'
        className='h-[92vh] max-h-[92vh] flex flex-col p-5 sm:p-6'
        showCloseButton={false}
        portalContainerRef={portalContainerRef}
      >
        <div className='relative font-sans flex flex-col h-full min-h-0 gap-3.5'>
          <div className='flex items-start justify-between gap-4 pb-3 border-b border-border/40 shrink-0'>
            <div className='min-w-0 flex-1 space-y-0.5'>
              <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight truncate'>
                {doctor.nama_dokter}
              </h3>
              <div className='text-xs text-muted-foreground flex items-center gap-2 flex-wrap pt-0.5'>
                <span className='font-semibold text-foreground'>
                  {shiftLabel ? `Shift ${shiftLabel}` : session.nama_sesi}
                </span>
                <span className='text-border/80'>•</span>
                <span className='font-mono font-medium text-foreground'>{slotTimeDisplay}</span>
                {formattedDisplayDate && (
                  <>
                    <span className='text-border/80'>•</span>
                    <span className='font-medium text-foreground'>{formattedDisplayDate}</span>
                  </>
                )}
                {(session.ruang !== '' ? session.ruang : doctor.ruang_praktik) && (
                  <>
                    <span className='text-border/80'>•</span>
                    <span className='font-medium text-muted-foreground'>
                      {session.ruang !== '' ? session.ruang : doctor.ruang_praktik}
                    </span>
                  </>
                )}
              </div>
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

          <div className='flex flex-wrap items-center justify-between gap-2.5 shrink-0'>
            <div className='flex flex-wrap items-center gap-2 flex-1'>
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder='Cari nama / nomor antrean...'
                ariaLabel='Cari pasien'
                className='max-w-[260px]'
              />

              <FacetedFilter<FilterStatusType>
                title='Status'
                icon={Icons.plusCircle}
                mode='single'
                options={statusFacetOptions}
                selectedValues={selectedStatus !== 'all' ? [selectedStatus] : []}
                onSelect={(val) => setSelectedStatus(val)}
                onReset={() => setSelectedStatus('all')}
                resetLabel='Semua Status'
                popoverWidth='w-48'
              />

              {isFiltered && (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  shape='pill'
                  onClick={resetFilters}
                  className='h-8 px-2.5 text-xs border border-dashed border-border text-muted-foreground hover:text-foreground'
                >
                  <Icons.close className='size-3.5 mr-1' />
                  Reset Filter
                </Button>
              )}
            </div>
          </div>

          <div className='flex-1 min-h-0 overflow-y-auto pr-1'>
            {isLoading && patientsList.length === 0 ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5'>
                {['sk-p1', 'sk-p2', 'sk-p3', 'sk-p4', 'sk-p5'].map((skKey) => (
                  <div
                    key={skKey}
                    className='h-44 rounded-2xl border border-border/60 bg-muted/20 animate-pulse p-4 space-y-2'
                  >
                    <div className='h-4 bg-muted/60 rounded w-1/2' />
                    <div className='h-5 bg-muted/80 rounded w-3/4' />
                    <div className='h-3 bg-muted/50 rounded w-full' />
                    <div className='h-3 bg-muted/50 rounded w-2/3' />
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className='p-6 text-center rounded-2xl border border-destructive/30 bg-destructive/5 space-y-2'>
                <Icons.warning className='size-6 text-destructive mx-auto' />
                <p className='text-xs font-bold text-destructive'>
                  Gagal memuat daftar pasien terdaftar
                </p>
                <p className='text-[11px] text-muted-foreground'>
                  {error instanceof Error
                    ? error.message
                    : 'Terjadi kendala saat membaca data dari server.'}
                </p>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  shape='pill'
                  onClick={() => refetch()}
                  className='text-xs mt-2'
                >
                  Coba Lagi
                </Button>
              </div>
            ) : hasNoPatients ? (
              <div className='py-8 px-4 flex items-center justify-center h-full min-h-[200px]'>
                <EmptyState
                  animated
                  title='Belum Ada Pasien Terdaftar'
                  description={
                    slotStartTime
                      ? `Belum ada pasien yang melakukan booking antrean pada jam ${slotStartTime} WIB.`
                      : 'Belum ada pasien yang melakukan booking antrean pada sesi praktik ini.'
                  }
                  className='border-0 bg-transparent py-4'
                />
              </div>
            ) : patientsList.length === 0 ? (
              <div className='py-8 px-4 flex items-center justify-center h-full min-h-[200px]'>
                <EmptyState
                  animated
                  title='Tidak Ada Pasien Ditemukan'
                  description={`Tidak ditemukan pasien dengan filter yang dipilih.`}
                  action={
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      shape='pill'
                      onClick={resetFilters}
                      className='text-xs'
                    >
                      Reset Filter
                    </Button>
                  }
                  className='border-0 bg-transparent py-4'
                />
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5'>
                {paginatedPatients.map((patient) => (
                  <BookedPatientOuterCard
                    key={patient.appointmentId}
                    patient={patient}
                    sessionContext={sessionContext}
                    onSelect={(p) => setSelectedPatientForDetail(p)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className='pt-3 border-t border-border/40 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground shrink-0'>
            <div>
              Menampilkan{' '}
              <span className='font-semibold text-foreground'>{paginatedPatients.length}</span> dari
              total <span className='font-semibold text-foreground'>{totalPatients}</span> pasien
              terdaftar
            </div>

            <div className='flex items-center gap-3 sm:gap-4'>
              {totalPages > 1 && (
                <div className='flex items-center gap-2'>
                  <span className='text-xs font-medium text-foreground whitespace-nowrap'>
                    Halaman <span className='font-semibold'>{currentPage}</span> dari {totalPages}
                  </span>
                  <div className='flex items-center gap-1'>
                    <Button
                      type='button'
                      aria-label='Halaman sebelumnya'
                      variant='outline'
                      size='icon'
                      shape='pill'
                      className='size-7 shadow-2xs border-border/70 text-foreground bg-background/60 hover:bg-background cursor-pointer'
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                    >
                      <Icons.chevronLeft className='size-3.5' />
                    </Button>
                    <Button
                      type='button'
                      aria-label='Halaman berikutnya'
                      variant='outline'
                      size='icon'
                      shape='pill'
                      className='size-7 shadow-2xs border-border/70 text-foreground bg-background/60 hover:bg-background cursor-pointer'
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                    >
                      <Icons.chevronRight className='size-3.5' />
                    </Button>
                  </div>
                </div>
              )}

              <Button
                type='button'
                variant='outline'
                size='md'
                shape='pill'
                onClick={onClose}
                className='px-5 font-semibold cursor-pointer'
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      </ModalWrapper>

      {selectedPatientForDetail && (
        <BookedPatientDetailModal
          patient={selectedPatientForDetail}
          isOpen={Boolean(selectedPatientForDetail)}
          sessionContext={sessionContext}
          onClose={() => setSelectedPatientForDetail(null)}
          doctorId={doctorId}
          sessionId={sessionId}
          portalContainerRef={portalContainerRef}
          onReschedule={
            onOpenReschedule
              ? () => {
                  setSelectedPatientForDetail(null);
                  onClose();
                  onOpenReschedule(session);
                }
              : undefined
          }
          onAppointmentCancelled={() => {
            refetch();
          }}
          onAppointmentUpdated={() => {
            refetch();
          }}
        />
      )}
    </>
  );
}
