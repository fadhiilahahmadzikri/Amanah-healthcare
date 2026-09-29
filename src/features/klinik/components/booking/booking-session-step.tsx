'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { CONSULTATION_SESSIONS } from '../../constants/consultation-sessions';
import type { ServiceCatalogItem } from '../../api/catalog.service';
import { cn } from '@/lib/utils';
import {
  patientAffiliationService,
  type BookingOptionShift
} from '@/features/data-pasien/api/patient-affiliation-service';

export interface BookingSessionStepProps {
  selectedService: ServiceCatalogItem | null;
  dateStr: string;
  timeSlot: string;
  setTimeSlot: (slot: string) => void;
  onSelectSessionId?: (sessionId: string) => void;
}

export function BookingSessionStep({
  selectedService,
  dateStr,
  timeSlot,
  setTimeSlot,
  onSelectSessionId
}: BookingSessionStepProps) {
  const [bookingSessions, setBookingSessions] = React.useState<BookingOptionShift[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = React.useState(true);

  const timeSlotRef = React.useRef(timeSlot);
  timeSlotRef.current = timeSlot;

  const onSelectSessionIdRef = React.useRef(onSelectSessionId);
  onSelectSessionIdRef.current = onSelectSessionId;

  React.useEffect(() => {
    let isMounted = true;
    async function fetchShifts() {
      setIsLoadingSessions(true);
      try {
        const sessions = await patientAffiliationService.getBookingOptions(
          dateStr,
          selectedService?.poliklinikId
        );
        if (isMounted) {
          setBookingSessions(sessions);
          const current = sessions.find((s) => s.session === timeSlotRef.current);
          if (!current || current.isDisabled) {
            const firstAvailable = sessions.find((s) => !s.isDisabled);
            if (firstAvailable) {
              setTimeSlot(firstAvailable.session);
              if (firstAvailable.practitioners[0]?.sessionId) {
                onSelectSessionIdRef.current?.(firstAvailable.practitioners[0].sessionId);
              }
            }
          } else if (current.practitioners[0]?.sessionId) {
            onSelectSessionIdRef.current?.(current.practitioners[0].sessionId);
          }
        }
      } catch (err) {
        console.error('Failed to load booking shifts:', err);
      } finally {
        if (isMounted) setIsLoadingSessions(false);
      }
    }
    fetchShifts();
    return () => {
      isMounted = false;
    };
  }, [dateStr, selectedService?.poliklinikId, setTimeSlot]);

  return (
    <div className='space-y-4'>
      <div className='flex items-start justify-between gap-2'>
        <div>
          <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
            Pilih sesi praktik dokter jaga ⏰
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

      {/* Shimmering Skeleton State while checking real backend availability */}
      {isLoadingSessions ? (
        <div className='space-y-2 pt-1'>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className='relative flex items-center justify-between p-3 rounded-xl border border-border/70 bg-card/60 gap-3'
            >
              <div className='flex items-center gap-3 flex-1 min-w-0'>
                <Skeleton className='size-9 sm:size-10 rounded-full shrink-0' />
                <div className='space-y-1.5 flex-1 min-w-0'>
                  <Skeleton className='h-4 w-20 rounded-md' />
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-3 w-28 rounded-md' />
                    <Skeleton className='h-3 w-16 rounded-md' />
                  </div>
                </div>
              </div>
              <Skeleton className='size-4 rounded-full shrink-0' />
            </div>
          ))}
        </div>
      ) : bookingSessions.length === 0 ? (
        /* Empty State if No Schedule in Backend */
        <div className='p-8 rounded-2xl border border-dashed border-border bg-muted/15 flex flex-col items-center justify-center text-center space-y-2.5 select-none'>
          <div className='size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground'>
            <Icons.calendar className='size-6' />
          </div>
          <div className='space-y-1 max-w-sm'>
            <p className='text-xs sm:text-sm font-bold text-foreground'>
              Tidak ada sesi dokter tersedia pada tanggal ini
            </p>
            <p className='text-xs text-muted-foreground leading-relaxed'>
              Dokter spesialis/umum poliklinik tidak membuka jadwal konsultasi pada {dateStr}. Silakan klik &ldquo;Kembali&rdquo; untuk memilih tanggal lain.
            </p>
          </div>
        </div>
      ) : (
        /* Real Backend SSOT Sessions - Zero Dummy Data */
        <div className='space-y-2 pt-0.5'>
          <RadioGroup
            value={timeSlot}
            onValueChange={(val) => setTimeSlot(val)}
            className='gap-2'
          >
            {bookingSessions.map((session) => {
              const isSelected = timeSlot === session.session;
              const isCardDisabled = session.isDisabled;
              const sessionConfig = CONSULTATION_SESSIONS.find((c) => c.value === session.session);
              const SessionIcon = sessionConfig?.icon || Icons.clock;
              const timeRange = `${session.startTime.slice(0, 5)} - ${session.endTime.slice(0, 5)} WIB`;
              const primaryPractitioner = session.practitioners?.[0];

              return (
                <div
                  key={session.session}
                  onClick={() => {
                    if (!isCardDisabled) {
                      setTimeSlot(session.session);
                      if (primaryPractitioner?.sessionId) {
                        onSelectSessionId?.(primaryPractitioner.sessionId);
                      }
                    }
                  }}
                  className={cn(
                    'relative flex items-center justify-between p-3 rounded-xl border transition-all select-none gap-3 min-w-0',
                    isCardDisabled
                      ? 'opacity-60 bg-muted/30 border-dashed border-border cursor-not-allowed'
                      : isSelected
                      ? 'border-2 border-primary bg-primary/5 shadow-xs cursor-pointer'
                      : 'border-border bg-card hover:border-primary/40 cursor-pointer'
                  )}
                >
                  <div className='flex items-center gap-3 min-w-0 flex-1'>
                    <div
                      className={cn(
                        'size-9 sm:size-10 rounded-full flex items-center justify-center shrink-0 transition-colors',
                        isCardDisabled
                          ? 'bg-muted text-muted-foreground'
                          : isSelected
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <SessionIcon className='size-4 sm:size-5' />
                    </div>

                    <div className='min-w-0 flex-1 space-y-0.5'>
                      <div className='text-xs sm:text-sm font-bold text-foreground truncate'>
                        {session.label}
                      </div>

                      <div className='flex items-center gap-2 flex-wrap'>
                        <span className='text-[11px] sm:text-xs text-muted-foreground font-medium'>
                          {timeRange}
                        </span>
                        {isCardDisabled ? (
                          <span className='inline-flex items-center rounded-md bg-destructive/10 text-destructive border border-destructive/20 px-1.5 py-0.5 text-[10px] font-semibold'>
                            {session.disabledReason || 'Sesi Tidak Tersedia'}
                          </span>
                        ) : (
                          <span className='inline-flex items-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold'>
                            Sisa {session.availableSlots} slot
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className='shrink-0 pl-1'>
                    <RadioGroupItem
                      value={session.session}
                      id={`session-radio-${session.session}`}
                      disabled={isCardDisabled}
                    />
                  </div>
                </div>
              );
            })}
          </RadioGroup>
        </div>
      )}
    </div>
  );
}
