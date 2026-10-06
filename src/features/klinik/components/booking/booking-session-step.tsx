'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { getSessionIcon } from '../../constants/consultation-sessions';
import type { ServiceCatalogItem } from '../../api/catalog.service';
import { cn } from '@/lib/utils';
import { useBookingSessions } from '../../model/useBookingSessions';
import type { BookingOptionShift } from '@/features/data-pasien/api/patient-affiliation-service';

export interface BookingSessionStepProps {
  selectedService: ServiceCatalogItem | null;
  dateStr: string;
  timeSlot: string;
  setTimeSlot: (slot: string) => void;
  onSelectSessionId?: (sessionId: string) => void;
  staffId?: string;
  poliklinikId?: string;
}

export function BookingSessionStep({
  selectedService,
  dateStr,
  timeSlot,
  setTimeSlot,
  onSelectSessionId,
  staffId,
  poliklinikId
}: BookingSessionStepProps) {
  const effectivePoliklinikId = poliklinikId || selectedService?.poliklinikId;

  const { sessions: bookingSessions, isLoading: isLoadingSessions } = useBookingSessions(
    { dateStr, poliklinikId: effectivePoliklinikId, staffId, currentTimeSlot: timeSlot },
    { onTimeSlotChange: setTimeSlot, onSessionIdChange: onSelectSessionId }
  );

  return (
    <div className='space-y-4'>
      <div className='flex items-start justify-between gap-2'>
        <div>
          <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
            Pilih sesi praktik dokter jaga
          </h3>
          <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
            Tentukan shift konsultasi yang paling pas untuk pemeriksaanmu.
          </p>
        </div>
        <div className='flex items-center gap-1.5 text-xs font-semibold text-muted-foreground shrink-0 pt-0.5'>
          <Icons.calendar className='size-3.5 text-muted-foreground' />
          <span>{dateStr}</span>
        </div>
      </div>

      {isLoadingSessions ? (
        <SessionSkeletons />
      ) : bookingSessions.length === 0 ? (
        <SessionEmptyState dateStr={dateStr} />
      ) : (
        <SessionList
          sessions={bookingSessions}
          timeSlot={timeSlot}
          onSelectSlot={(session, sessionId) => {
            setTimeSlot(session);
            if (sessionId) onSelectSessionId?.(sessionId);
          }}
        />
      )}
    </div>
  );
}

function SessionSkeletons() {
  return (
    <div className='grid grid-cols-2 gap-2 sm:gap-2.5 pt-0.5'>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className='relative flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-border/70 bg-card/60 gap-2 sm:gap-2.5 min-w-0'
        >
          <div className='flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0'>
            <Skeleton className='size-8 sm:size-9 rounded-full shrink-0' />
            <div className='space-y-1.5 flex-1 min-w-0'>
              <Skeleton className='h-3.5 w-16 sm:w-20 rounded-md' />
              <Skeleton className='h-3 w-12 sm:w-16 rounded-md' />
            </div>
          </div>
          <Skeleton className='size-4 rounded-full shrink-0' />
        </div>
      ))}
    </div>
  );
}

function SessionEmptyState({ dateStr }: { dateStr: string }) {
  return (
    <div className='p-8 rounded-2xl border border-dashed border-border bg-muted/15 flex flex-col items-center justify-center text-center space-y-2.5 select-none'>
      <div className='size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground'>
        <Icons.calendar className='size-6' />
      </div>
      <div className='space-y-1 max-w-sm'>
        <p className='text-xs sm:text-sm font-bold text-foreground'>
          Tidak ada sesi dokter tersedia pada tanggal ini
        </p>
        <p className='text-xs text-muted-foreground leading-relaxed'>
          Dokter spesialis/umum poliklinik tidak membuka jadwal konsultasi pada {dateStr}. Silakan
          klik &ldquo;Kembali&rdquo; untuk memilih tanggal lain.
        </p>
      </div>
    </div>
  );
}

interface SessionListProps {
  sessions: BookingOptionShift[];
  timeSlot: string;
  onSelectSlot: (session: string, sessionId?: string) => void;
}

function SessionList({ sessions, timeSlot, onSelectSlot }: SessionListProps) {
  return (
    <div className='pt-0.5'>
      <RadioGroup
        value={timeSlot}
        onValueChange={(val) => onSelectSlot(val)}
        className='grid grid-cols-2 gap-2 sm:gap-2.5'
      >
        {sessions.map((session) => {
          const isSelected = timeSlot === session.session;
          const isDisabled = session.isDisabled;
          const SessionIcon = getSessionIcon(session.session);
          const primaryPractitioner = session.practitioners?.[0];

          return (
            <div
              key={session.session}
              role='button'
              tabIndex={isDisabled ? -1 : 0}
              onKeyDown={(e) => {
                if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onSelectSlot(session.session, primaryPractitioner?.sessionId);
                }
              }}
              onClick={() => {
                if (!isDisabled) {
                  onSelectSlot(session.session, primaryPractitioner?.sessionId);
                }
              }}
              className={cn(
                'relative flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all select-none gap-2 sm:gap-2.5 min-w-0',
                isDisabled
                  ? 'opacity-50 bg-muted/20 border-dashed border-border cursor-not-allowed'
                  : isSelected
                    ? 'border-2 border-primary bg-primary/5 shadow-xs cursor-pointer'
                    : 'border-border bg-card hover:border-primary/40 cursor-pointer'
              )}
            >
              <div className='flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1'>
                <div
                  className={cn(
                    'size-8 sm:size-9 rounded-full flex items-center justify-center shrink-0 transition-colors',
                    isDisabled
                      ? 'bg-muted text-muted-foreground'
                      : isSelected
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'bg-muted text-muted-foreground'
                  )}
                >
                  <SessionIcon className='size-3.5 sm:size-4' />
                </div>

                <div className='min-w-0 flex-1 space-y-1'>
                  <div className='text-xs sm:text-sm font-semibold text-foreground truncate'>
                    {session.label}
                  </div>

                  {!isDisabled && (
                    <div>
                      <span className='inline-flex items-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold leading-none'>
                        Sisa {session.availableSlots} slot
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className='shrink-0 pl-0.5'>
                <RadioGroupItem
                  value={session.session}
                  id={`session-radio-${session.session}`}
                  disabled={isDisabled}
                />
              </div>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}
