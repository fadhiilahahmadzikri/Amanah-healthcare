'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { cn } from '@/lib/utils';
import { formatClinicDateTime } from '@/lib/date-format';
import type { DoctorSchedule } from '../api/types';
import { useDoctorAssignmentModal } from '../model/useDoctorAssignmentModal';
import { SCHEDULE_STATUS, SCHEDULE_STATUS_LABELS } from '../constants/schedule-shift.constants';

export interface DoctorAssignmentModalProps {
  doctor: DoctorSchedule | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DoctorAssignmentModal({ doctor, isOpen, onClose }: DoctorAssignmentModalProps) {
  const {
    activeTab,
    setActiveTab,
    selectedAssignments,
    rosterData,
    isLoadingRoster,
    historyData,
    isLoadingHistory,
    toggleSession,
    toggleDay,
    isSubmitting,
    handleSave
  } = useDoctorAssignmentModal({ doctor, isOpen, onClose });

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;
    gsap.fromTo(
      contentRef.current,
      { y: 12, opacity: 0, scale: 0.99 },
      { y: 0, opacity: 1, scale: 1, duration: 0.24, ease: 'power3.out' }
    );
  }, [activeTab]);

  if (!doctor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className='max-w-[96vw] sm:max-w-6xl xl:max-w-7xl max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl'
      >
        <DialogHeader className='p-6 pb-4 border-b border-border/60 bg-muted/20'>
          <div className='flex items-center justify-between'>
            <div>
              <DialogTitle className='text-xl font-bold tracking-tight text-foreground'>
                Pengaturan Jadwal Kerja Dokter
              </DialogTitle>
              <DialogDescription className='text-sm text-muted-foreground mt-1'>
                {doctor.nama_dokter} &bull; {doctor.spesialisasi}
              </DialogDescription>
            </div>
          </div>

          <div className='flex items-center gap-2 mt-4'>
            <Button
              type='button'
              variant={activeTab === 'roster' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setActiveTab('roster')}
              className='text-xs font-semibold'
            >
              Jadwal Kerja Mingguan
            </Button>
            <Button
              type='button'
              variant={activeTab === 'history' ? 'default' : 'ghost'}
              size='sm'
              onClick={() => setActiveTab('history')}
              className='text-xs font-semibold'
            >
              Riwayat Perubahan
            </Button>
          </div>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto p-6'>
          {activeTab === 'roster' ? (
            <div ref={contentRef}>
              {isLoadingRoster ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3'>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className='p-3.5 rounded-xl border border-border/50 bg-card/60 space-y-3'
                    >
                      <div className='flex items-center justify-between pb-2 border-b border-border/40'>
                        <Skeleton className='h-4 w-16 rounded-md' />
                        <Skeleton className='h-5 w-9 rounded-full' />
                      </div>
                      <div className='space-y-1.5'>
                        <Skeleton className='h-9 w-full rounded-lg' />
                        <Skeleton className='h-9 w-full rounded-lg' />
                        <Skeleton className='h-9 w-full rounded-lg' />
                        <Skeleton className='h-9 w-full rounded-lg' />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='space-y-6'>
                  <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3'>
                    {rosterData?.days.map((day) => {
                      const isDoctorAssignedOnDay = day.sessions.some((s) =>
                        Boolean(selectedAssignments[`${day.dow}_${s.sessionId}`])
                      );

                      return (
                        <div
                          key={day.dow}
                          className={cn(
                            'p-3.5 rounded-xl border transition-colors flex flex-col justify-between min-w-0',
                            isDoctorAssignedOnDay
                              ? 'bg-card border-border/80 shadow-2xs'
                              : !day.isOperatingDay
                                ? 'bg-muted/20 border-dashed border-border/40 opacity-75'
                                : 'bg-muted/30 border-border/60'
                          )}
                        >
                          <div className='flex items-center justify-between pb-2 mb-2.5 border-b border-border/40 gap-1.5'>
                            <div className='flex items-center gap-1.5 min-w-0'>
                              <span className='font-bold text-sm text-foreground whitespace-nowrap'>
                                {day.dayName}
                              </span>
                              {!day.isOperatingDay && (
                                <span className='text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold shrink-0'>
                                  Klinik Tutup
                                </span>
                              )}
                            </div>
                            <div className='flex items-center gap-1.5 shrink-0'>
                              <span
                                className={cn(
                                  'text-xs font-semibold',
                                  isDoctorAssignedOnDay ? 'text-primary' : 'text-muted-foreground'
                                )}
                              >
                                {isDoctorAssignedOnDay ? 'Aktif' : 'Libur'}
                              </span>
                              <Switch
                                checked={isDoctorAssignedOnDay}
                                onCheckedChange={() => toggleDay(day.dow)}
                                aria-label={`Aktifkan jadwal dokter hari ${day.dayName}`}
                              />
                            </div>
                          </div>

                          <div className='space-y-1.5'>
                            {day.sessions.map((s) => {
                              const key = `${day.dow}_${s.sessionId}`;
                              const isChecked = Boolean(selectedAssignments[key]);

                              return (
                                <label
                                  key={s.sessionId}
                                  htmlFor={`session-chk-${key}`}
                                  className={cn(
                                    'flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors',
                                    isChecked
                                      ? 'bg-primary/5 border-primary/40 text-foreground font-semibold'
                                      : 'bg-muted/20 border-border/40 text-muted-foreground hover:bg-muted/40'
                                  )}
                                >
                                  <div className='flex items-center gap-2.5 min-w-0 flex-1'>
                                    <input
                                      id={`session-chk-${key}`}
                                      type='checkbox'
                                      aria-label={`${day.dayName} ${s.sessionLabel}`}
                                      checked={isChecked}
                                      onChange={() => toggleSession(day.dow, s.sessionId)}
                                      className='size-4 rounded border-border text-primary focus:ring-primary/30 accent-primary cursor-pointer shrink-0'
                                    />
                                    <div className='min-w-0 flex-1 flex flex-col'>
                                      <span className='font-semibold text-xs whitespace-nowrap text-foreground'>
                                        {s.sessionLabel}
                                      </span>
                                      <span className='text-[10.5px] text-muted-foreground font-mono whitespace-nowrap'>
                                        {s.timeRange}
                                      </span>
                                    </div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {isLoadingHistory ? (
                <div className='p-2'>
                  <DataTableSkeleton columnCount={6} rowCount={4} withPagination={false} />
                </div>
              ) : !historyData || historyData.items.length === 0 ? (
                <EmptyState
                  title='Belum Ada Riwayat Perubahan'
                  description='Seluruh perubahan status dan jadwal kerja dokter akan tercatat di sini.'
                />
              ) : (
                <div className='rounded-xl border border-border overflow-hidden'>
                  <table className='w-full text-xs text-left'>
                    <thead className='bg-muted/40 font-semibold text-muted-foreground border-b border-border/60'>
                      <tr>
                        <th className='p-3'>Waktu</th>
                        <th className='p-3'>Aksi</th>
                        <th className='p-3'>Hari / Sesi</th>
                        <th className='p-3'>Status</th>
                        <th className='p-3'>Alasan</th>
                        <th className='p-3'>Oleh</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-border/40'>
                      {historyData.items.map((row) => (
                        <tr key={row.id} className='hover:bg-muted/20'>
                          <td className='p-3 font-mono text-muted-foreground whitespace-nowrap'>
                            {formatClinicDateTime(row.createdAt, { withSuffix: true })}
                          </td>
                          <td className='p-3 font-medium capitalize'>
                            {row.action.replace('_', ' ')}
                          </td>
                          <td className='p-3'>
                            {row.dayName || row.scheduleDate || '-'}
                            {row.sessionLabel ? ` (${row.sessionLabel})` : ''}
                          </td>
                          <td className='p-3'>
                            {row.newStatus ? (
                              <span
                                className={cn(
                                  'px-2 py-0.5 rounded-full font-bold text-[10px]',
                                  row.newStatus === SCHEDULE_STATUS.OPEN
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                )}
                              >
                                {row.newStatus === SCHEDULE_STATUS.OPEN
                                  ? SCHEDULE_STATUS_LABELS[SCHEDULE_STATUS.OPEN]
                                  : SCHEDULE_STATUS_LABELS[SCHEDULE_STATUS.CLOSED]}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className='p-3 text-muted-foreground max-w-[200px] truncate'>
                            {row.reason || '-'}
                          </td>
                          <td className='p-3 font-medium text-foreground'>
                            {row.changedByName || 'Sistem'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <div className='p-4 border-t border-border/60 bg-muted/20 flex items-center justify-end gap-2'>
          <Button type='button' variant='outline' onClick={onClose}>
            Tutup
          </Button>
          {activeTab === 'roster' && (
            <Button
              type='button'
              variant='default'
              disabled={isSubmitting || isLoadingRoster}
              onClick={handleSave}
              className='font-bold min-w-[120px]'
            >
              {isSubmitting ? (
                <>
                  <Icons.spinner className='size-4 animate-spin mr-2' />
                  Menyimpan...
                </>
              ) : (
                'Simpan Jadwal'
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
