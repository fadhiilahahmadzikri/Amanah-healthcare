'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { AppointmentStatusPill } from '@/features/klinik/components/appointment-card/atoms/appointment-status-pill';
import { AppointmentDetailOrganism } from '@/features/klinik/components/appointment-card/organisms/appointment-detail-organism';
import { adminAppointmentToAppointment } from '@/features/appointment-pasien/api/mapper';
import { appointmentDetailQueryOptions } from '@/features/appointment-pasien/api/queries';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import { formatClinicDate } from '@/lib/date-format';
import { INDONESIAN_MONTH_NAMES } from '@/components/ui/custom-month-picker';
import { cn } from '@/lib/utils';
import type { Patient } from '@/features/data-pasien/api/types';
import { patientAppointmentHistoryQueryOptions } from '../api/queries';
import type { HistoricalPatientAppointment } from '../api/types';

export interface PatientHistoryGridModalProps {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
}

export function PatientHistoryGridModal({
  isOpen,
  patient,
  onClose
}: PatientHistoryGridModalProps) {
  const currentMonthIso = useMemo(() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    return `${now.getFullYear()}-${mm}`;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthIso);
  const [isAllMonths, setIsAllMonths] = useState<boolean>(false);
  const [isMonthPopoverOpen, setIsMonthPopoverOpen] = useState<boolean>(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  // Parse viewing year & month for floating Popover
  const { selectedYear, selectedMonthIndex } = useMemo(() => {
    if (selectedMonth && /^\d{4}-\d{2}$/.test(selectedMonth)) {
      const parts = selectedMonth.split('-');
      return {
        selectedYear: parseInt(parts[0], 10),
        selectedMonthIndex: parseInt(parts[1], 10) - 1
      };
    }
    const now = new Date();
    return { selectedYear: now.getFullYear(), selectedMonthIndex: now.getMonth() };
  }, [selectedMonth]);

  const [viewingYear, setViewingYear] = useState<number>(selectedYear);

  React.useEffect(() => {
    setViewingYear(selectedYear);
  }, [selectedYear]);

  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = 2035; y >= 2020; y--) {
      years.push(y);
    }
    return years;
  }, []);

  const displayMonthLabel = useMemo(() => {
    if (selectedMonthIndex >= 0 && selectedMonthIndex < 12) {
      return `${INDONESIAN_MONTH_NAMES[selectedMonthIndex]} ${selectedYear}`;
    }
    return selectedMonth;
  }, [selectedMonthIndex, selectedYear, selectedMonth]);

  const patientId = patient?.id || '';

  // 1. Fetch patient's terminal historical appointments
  const { data: historyData, isLoading } = useQuery({
    ...patientAppointmentHistoryQueryOptions(patientId),
    enabled: Boolean(isOpen && patientId)
  });

  const appointments = useMemo<HistoricalPatientAppointment[]>(() => {
    return historyData?.data || [];
  }, [historyData?.data]);

  // 2. Filter visits by month or all
  const filteredAppointments = useMemo(() => {
    if (isAllMonths) return appointments;
    return appointments.filter((apt) => {
      if (!apt.scheduledDate) return false;
      return apt.scheduledDate.startsWith(selectedMonth);
    });
  }, [appointments, isAllMonths, selectedMonth]);

  // 3. Query selected appointment detail for the Level 2 modal
  const { data: selectedAdminAppointment } = useQuery({
    ...appointmentDetailQueryOptions(selectedAppointmentId || ''),
    enabled: Boolean(selectedAppointmentId)
  });

  const adaptedAppointment = useMemo(() => {
    if (!selectedAdminAppointment?.appointment) return null;
    return adminAppointmentToAppointment(selectedAdminAppointment.appointment);
  }, [selectedAdminAppointment]);

  const handleSelectMonth = (monthIdx: number) => {
    const mm = String(monthIdx + 1).padStart(2, '0');
    const newMonthIso = `${viewingYear}-${mm}`;
    setSelectedMonth(newMonthIso);
    setIsAllMonths(false);
    setIsMonthPopoverOpen(false);
  };

  if (!patient) return null;

  const fullName = patient.name || 'Pasien';
  const rmNumber = patient.patient_id || patient.medical_record_number || '-';
  const nik = patient.nik || patient.masked_nik || '-';
  const gender =
    patient.gender === 'female' || (patient.gender as string) === 'Perempuan'
      ? 'Perempuan'
      : patient.gender === 'male' || (patient.gender as string) === 'Laki-laki'
        ? 'Laki-laki'
        : null;

  return (
    <>
      <ModalWrapper
        isOpen={isOpen}
        onClose={onClose}
        maxWidth='max-w-[92vw] w-[92vw]'
        showCloseButton={false}
        className='flex flex-col h-[88vh] max-h-[88vh] overflow-hidden p-4 sm:p-6'
      >
        <div className='flex flex-col font-sans h-full min-h-0 select-none'>
          {/* Header: Identitas Pasien & Tombol Tutup */}
          <div className='flex items-center justify-between gap-3 pb-3.5 border-b border-border/40 shrink-0'>
            <div className='flex items-center gap-3.5 min-w-0 flex-1'>
              <Avatar className='size-12 rounded-xl shrink-0 border border-border/40 overflow-hidden ring-1 ring-border/30'>
                <AvatarImage
                  src={patient.avatarUrl || DEFAULT_AVATAR_PATH}
                  alt={fullName}
                  className='size-full object-cover'
                />
                <AvatarFallback className='p-0 bg-transparent overflow-hidden'>
                  <Image
                    src={patient.avatarUrl || DEFAULT_AVATAR_PATH}
                    alt={fullName}
                    width={48}
                    height={48}
                    unoptimized
                    className='size-full object-cover rounded-xl'
                  />
                </AvatarFallback>
              </Avatar>

              <div className='flex flex-col min-w-0 flex-1'>
                <div className='flex items-center gap-2 flex-wrap'>
                  <h3 className='text-base sm:text-lg font-bold text-foreground truncate tracking-tight'>
                    {fullName}
                  </h3>
                  <span className='font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border/40'>
                    {rmNumber}
                  </span>
                  {gender && (
                    <span className='text-[11px] px-2 py-0.5 font-medium rounded bg-muted/60 text-muted-foreground'>
                      {gender}
                    </span>
                  )}
                </div>
                <div className='flex items-center gap-2 text-xs font-mono text-muted-foreground mt-0.5 flex-wrap'>
                  <span>NIK: {nik}</span>
                  {patient.phone && (
                    <>
                      <span>•</span>
                      <span>Telp: {patient.phone}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Button
              type='button'
              variant='ghost'
              size='icon-sm'
              shape='pill'
              onClick={onClose}
              aria-label='Tutup modal riwayat'
              className='text-muted-foreground hover:text-foreground hover:bg-muted size-8 cursor-pointer shrink-0'
            >
              <Icons.close className='size-4' />
            </Button>
          </div>

          {/* Toolbar: Pemilih Bulan Kalender Mengambang (Floating Popover - No Push Down) & Filter Periode */}
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-border/40 shrink-0'>
            <div className='flex items-center gap-2'>
              <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20'>
                <Icons.history className='size-3.5' />
                <span>
                  {filteredAppointments.length} Kunjungan {isAllMonths ? 'Tercatat' : 'Bulan Ini'}
                </span>
              </span>
              <span className='text-xs text-muted-foreground hidden sm:inline'>
                Total riwayat keseluruhan: {appointments.length}
              </span>
            </div>

            {/* Filter Bulan dengan Floating Popover (Bebas Efek Dorong Bawah) */}
            <div className='flex items-center gap-2 self-end sm:self-auto'>
              <Button
                type='button'
                variant={isAllMonths ? 'default' : 'outline'}
                size='sm'
                shape='pill'
                onClick={() => setIsAllMonths((prev) => !prev)}
                className='text-xs font-semibold h-9 px-3 cursor-pointer shrink-0'
              >
                {isAllMonths ? 'Tampilkan Per Bulan' : 'Semua Bulan'}
              </Button>

              <Popover open={isMonthPopoverOpen} onOpenChange={setIsMonthPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type='button'
                    disabled={isAllMonths}
                    aria-label='Pilih bulan kalender'
                    className={cn(
                      'h-9 px-3.5 flex items-center justify-between gap-2.5 rounded-xl border border-border/70 bg-card text-foreground transition-all duration-200 cursor-pointer shadow-2xs hover:border-primary/50 text-xs font-medium shrink-0',
                      isAllMonths && 'opacity-40 pointer-events-none'
                    )}
                  >
                    <span className='truncate'>{displayMonthLabel}</span>
                    <Icons.calendar className='size-3.5 text-muted-foreground shrink-0' />
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  align='end'
                  sideOffset={6}
                  className='w-72 p-3.5 rounded-2xl border border-border bg-card shadow-xl z-[80] font-sans'
                >
                  <div className='space-y-3'>
                    {/* Header Navigasi Tahun */}
                    <div className='flex items-center justify-between pb-2 border-b border-border/40'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => setViewingYear((y) => Math.max(2020, y - 1))}
                        className='size-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer'
                        aria-label='Tahun sebelumnya'
                      >
                        <Icons.chevronLeft className='size-4' />
                      </Button>

                      <Select
                        value={String(viewingYear)}
                        onValueChange={(val) => setViewingYear(parseInt(val, 10))}
                      >
                        <SelectTrigger className='h-7 w-[96px] border border-border/50 bg-muted/40 px-2 text-xs font-bold text-foreground shadow-none cursor-pointer rounded-lg'>
                          <SelectValue placeholder={String(viewingYear)} />
                        </SelectTrigger>
                        <SelectContent className='max-h-56 z-[90]'>
                          <SelectGroup>
                            {yearOptions.map((y) => (
                              <SelectItem
                                key={y}
                                value={String(y)}
                                className='text-xs cursor-pointer'
                              >
                                {y}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>

                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => setViewingYear((y) => Math.min(2035, y + 1))}
                        className='size-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer'
                        aria-label='Tahun berikutnya'
                      >
                        <Icons.chevronRight className='size-4' />
                      </Button>
                    </div>

                    {/* Grid 12 Bulan */}
                    <div className='grid grid-cols-3 gap-1.5'>
                      {INDONESIAN_MONTH_NAMES.map((monthName, idx) => {
                        const isSelected =
                          viewingYear === selectedYear &&
                          idx === selectedMonthIndex &&
                          !isAllMonths;
                        const isCurrentMonth =
                          viewingYear === new Date().getFullYear() && idx === new Date().getMonth();

                        return (
                          <button
                            key={monthName}
                            type='button'
                            onClick={() => handleSelectMonth(idx)}
                            className={cn(
                              'h-8 px-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center',
                              isSelected
                                ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                                : isCurrentMonth
                                  ? 'bg-muted/70 text-foreground font-semibold hover:bg-muted'
                                  : 'text-foreground/80 hover:bg-muted/50 hover:text-foreground'
                            )}
                          >
                            <span>{monthName.slice(0, 3)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Grid Kunjungan Medis: Minimalist Signatures (Tanpa Ikon Dekoratif) */}
          <div className='flex-1 min-h-0 overflow-y-auto py-4 pr-1'>
            {isLoading ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5'>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className='h-32 rounded-xl' />
                ))}
              </div>
            ) : filteredAppointments.length === 0 ? (
              <EmptyState
                title='Tidak ada kunjungan'
                description={
                  isAllMonths
                    ? 'Pasien ini belum memiliki riwayat janji temu atau kunjungan klinis.'
                    : 'Tidak ada jadwal kunjungan atau tindakan medis pada bulan yang dipilih.'
                }
                className='py-12'
              />
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5'>
                {filteredAppointments.map((apt) => {
                  const serviceName = apt.poliklinikName || 'Pemeriksaan Medis';
                  const dateStr = apt.scheduledDate
                    ? formatClinicDate(apt.scheduledDate, { style: 'human_medium' })
                    : '-';
                  const timeStr = apt.scheduledStartTime
                    ? `${apt.scheduledStartTime.slice(0, 5)}${apt.scheduledEndTime ? ` - ${apt.scheduledEndTime.slice(0, 5)}` : ''}`
                    : '';

                  return (
                    <button
                      key={apt.id}
                      type='button'
                      onClick={() => setSelectedAppointmentId(apt.id)}
                      className='w-full text-left p-4 rounded-xl border border-border/70 bg-card hover:bg-muted/30 hover:border-primary/60 transition-all cursor-pointer group flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-sm'
                    >
                      {/* Bagian Atas: Layanan & Status */}
                      <div className='flex items-start justify-between gap-2'>
                        <span className='text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors'>
                          {serviceName}
                        </span>
                        <div className='shrink-0'>
                          <AppointmentStatusPill status={apt.status} size='sm' />
                        </div>
                      </div>

                      {/* Bagian Tengah: Tanggal & Waktu (Clean Minimalist Typography - No Icons) */}
                      <div className='space-y-0.5 text-xs'>
                        <div className='text-foreground font-semibold'>{dateStr}</div>
                        {timeStr && (
                          <div className='text-muted-foreground font-mono text-[11px]'>
                            {timeStr}
                          </div>
                        )}
                        {apt.doctorName && (
                          <div className='text-muted-foreground text-[11px] truncate pt-0.5'>
                            {apt.doctorName}
                          </div>
                        )}
                      </div>

                      {/* Bagian Bawah: Aksi Buka Berkas */}
                      <div className='pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground group-hover:text-foreground transition-colors'>
                        <span className='truncate max-w-[180px] font-mono'>{apt.bookingCode}</span>
                        <span className='text-primary font-semibold text-xs group-hover:underline'>
                          Buka Berkas &rarr;
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Modal */}
          <div className='pt-3.5 border-t border-border/40 flex items-center justify-between shrink-0'>
            <span className='text-xs text-muted-foreground'>
              Klik salah satu kartu kunjungan untuk membuka detail janji temu dan formulir intake
              medis lengkap.
            </span>

            <Button
              type='button'
              variant='default'
              shape='pill'
              size='card-action'
              onClick={onClose}
              className='px-7 font-semibold text-xs cursor-pointer'
            >
              Tutup
            </Button>
          </div>
        </div>
      </ModalWrapper>

      {/* Modal Level 2: Menggunakan Kembali AppointmentDetailOrganism (Mode Riwayat: Read-Only & Aksi Modifikasi Ditiadakan) */}
      {selectedAppointmentId && adaptedAppointment && (
        <AppointmentDetailOrganism
          isOpen={Boolean(selectedAppointmentId)}
          appointment={adaptedAppointment}
          isHistoryMode={true}
          onClose={() => setSelectedAppointmentId(null)}
        />
      )}
    </>
  );
}
