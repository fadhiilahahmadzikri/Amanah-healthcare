'use client';

import React, { useEffect, useState } from 'react';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { getAppointmentCallAttempts, type AppointmentCallAttempt } from '../api/service';
import { cn } from '@/lib/utils';

export interface AppointmentCallAttemptsTimelineProps {
  appointmentId: string;
}

export function AppointmentCallAttemptsTimeline({
  appointmentId
}: AppointmentCallAttemptsTimelineProps) {
  const [attempts, setAttempts] = useState<AppointmentCallAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getAppointmentCallAttempts(appointmentId)
      .then((data) => {
        if (isMounted) {
          // Sort ascending for chronological timeline display
          // oxlint-disable-next-line unicorn/no-array-sort
          const sorted = [...data].sort((a, b) => a.attemptNumber - b.attemptNumber);
          setAttempts(sorted);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [appointmentId]);

  if (loading) {
    return (
      <div className='py-3 flex items-center gap-2 text-xs text-muted-foreground'>
        <Icons.refresh className='size-3.5 animate-spin' />
        <span>Memuat riwayat pemanggilan...</span>
      </div>
    );
  }

  if (attempts.length === 0) {
    return (
      <div className='py-2.5 px-3 rounded-xl bg-muted/30 border border-border/40 text-xs text-muted-foreground flex items-center gap-2'>
        <Icons.info className='size-4 text-muted-foreground/70 shrink-0' />
        <span>Belum ada riwayat pemanggilan untuk janji temu ini.</span>
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <span className='text-xs font-semibold text-foreground tracking-tight'>
          Riwayat Pemanggilan ({attempts.length}/3)
        </span>
        <span className='text-[11px] text-muted-foreground'>Kebijakan Retry: Maksimal 3 kali</span>
      </div>

      <div className='relative pl-4 space-y-3 before:absolute before:left-1.5 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-border/60'>
        {attempts.map((att) => {
          const isResponded = att.status === 'responded';
          const isNoResponse = att.status === 'no_show' || att.status === 'no_response';
          const formattedCallTime = att.calledAt
            ? new Date(att.calledAt).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
              }) + ' WIB'
            : '-';

          const formattedRespTime = att.respondedAt
            ? new Date(att.respondedAt).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
              }) + ' WIB'
            : null;

          return (
            <div key={att.id || `att-${att.attemptNumber}`} className='relative text-xs'>
              {/* Dot Indicator */}
              <div
                className={cn(
                  'absolute -left-4 top-1 size-3 rounded-full ring-2 ring-background border',
                  isResponded
                    ? 'bg-emerald-500 border-emerald-600'
                    : isNoResponse
                      ? 'bg-amber-500 border-amber-600'
                      : 'bg-primary border-primary'
                )}
              />

              <div className='flex flex-wrap items-center justify-between gap-1.5'>
                <div className='flex items-center gap-2'>
                  <span className='font-bold text-foreground'>
                    Panggilan Ke-{att.attemptNumber}
                  </span>
                  <Badge
                    variant={isResponded ? 'default' : isNoResponse ? 'secondary' : 'outline'}
                    className={cn(
                      'text-[10px] px-1.5 py-0 font-medium',
                      isResponded && 'bg-emerald-600 text-white',
                      isNoResponse &&
                        'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                    )}
                  >
                    {isResponded ? 'Pasien Hadir' : isNoResponse ? 'Tidak Merespons' : 'Dipanggil'}
                  </Badge>
                </div>
                <span className='text-[11px] text-muted-foreground font-mono'>
                  {formattedCallTime}
                </span>
              </div>

              {formattedRespTime && (
                <p className='text-[11px] text-muted-foreground mt-0.5'>
                  Hadir pada: {formattedRespTime}
                </p>
              )}

              {att.notes && (
                <p className='text-[11px] text-muted-foreground/90 mt-0.5 italic'>
                  Catatan: {att.notes}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
