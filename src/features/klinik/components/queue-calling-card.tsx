'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { QueueItem, QUEUE_STATUS } from '../api/types';
import { useConsultationTimer } from '../hooks/useConsultationTimer';
import { DoctorAvatar } from './doctor-avatar';
import { cn } from '@/lib/utils';

export interface QueueCallingCardProps {
  callingItem?: QueueItem;
  nextItem?: QueueItem;
  afterNextItem?: QueueItem;
  clinicRoomName?: string;
  estimatedTime?: string;
  bookingTime?: string;
  className?: string;
  onOpenFacet?: () => void;
  isFiltered?: boolean;
  onResetFilter?: () => void;
}

export function QueueCallingCard({
  callingItem,
  nextItem,
  afterNextItem,
  clinicRoomName,
  estimatedTime,
  bookingTime,
  className,
  onOpenFacet,
  isFiltered,
  onResetFilter
}: QueueCallingCardProps) {
  const timer = useConsultationTimer({
    startedAt: callingItem?.actual_started_at,
    completedAt: callingItem?.actual_completed_at,
    status: callingItem?.status,
    policyMinutes: callingItem?.estimated_duration_minutes
  });

  if (!callingItem) {
    return (
      <div
        className={cn('relative h-full flex flex-col pb-3 min-h-0 [perspective:1400px]', className)}
      >
        <div
          id='hero-front-card'
          className='relative z-10 rounded-[22px] border border-border/50 bg-card text-card-foreground p-6 sm:p-7 shadow-none font-sans select-none flex flex-col justify-center items-center flex-1 h-full min-h-0 overflow-hidden'
        >
          <div className='lg:hidden absolute top-4 right-4 z-20 flex items-center gap-1'>
            {isFiltered && onResetFilter && (
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={onResetFilter}
                aria-label='Reset'
                className='size-8 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg'
                title='Reset'
              >
                <Icons.refresh className='size-3.5' />
              </Button>
            )}
            {onOpenFacet && (
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={onOpenFacet}
                aria-label='Buka daftar antrean dan filter'
                className='size-8 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg'
              >
                <Icons.ellipsis className='size-4' />
              </Button>
            )}
          </div>

          {nextItem ? (
            <div className='flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-sm'>
              <div className='size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center ring-4 ring-primary/5'>
                <Icons.notification className='size-8 animate-pulse' />
              </div>
              <div className='space-y-1.5'>
                <span className='text-[11px] font-bold uppercase tracking-wider text-primary'>
                  Antrean Siap Dipanggil
                </span>
                <div className='text-4xl font-black text-foreground tracking-tight'>
                  {nextItem.queue_number}
                </div>
                <h4 className='text-lg font-bold text-foreground truncate'>
                  {nextItem.patient_name}
                </h4>
                <p className='text-xs text-muted-foreground'>
                  {nextItem.poli} • {nextItem.doctor_name}
                </p>
              </div>
              <div className='inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/60 px-3.5 py-1.5 rounded-full border border-border/40'>
                <Icons.clock className='size-3.5' />
                <span>Harap bersiap menuju ke ruang periksa</span>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Icons.inbox}
              title='Belum ada antrean dipanggil'
              description='Pasien yang sedang dipanggil akan tampil di sini setelah antrean tersedia.'
              className='h-full min-h-[360px] border-0 bg-transparent'
            />
          )}
        </div>
      </div>
    );
  }

  const isFinished = callingItem.status === QUEUE_STATUS.COMPLETED;
  const isInService = callingItem.status === QUEUE_STATUS.IN_SERVICE;
  const patientName = callingItem.patient_name || '-';
  const queueNumber = callingItem.queue_number || '-';
  const calledTime = callingItem.called_time || callingItem.estimated_time || '-';
  const roomName = callingItem.room || clinicRoomName || '-';
  const patientAvatar = callingItem.patient_avatar || '';
  const patientEstimatedTime =
    estimatedTime || callingItem.eta_range || callingItem.estimated_time || bookingTime || '-';

  return (
    <div
      className={cn('relative h-full flex flex-col pb-3 min-h-0 [perspective:1400px]', className)}
    >
      <div
        id='stack-layer-2'
        className={cn(
          'absolute inset-x-7 top-4 bottom-0 rounded-[22px] border border-border/30 bg-muted/40 pointer-events-none z-0 shadow-xs flex flex-col justify-between p-4 opacity-70 will-change-transform transition-opacity',
          !afterNextItem && 'opacity-0'
        )}
      >
        <div className='flex items-center justify-between text-xs text-muted-foreground'>
          <span className='font-semibold'>{afterNextItem?.queue_number || ''}</span>
          <span className='truncate max-w-[140px]'>{afterNextItem?.patient_name || ''}</span>
        </div>
      </div>

      <div
        id='stack-layer-1'
        className={cn(
          'absolute inset-x-3.5 top-2 bottom-1.5 rounded-[22px] border border-border/50 bg-card/90 text-card-foreground pointer-events-none z-[1] shadow-xs flex flex-col justify-between p-5 opacity-90 will-change-transform transition-opacity',
          !nextItem && 'opacity-0'
        )}
      >
        <div className='flex items-center justify-between text-xs font-semibold'>
          <span className='inline-flex items-center gap-1 text-primary'>
            <span className='size-1.5 rounded-full bg-primary' />
            {nextItem?.queue_number || ''} — {nextItem?.patient_name || ''}
          </span>
          <span className='text-[11px] text-muted-foreground font-normal'>Siap Dipanggil</span>
        </div>
      </div>

      <div
        id='hero-front-card'
        className='relative z-10 rounded-[22px] border border-border/50 bg-card text-card-foreground p-5 sm:p-7 shadow-none font-sans select-none flex flex-col justify-between flex-1 h-full min-h-0 overflow-hidden space-y-4 transition-all origin-center will-change-transform'
      >
        <div className='absolute inset-0 pointer-events-none overflow-hidden [perspective:1000px] -z-0 select-none'>
          <div
            className='absolute -top-[50%] -left-[50%] w-[200%] h-[220%] origin-center [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]'
            style={{
              transform: 'rotateX(62deg) rotateZ(-30deg) scale(1.35)',
              transformStyle: 'preserve-3d',
              backgroundImage: `
                linear-gradient(to right, currentColor 1px, transparent 1px),
                linear-gradient(to bottom, currentColor 1px, transparent 1px)
              `,
              backgroundSize: '36px 36px',
              color: 'var(--foreground)',
              opacity: 0.08
            }}
          />
        </div>

        <div className='relative z-10 flex items-center justify-between gap-3 shrink-0'>
          <div className='flex items-center gap-2'>
            <h3 className='text-base sm:text-lg font-bold text-foreground tracking-tight'>
              {isFinished
                ? 'Pemeriksaan Selesai'
                : isInService
                  ? 'Sedang Diperiksa'
                  : 'Sedang Dipanggil'}
            </h3>
            <span
              className={cn(
                'size-2 rounded-full',
                isFinished
                  ? 'bg-muted-foreground'
                  : isInService
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-primary animate-pulse'
              )}
            />
          </div>

          <div className='flex items-center gap-1.5'>
            {!isFinished && !isInService && calledTime && calledTime !== '-' && (
              <Badge
                variant='secondary'
                className='text-xs font-medium px-2.5 py-0.5 gap-1.5 border border-border/40'
              >
                <Icons.clock className='size-3 stroke-[2]' />
                <span>Dipanggil {calledTime}</span>
              </Badge>
            )}

            {isFiltered && onResetFilter && (
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={onResetFilter}
                aria-label='Reset'
                className='lg:hidden size-8 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg'
                title='Reset'
              >
                <Icons.refresh className='size-3.5' />
              </Button>
            )}

            {onOpenFacet && (
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={onOpenFacet}
                aria-label='Buka daftar antrean dan filter'
                className='lg:hidden size-8 -mr-1.5 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg'
              >
                <Icons.ellipsis className='size-4' />
              </Button>
            )}
          </div>
        </div>

        {!isFinished ? (
          <>
            {/* Mobile View: Central Identity (Patient only) + Left-aligned Vertical Metadata */}
            <div className='lg:hidden flex-1 flex flex-col justify-between py-1 space-y-4'>
              {/* Central Identity Section */}
              <div className='flex flex-row items-center gap-4 my-auto py-2'>
                <div className='size-24 min-w-[96px] rounded-2xl overflow-hidden shrink-0 ring-4 ring-primary/10 bg-muted/20 border border-primary/20 aspect-square shadow-inner relative flex items-center justify-center'>
                  <DoctorAvatar
                    name={patientName}
                    avatarUrl={patientAvatar}
                    size={96}
                    roundedClassName='rounded-2xl'
                    className='w-full h-full object-cover object-center'
                  />
                </div>

                <div className='flex-1 min-w-0 text-left space-y-1'>
                  <div className='text-3xl font-black text-foreground tracking-tight leading-none'>
                    {queueNumber}
                  </div>
                  <h4 className='text-lg font-bold text-foreground truncate'>{patientName}</h4>
                </div>
              </div>

              {/* Compact Vertical Metadata Sequence (Respect Theme Tokens) */}
              <div className='space-y-2.5 pt-2 border-t border-border/40'>
                {/* 1. Waktu Konsultasi */}
                <div className='flex items-center gap-2.5 text-left'>
                  <Icons.clock className='size-4 text-primary shrink-0 stroke-[1.8]' />
                  <div className='min-w-0 flex items-center gap-2'>
                    <span className='text-xs text-muted-foreground font-medium whitespace-nowrap'>
                      Waktu Konsultasi:
                    </span>
                    <span className='text-xs font-semibold text-foreground whitespace-nowrap'>
                      {timer.formattedDuration}
                    </span>
                  </div>
                </div>

                {/* 2. Dokter */}
                <div className='flex items-center gap-2.5 text-left'>
                  <Icons.user className='size-4 text-primary shrink-0 stroke-[1.8]' />
                  <div className='min-w-0 flex items-center gap-2 truncate'>
                    <span className='text-xs text-muted-foreground font-medium whitespace-nowrap'>
                      Dokter:
                    </span>
                    <span className='text-xs font-semibold text-foreground truncate'>
                      {callingItem.doctor_name || '-'}
                    </span>
                  </div>
                </div>

                {/* 3. Ruangan */}
                <div className='flex items-center gap-2.5 text-left'>
                  <Icons.mapPin className='size-4 text-primary shrink-0 stroke-[1.8]' />
                  <div className='min-w-0 flex items-center gap-2 truncate'>
                    <span className='text-xs text-muted-foreground font-medium whitespace-nowrap'>
                      Ruangan:
                    </span>
                    <span className='text-xs font-semibold text-foreground truncate'>
                      {roomName}
                    </span>
                  </div>
                </div>

                {/* 4. Estimasi */}
                <div className='flex items-center gap-2.5 text-left'>
                  <Icons.calendar className='size-4 text-primary shrink-0 stroke-[1.8]' />
                  <div className='min-w-0 flex items-center gap-2 truncate'>
                    <span className='text-xs text-muted-foreground font-medium whitespace-nowrap'>
                      Estimasi:
                    </span>
                    <span className='text-xs font-semibold text-foreground truncate'>
                      {patientEstimatedTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop View: Separated Patient Identity & Doctor Assignment Groups + Desktop Footer */}
            <div className='hidden lg:flex flex-col flex-1 justify-between py-2'>
              <div className='flex items-center gap-8 my-auto'>
                <div className='size-48 xl:size-52 min-w-[192px] xl:min-w-[208px] rounded-3xl overflow-hidden shrink-0 ring-8 ring-primary/10 bg-muted/20 border border-primary/20 aspect-square shadow-inner relative flex items-center justify-center'>
                  <DoctorAvatar
                    name={patientName}
                    avatarUrl={patientAvatar}
                    size={208}
                    roundedClassName='rounded-3xl'
                    className='w-full h-full object-cover object-center'
                  />
                </div>

                <div className='flex-1 min-w-0 space-y-4'>
                  {/* Patient Identity Group */}
                  <div className='space-y-1.5'>
                    <span className='text-xs font-bold uppercase tracking-wider text-primary'>
                      Nomor Antrean Pasien
                    </span>
                    <div className='text-5xl font-black text-foreground tracking-tight leading-none'>
                      {queueNumber}
                    </div>
                    <h4 className='text-2xl font-bold text-foreground truncate'>{patientName}</h4>
                  </div>

                  {/* Distinct Doctor & Room Assignment Group */}
                  <div className='p-3.5 rounded-xl border border-border/50 bg-muted/25 space-y-2 max-w-md'>
                    <div className='flex items-center gap-2 text-sm font-semibold text-foreground truncate'>
                      <Icons.user className='size-4 text-primary shrink-0' strokeWidth={2} />
                      <span className='text-muted-foreground font-normal text-xs'>Dokter:</span>
                      <span className='truncate'>{callingItem.doctor_name || '-'}</span>
                    </div>
                    <div className='flex items-center gap-2 text-xs font-medium text-muted-foreground'>
                      <Icons.check className='size-4 text-primary shrink-0' />
                      <span>Harap segera menuju ke ruang periksa dokter</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className='border-t border-border/40 shrink-0 my-3' />

              {/* Desktop Horizontal Footer */}
              <div className='flex flex-row items-center justify-between gap-6 lg:gap-8 xl:gap-10 text-left shrink-0'>
                <div className='flex items-center gap-3 shrink-0 min-w-0'>
                  <Icons.mapPin className='size-7 text-primary shrink-0 stroke-[1.8]' />
                  <div className='min-w-0 space-y-0.5'>
                    <span className='text-[11px] font-medium text-muted-foreground block whitespace-nowrap'>
                      Room
                    </span>
                    <span className='text-base font-bold text-foreground block whitespace-nowrap truncate max-w-[140px]'>
                      {roomName}
                    </span>
                  </div>
                </div>

                <div className='flex items-center gap-3 shrink-0 min-w-0'>
                  <Icons.clock
                    className={cn(
                      'size-7 shrink-0 stroke-[1.8]',
                      timer.isOvertime ? 'text-destructive animate-pulse' : 'text-primary'
                    )}
                  />
                  <div className='min-w-0 space-y-0.5'>
                    <span className='text-[11px] font-medium text-muted-foreground block whitespace-nowrap'>
                      Waktu Konsultasi
                    </span>
                    <div className='flex items-center gap-1.5'>
                      <span
                        id='time-remaining-value'
                        className={cn(
                          'text-base font-bold block whitespace-nowrap',
                          timer.isOvertime ? 'text-destructive font-black' : 'text-foreground'
                        )}
                      >
                        {timer.formattedDuration}
                      </span>
                      {timer.isOvertime && callingItem.estimated_duration_minutes && (
                        <Badge
                          variant='destructive'
                          className='text-[9.5px] px-1.5 py-0 h-4 font-bold whitespace-nowrap'
                        >
                          +{callingItem.estimated_duration_minutes}m
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className='flex items-center gap-3 shrink-0 min-w-0'>
                  <Icons.calendar className='size-7 text-primary shrink-0 stroke-[1.8]' />
                  <div className='min-w-0 space-y-0.5'>
                    <span className='text-[11px] font-medium text-muted-foreground block whitespace-nowrap'>
                      Estimasi
                    </span>
                    <span className='text-base font-bold text-foreground block whitespace-nowrap truncate'>
                      {patientEstimatedTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className='relative z-10 flex flex-col items-center justify-center text-center gap-3 my-auto py-6'>
            <div className='size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-4 ring-primary/5'>
              <Icons.check className='size-8 stroke-[2.5]' />
            </div>
            <div className='space-y-1'>
              <h4 className='text-xl font-bold text-foreground'>Semua Antrean Telah Selesai</h4>
              <p className='text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto'>
                Seluruh pasien dalam antrean {roomName} telah selesai dilayani. Sistem akan memuat
                antrean berikutnya secara otomatis.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
