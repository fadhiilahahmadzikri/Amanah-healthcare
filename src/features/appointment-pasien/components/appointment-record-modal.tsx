'use client';

import React from 'react';
import Image from 'next/image';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { AppointmentStatusPill } from '@/features/klinik/components/appointment-card';
import { getAntreanPillClasses } from './appointment-tables/columns';
import { formatClinicDate, formatClinicTime } from '@/lib/date-format';
import { formatFriendlySessionName } from '@/features/jadwal-dokter/constants/schedule-shift.constants';
import type { AdminAppointment } from '../api/types';

export interface AppointmentRecordModalProps {
  isOpen: boolean;
  appointment: AdminAppointment | null;
  onClose: () => void;
  onViewPatientDetail?: () => void;
  onViewTimeline?: () => void;
  onUpdateStatus?: () => void;
  onChangeDoctor?: () => void;
  onChangeRoom?: () => void;
  onQrCheckIn?: () => void;
  onReschedule?: () => void;
  onCancel?: () => void;
  onOpenActionDrawer?: () => void;
}

export function AppointmentRecordModal({
  isOpen,
  appointment,
  onClose,
  onViewPatientDetail,
  onViewTimeline,
  onUpdateStatus,
  onChangeDoctor,
  onChangeRoom,
  onQrCheckIn,
  onReschedule,
  onCancel,
  onOpenActionDrawer
}: AppointmentRecordModalProps) {
  const isMobile = useIsMobile();

  if (!appointment) return null;

  const canUpdateStatus =
    Boolean(appointment.allowedActions?.includes('START_SERVICE')) ||
    Boolean(appointment.allowedActions?.includes('COMPLETE'));
  const canCheckIn = Boolean(appointment.allowedActions?.includes('CHECK_IN'));

  const sessionLabel = formatFriendlySessionName(appointment.sessionName || appointment.session);

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth='max-w-2xl sm:max-w-3xl'
      showCloseButton={false}
      className='flex flex-col max-h-[90vh] overflow-hidden'
    >
      <div className='flex flex-col font-sans h-full min-h-0 select-none'>
        {/* Header Modal: Avatar Pasien, Nama Pasien, Meta Info, dan Status Pills */}
        <div className='flex items-center justify-between gap-3 pb-3.5 border-b border-border/40 shrink-0'>
          <div className='flex items-center gap-3 min-w-0 flex-1'>
            {/* Avatar Langsung di Header */}
            <Avatar className='size-11 sm:size-12 rounded-full shrink-0 select-none ring-1 ring-border/40'>
              <AvatarImage
                src={appointment.avatarUrl || DEFAULT_AVATAR_PATH}
                alt={appointment.patientName}
                className='size-full object-cover rounded-full'
              />
              <AvatarFallback className='p-0 bg-transparent overflow-hidden'>
                <Image
                  src={DEFAULT_AVATAR_PATH}
                  alt={appointment.patientName}
                  width={48}
                  height={48}
                  unoptimized
                  className='size-full object-cover rounded-full'
                />
              </AvatarFallback>
            </Avatar>

            {/* Nama Pasien, Badges, & Subtitle */}
            <div className='flex flex-col min-w-0 flex-1 space-y-1'>
              <div className='flex items-center gap-2 flex-wrap'>
                <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight truncate'>
                  {appointment.patientName}
                </h3>
                {appointment.isAffiliated && (
                  <span className='px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 rounded leading-none shrink-0'>
                    Afiliasi
                  </span>
                )}
              </div>
              <div className='flex items-center'>
                <span
                  className={cn(
                    'inline-flex items-center justify-center font-mono text-[11px] font-bold px-2 py-0.5 rounded-[6px] text-white shadow-2xs shrink-0',
                    getAntreanPillClasses(appointment.queueNumber)
                  )}
                >
                  {appointment.queueNumber || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Tombol Tindakan Morevert Standar Card (Drawer Sheet di Mobile, Pop-up Menu di Desktop) */}
          <div className='shrink-0'>
            {isMobile && onOpenActionDrawer ? (
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={onOpenActionDrawer}
                aria-label='Opsi tindakan janji temu'
                className='size-7.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-md transition-colors cursor-pointer shrink-0'
              >
                <Icons.ellipsis className='size-4' />
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    aria-label='Opsi tindakan janji temu'
                    className='size-7.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-md transition-colors cursor-pointer shrink-0'
                  >
                    <Icons.ellipsis className='size-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align='end'
                  className='w-48 p-1.5 rounded-xl shadow-lg border border-border/60 bg-card font-sans text-xs'
                >
                  {onViewPatientDetail && (
                    <DropdownMenuItem
                      onClick={onViewPatientDetail}
                      className='flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer font-medium hover:bg-muted/80 text-foreground transition-colors'
                    >
                      <Icons.user className='size-4 text-primary shrink-0' />
                      <span>Lihat Pasien</span>
                    </DropdownMenuItem>
                  )}
                  {onViewTimeline && (
                    <DropdownMenuItem
                      onClick={onViewTimeline}
                      className='flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer font-medium hover:bg-muted/80 text-foreground transition-colors'
                    >
                      <Icons.history className='size-4 text-primary shrink-0' />
                      <span>Garis Waktu</span>
                    </DropdownMenuItem>
                  )}
                  {onChangeDoctor && (
                    <DropdownMenuItem
                      onClick={onChangeDoctor}
                      className='flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer font-medium hover:bg-muted/80 text-foreground transition-colors'
                    >
                      <Icons.userCheck className='size-4 text-muted-foreground shrink-0' />
                      <span>{appointment.doctorName ? 'Ganti Dokter' : 'Tugaskan Dokter'}</span>
                    </DropdownMenuItem>
                  )}
                  {onChangeRoom && (
                    <DropdownMenuItem
                      onClick={onChangeRoom}
                      className='flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer font-medium hover:bg-muted/80 text-foreground transition-colors'
                    >
                      <Icons.mapPin className='size-4 text-muted-foreground shrink-0' />
                      <span>{appointment.roomName ? 'Ganti Ruangan' : 'Tugaskan Ruangan'}</span>
                    </DropdownMenuItem>
                  )}
                  {onReschedule && (
                    <DropdownMenuItem
                      onClick={onReschedule}
                      className='flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer font-medium hover:bg-muted/80 text-foreground transition-colors'
                    >
                      <Icons.calendar className='size-4 text-muted-foreground shrink-0' />
                      <span>Jadwalkan Ulang</span>
                    </DropdownMenuItem>
                  )}
                  {onCancel && (
                    <>
                      <DropdownMenuSeparator className='my-1 border-border/40' />
                      <DropdownMenuItem
                        onClick={onCancel}
                        className='flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer font-medium text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive transition-colors'
                      >
                        <Icons.close className='size-4 text-destructive shrink-0' />
                        <span>Batalkan Janji Temu</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Scrollable Body Content: Form-style Render Tanpa Box Wrapper, Sejajar Dinding Kiri */}
        <div className='flex-1 min-h-0 overflow-y-auto py-3.5 pr-1'>
          <div className='grid grid-cols-2 gap-y-3.5 gap-x-5 sm:gap-x-6'>
            {/* 1. Tanggal Booking */}
            <div className='border-b border-border/30 pb-2.5'>
              <span className='text-xs font-medium text-muted-foreground block mb-0.5'>
                Tanggal Booking
              </span>
              <span className='text-sm font-semibold text-foreground block truncate'>
                {formatClinicDate(appointment.scheduledDate)}
              </span>
            </div>

            {/* 2. Sesi & Estimasi */}
            <div className='border-b border-border/30 pb-2.5'>
              <span className='text-xs font-medium text-muted-foreground block mb-0.5'>
                Sesi & Estimasi
              </span>
              <span className='text-sm font-bold font-mono text-foreground block'>
                {appointment.etaRange || appointment.scheduledStartTime || '-'}
              </span>
              {sessionLabel && (
                <span className='text-[11px] text-muted-foreground block truncate mt-0.5'>
                  {sessionLabel}
                </span>
              )}
            </div>

            {/* 3. Poliklinik */}
            <div className='border-b border-border/30 pb-2.5'>
              <span className='text-xs font-medium text-muted-foreground block mb-0.5'>
                Poliklinik
              </span>
              <span className='text-sm font-semibold text-foreground block truncate'>
                {appointment.poliklinikName || '-'}
              </span>
            </div>

            {/* 4. Layanan */}
            <div className='border-b border-border/30 pb-2.5'>
              <span className='text-xs font-medium text-muted-foreground block mb-0.5'>
                Layanan
              </span>
              <span className='text-sm font-semibold text-foreground block truncate'>
                {appointment.layananName || '-'}
              </span>
            </div>

            {/* 5. Dokter */}
            <div className='border-b border-border/30 pb-2.5'>
              <span className='text-xs font-medium text-muted-foreground block mb-0.5'>Dokter</span>
              <span
                className={cn(
                  'text-sm font-semibold block truncate',
                  appointment.doctorName
                    ? 'text-primary'
                    : 'text-amber-600 dark:text-amber-400 italic'
                )}
              >
                {appointment.doctorName || 'Belum di-assign'}
              </span>
            </div>

            {/* 6. Ruangan */}
            <div className='border-b border-border/30 pb-2.5'>
              <span className='text-xs font-medium text-muted-foreground block mb-0.5'>
                Ruangan
              </span>
              <span
                className={cn(
                  'text-sm font-semibold block truncate',
                  appointment.roomName
                    ? 'text-foreground'
                    : 'text-amber-600 dark:text-amber-400 italic'
                )}
              >
                {appointment.roomName || 'Belum di-assign'}
                {appointment.roomLocation ? ` (${appointment.roomLocation})` : ''}
              </span>
            </div>

            {/* 7. Mulai Pelayanan */}
            <div className='border-b border-border/30 pb-2.5'>
              <span className='text-xs font-medium text-muted-foreground block mb-0.5'>
                Mulai Pelayanan
              </span>
              <span className='text-sm font-medium font-mono text-foreground block'>
                {appointment.actualStartedAt ? formatClinicTime(appointment.actualStartedAt) : '-'}
              </span>
            </div>

            {/* 8. Selesai Pelayanan */}
            <div className='border-b border-border/30 pb-2.5'>
              <span className='text-xs font-medium text-muted-foreground block mb-0.5'>
                Selesai Pelayanan
              </span>
              <span className='text-sm font-medium font-mono text-foreground block'>
                {appointment.actualCompletedAt
                  ? formatClinicTime(appointment.actualCompletedAt)
                  : '-'}
              </span>
            </div>

            {/* 9. Durasi Pelayanan */}
            <div className='border-b border-border/30 pb-2.5'>
              <span className='text-xs font-medium text-muted-foreground block mb-0.5'>
                Durasi Pelayanan
              </span>
              <span className='text-sm font-semibold text-foreground block'>
                {appointment.consultationDurationFormatted || '-'}
              </span>
            </div>

            {/* 10. Status Antrean (Sesuai Anotasi Kotak Merah di Samping Durasi Pelayanan) */}
            <div className='border-b border-border/30 pb-2.5'>
              <span className='text-xs font-medium text-muted-foreground block mb-0.5'>
                Status Antrean
              </span>
              <div className='pt-0.5'>
                <AppointmentStatusPill status={appointment.status} size='sm' />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Consistent size='card-action' and shape='pill' */}
        <div className='pt-3.5 border-t border-border/40 flex items-center justify-between gap-4 shrink-0'>
          <Button
            type='button'
            variant='outline'
            shape='pill'
            size='card-action'
            onClick={onClose}
            className='px-6 font-semibold text-xs cursor-pointer'
          >
            Tutup
          </Button>

          <div className='flex items-center gap-2.5'>
            {canUpdateStatus && (
              <Button
                type='button'
                variant='outline'
                shape='pill'
                size='card-action'
                onClick={onUpdateStatus}
                className='px-5 font-semibold text-xs cursor-pointer'
                leadingIcon={<Icons.refresh className='size-3.5' />}
              >
                Update Status
              </Button>
            )}

            {canCheckIn && onQrCheckIn && (
              <Button
                type='button'
                variant='default'
                shape='pill'
                size='card-action'
                onClick={onQrCheckIn}
                className='px-6 font-semibold text-xs cursor-pointer shadow-xs'
                leadingIcon={<Icons.qrCode className='size-3.5' />}
              >
                QR Check-In
              </Button>
            )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
