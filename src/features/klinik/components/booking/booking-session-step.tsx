'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import type { ServiceCatalogItem } from '../../api/catalog.service';
import { cn } from '@/lib/utils';
import { useBookingSessions } from '../../model/useBookingSessions';
import type { BookingOptionShift } from '@/features/data-pasien/api/patient-affiliation-service';
import { ShiftIconDisplay } from '@/features/jadwal-dokter/components/settings/atoms/shift-icon-display';
import { QUEUE_LOAD_STATUS, QUEUE_LOAD_BADGE_STYLES } from '../../constants/queue-load.constants';
import { formatClinicDate } from '@/lib/date-format';

export interface BookingSessionStepProps {
  selectedService: ServiceCatalogItem | null;
  dateStr: string;
  session?: string;
  setSession?: (session: string) => void;
  onSelectSessionId?: (sessionId: string) => void;
  onSelectSessionLabel?: (label: string) => void;
  staffId?: string;
  poliklinikId?: string;
}

export function BookingSessionStep({
  selectedService,
  dateStr,
  session,
  setSession,
  onSelectSessionId,
  onSelectSessionLabel,
  staffId,
  poliklinikId
}: BookingSessionStepProps) {
  const effectivePoliklinikId = poliklinikId || selectedService?.poliklinikId;
  const currentSession = session ?? '';

  const handleSessionChange = (newSession: string, newLabel?: string) => {
    setSession?.(newSession);
    if (newLabel) {
      onSelectSessionLabel?.(newLabel);
    }
  };

  const { sessions: bookingSessions, isLoading: isLoadingSessions } = useBookingSessions(
    { dateStr, poliklinikId: effectivePoliklinikId, staffId, currentSession },
    {
      onSessionChange: (s) => handleSessionChange(s),
      onSessionIdChange: onSelectSessionId,
      onSessionLabelChange: onSelectSessionLabel
    }
  );

  return (
    <div className='space-y-4'>
      <div className='space-y-1.5'>
        <div>
          <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
            Pilih sesi praktik dokter jaga
          </h3>
          <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
            Tentukan shift konsultasi yang paling pas untuk pemeriksaanmu.
          </p>
        </div>
        <div className='flex items-center gap-1.5 text-xs font-semibold text-muted-foreground pt-0.5'>
          <Icons.calendar className='size-3.5 text-muted-foreground' />
          <span>{formatClinicDate(dateStr)}</span>
        </div>
      </div>

      {isLoadingSessions ? (
        <SessionSkeletons />
      ) : bookingSessions.length === 0 ? (
        <SessionEmptyState dateStr={dateStr} />
      ) : (
        <SessionList
          sessions={bookingSessions}
          session={currentSession}
          onSelectSession={(sess, sessionId, sessionLabel) => {
            handleSessionChange(sess, sessionLabel);
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
          Dokter spesialis/umum poliklinik tidak membuka jadwal konsultasi pada{' '}
          {formatClinicDate(dateStr)}. Silakan klik &ldquo;Kembali&rdquo; untuk memilih tanggal
          lain.
        </p>
      </div>
    </div>
  );
}

interface SessionListProps {
  sessions: BookingOptionShift[];
  session: string;
  onSelectSession: (session: string, sessionId?: string, sessionLabel?: string) => void;
}

function SessionList({ sessions, session, onSelectSession }: SessionListProps) {
  return (
    <div className='pt-0.5'>
      <RadioGroup
        value={session}
        onValueChange={(val) => {
          const matched = sessions.find((s) => s.session === val);
          onSelectSession(val, matched?.practitioners?.[0]?.sessionId, matched?.label);
        }}
        className='grid grid-cols-2 gap-2 sm:gap-2.5'
      >
        {sessions.map((sess) => {
          const isSelected = session === sess.session;
          const isDisabled = Boolean(sess.isDisabled);
          const primaryPractitioner = sess.practitioners?.[0];
          const loadStatus = sess.loadStatus;
          const badgeStyle = loadStatus
            ? QUEUE_LOAD_BADGE_STYLES[loadStatus]
            : QUEUE_LOAD_BADGE_STYLES[QUEUE_LOAD_STATUS.NORMAL];

          return (
            <div
              key={sess.session}
              role='button'
              tabIndex={isDisabled ? -1 : 0}
              onKeyDown={(e) => {
                if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onSelectSession(sess.session, primaryPractitioner?.sessionId, sess.label);
                }
              }}
              onClick={() => {
                if (!isDisabled) {
                  onSelectSession(sess.session, primaryPractitioner?.sessionId, sess.label);
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
                <ShiftIconDisplay
                  icon={sess.icon}
                  fallback={sess.shift || sess.session}
                  size='sm'
                  className={cn(
                    'rounded-full shrink-0',
                    isDisabled
                      ? 'bg-muted text-muted-foreground opacity-60'
                      : isSelected
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'bg-muted text-muted-foreground'
                  )}
                />

                <div className='min-w-0 flex-1 space-y-1'>
                  <div className='text-xs sm:text-sm font-semibold text-foreground truncate'>
                    {sess.label}
                  </div>

                  <div>
                    {isDisabled ? (
                      <span className='inline-flex items-center rounded-md bg-muted text-muted-foreground border px-1.5 py-0.5 text-[10px] font-semibold leading-none'>
                        {sess.isPast ? 'Waktu Terlewati' : sess.disabledReason || 'Sesi Tutup'}
                      </span>
                    ) : (
                      <span
                        className={cn(
                          'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold leading-none',
                          badgeStyle
                        )}
                      >
                        {loadStatus}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className='shrink-0 pl-0.5'>
                <RadioGroupItem
                  value={sess.session}
                  id={`session-radio-${sess.session}`}
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
