'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { sessionPatientsQueryOptions } from '../api/queries';
import { BookedPatientOuterCard } from './booked-patient-outer-card';
import { BookedPatientDetailModal } from './booked-patient-detail-modal';
import { cn } from '@/lib/utils';
import type { DoctorSchedule, DoctorDailySession } from '../api/types';
import type { BookedPatientItem } from '@/server/contracts/schedules/doctor-schedules.dto';

export interface DoctorSessionPatientsModalProps {
  doctor: DoctorSchedule;
  session: DoctorDailySession;
  isOpen: boolean;
  onClose: () => void;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
}

type FilterStatusType = 'all' | 'waiting' | 'in_service' | 'no_show' | 'completed' | 'cancelled';

const FILTER_TABS: { id: FilterStatusType; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'waiting', label: 'Menunggu' },
  { id: 'in_service', label: 'Di Sesi' },
  { id: 'no_show', label: 'Terlambat' },
  { id: 'completed', label: 'Selesai' },
  { id: 'cancelled', label: 'Batal' }
];

export function DoctorSessionPatientsModal({
  doctor,
  session,
  isOpen,
  onClose,
  portalContainerRef
}: DoctorSessionPatientsModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<FilterStatusType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientForDetail, setSelectedPatientForDetail] =
    useState<BookedPatientItem | null>(null);

  const doctorId = doctor.id || doctor.practitioner_id || '';
  const sessionId = session.id;

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // TanStack React Query (SSOT Consumer - strictly no mock fallback)
  const {
    data: sessionData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    ...sessionPatientsQueryOptions(doctorId, sessionId, {
      status: selectedStatus,
      search: searchQuery.trim() || undefined
    }),
    enabled: isOpen && Boolean(doctorId && sessionId)
  });

  const patientsList: BookedPatientItem[] = sessionData?.patients || [];
  const capacity = sessionData?.capacity ?? session.kuota_pasien ?? 12;
  const bookedCount = sessionData?.bookedCount ?? patientsList.length;
  const availableSlots = sessionData?.availableSlots ?? Math.max(0, capacity - bookedCount);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, searchQuery]);

  const totalPatients = patientsList.length;
  const totalPages = Math.max(1, Math.ceil(totalPatients / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPatients = patientsList.slice(startIndex, startIndex + pageSize);

  return (
    <>
      <ModalWrapper
        isOpen={isOpen}
        onClose={onClose}
        maxWidth='max-w-[1140px]'
        showCloseButton={false}
        portalContainerRef={portalContainerRef}
      >
        <div className='relative font-sans space-y-4 max-h-[88vh] flex flex-col'>
          {/* 1. Header: Doctor Identity, Session Shift & Capacity Metrics */}
          <div className='flex items-start justify-between gap-4 pb-3.5 border-b border-border/40 shrink-0'>
            <div className='min-w-0 flex-1 space-y-0.5'>
              <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight truncate'>
                {doctor.nama_dokter}
              </h3>
              <div className='text-xs text-muted-foreground flex items-center gap-2 flex-wrap pt-0.5'>
                <span>
                  Sesi:{' '}
                  <strong className='text-foreground font-semibold'>{session.nama_sesi}</strong>
                </span>
                <span className='text-border/80'>|</span>
                <span>
                  Jam:{' '}
                  <strong className='text-foreground font-mono font-semibold'>
                    {session.jam_mulai} - {session.jam_selesai} WIB
                  </strong>
                </span>
                <span className='text-border/80'>|</span>
                <span>
                  Ruangan:{' '}
                  <strong className='text-foreground font-semibold'>
                    {session.ruang || doctor.ruang_praktik || '-'}
                  </strong>
                </span>
              </div>
            </div>

            <div className='flex items-center gap-3 shrink-0'>
              <div className='text-right'>
                <div className='text-xs sm:text-sm font-bold font-mono text-foreground'>
                  {bookedCount} / {capacity} Sesi Terisi
                </div>
                <div className='text-[10.5px] font-mono text-muted-foreground'>
                  {availableSlots} slot tersedia
                </div>
              </div>

              <button
                type='button'
                onClick={onClose}
                aria-label='Tutup'
                className='rounded-full p-1.5 text-muted-foreground hover:bg-muted transition-colors cursor-pointer shrink-0'
              >
                <Icons.close className='size-4' />
              </button>
            </div>
          </div>

          {/* 2. Controls Toolbar: Status Filter Tabs & Search Bar */}
          <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0'>
            {/* Status Filter Tabs */}
            <div className='flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none'>
              {FILTER_TABS.map((tab) => {
                const isActive = selectedStatus === tab.id;
                return (
                  <button
                    key={tab.id}
                    type='button'
                    onClick={() => setSelectedStatus(tab.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-2xs font-bold'
                        : 'bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground border border-border/50'
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className='relative w-full sm:w-64'>
              <Icons.search className='absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none' />
              <input
                type='text'
                aria-label='Cari nama atau nomor antrean pasien'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Cari nama / nomor antrean...'
                className='w-full text-xs pl-8 pr-3 py-1.5 rounded-full border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary'
              />
            </div>
          </div>

          {/* 3. Main Content: 5-Column Responsive Patient Grid */}
          <div className='flex-1 overflow-y-auto min-h-[280px] pr-1'>
            {isLoading ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3'>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div
                    key={`skeleton-patient-${idx}`}
                    className='h-36 rounded-2xl border border-border/60 bg-muted/20 animate-pulse p-3 space-y-2'
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
            ) : patientsList.length === 0 ? (
              <div className='p-8 text-center rounded-2xl border border-dashed border-border/70 bg-muted/10 space-y-2'>
                <Icons.user className='size-8 text-muted-foreground/60 mx-auto' />
                <h4 className='text-xs sm:text-sm font-bold text-foreground'>
                  Tidak ada pasien terdaftar
                </h4>
                <p className='text-xs text-muted-foreground max-w-sm mx-auto'>
                  {searchQuery
                    ? `Tidak ditemukan pasien dengan kata kunci "${searchQuery}".`
                    : selectedStatus !== 'all'
                      ? `Tidak ada pasien dengan status "${selectedStatus}" pada sesi ini.`
                      : 'Belum ada pasien yang melakukan booking antrean pada sesi ini.'}
                </p>
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3'>
                {paginatedPatients.map((patient) => (
                  <BookedPatientOuterCard
                    key={patient.appointmentId}
                    patient={patient}
                    onSelect={(p) => setSelectedPatientForDetail(p)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 4. Footer Summary & Pagination Controls */}
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
                      className='size-7 shadow-2xs border-border/70 text-foreground bg-background/60 hover:bg-background'
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
                      className='size-7 shadow-2xs border-border/70 text-foreground bg-background/60 hover:bg-background'
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
                size='sm'
                shape='pill'
                onClick={onClose}
                className='px-4 font-medium'
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      </ModalWrapper>

      {/* Sub-Modal: Demografis Lengkap & Aksi Pembatalan */}
      {selectedPatientForDetail && (
        <BookedPatientDetailModal
          patient={selectedPatientForDetail}
          isOpen={Boolean(selectedPatientForDetail)}
          onClose={() => setSelectedPatientForDetail(null)}
          doctorId={doctorId}
          sessionId={sessionId}
          portalContainerRef={portalContainerRef}
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
