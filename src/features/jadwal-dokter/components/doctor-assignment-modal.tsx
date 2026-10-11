'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
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
    reason,
    setReason,
    rosterData,
    isLoadingRoster,
    historyData,
    isLoadingHistory,
    toggleSession,
    isSubmitting,
    handleSave
  } = useDoctorAssignmentModal({ doctor, isOpen, onClose });

  if (!doctor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl'>
        <DialogHeader className='p-6 pb-4 border-b border-border/60 bg-muted/20'>
          <div className='flex items-center justify-between'>
            <div>
              <DialogTitle className='text-xl font-bold flex items-center gap-2'>
                <Icons.settings className='size-5 text-primary' />
                Pengaturan Jadwal & Roster Dokter
              </DialogTitle>
              <DialogDescription className='text-sm text-muted-foreground mt-1'>
                {doctor.nama_dokter} &bull; {doctor.spesialisasi}
              </DialogDescription>
            </div>
          </div>

          <div className='flex items-center gap-2 mt-4'>
            <button
              type='button'
              onClick={() => setActiveTab('roster')}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer',
                activeTab === 'roster'
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              Jadwal Mingguan (Roster)
            </button>
            <button
              type='button'
              onClick={() => setActiveTab('history')}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer',
                activeTab === 'history'
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              Riwayat Perubahan (History)
            </button>
          </div>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto p-6'>
          {activeTab === 'roster' ? (
            <div>
              {isLoadingRoster ? (
                <div className='flex items-center justify-center py-16 text-muted-foreground gap-2'>
                  <Icons.spinner className='size-5 animate-spin' />
                  <span>Memuat konfigurasi roster dokter...</span>
                </div>
              ) : (
                <div className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {rosterData?.days.map((day) => {
                      const isDoctorAssignedOnDay = day.sessions.some((s) =>
                        Boolean(selectedAssignments[`${day.dow}_${s.sessionId}`])
                      );
                      const isDayActive = day.isOperatingDay || isDoctorAssignedOnDay;

                      return (
                        <div
                          key={day.dow}
                          className={cn(
                            'p-4 rounded-xl border transition-colors flex flex-col justify-between',
                            isDayActive
                              ? 'bg-card border-border/80'
                              : 'bg-muted/30 border-dashed border-border/50 opacity-80'
                          )}
                        >
                          <div className='flex items-center justify-between pb-2 mb-3 border-b border-border/40'>
                            <span className='font-bold text-sm text-foreground'>{day.dayName}</span>
                            <span
                              className={cn(
                                'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                                isDoctorAssignedOnDay
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : day.isOperatingDay
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-muted text-muted-foreground'
                              )}
                            >
                              {isDoctorAssignedOnDay
                                ? day.isOperatingDay
                                  ? 'Klinik Buka'
                                  : 'Roster Aktif'
                                : day.isOperatingDay
                                  ? 'Klinik Buka'
                                  : 'Libur'}
                            </span>
                          </div>

                        <div className='space-y-2'>
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
                                <div className='flex items-center gap-2.5 min-w-0'>
                                  <input
                                    id={`session-chk-${key}`}
                                    type='checkbox'
                                    aria-label={`${day.dayName} ${s.sessionLabel}`}
                                    checked={isChecked}
                                    onChange={() => toggleSession(day.dow, s.sessionId)}
                                    className='size-4 rounded border-border text-primary focus:ring-primary/30 accent-primary cursor-pointer'
                                  />
                                  <div className='truncate'>
                                    <div className='truncate font-medium'>{s.sessionLabel}</div>
                                    <div className='text-[10px] text-muted-foreground font-mono'>
                                      {s.timeRange}
                                    </div>
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

                  <div className='pt-4 border-t border-border/60 space-y-2'>
                    <label
                      htmlFor='roster-change-reason'
                      className='text-xs font-semibold text-foreground'
                    >
                      Catatan / Alasan Perubahan (Opsional)
                    </label>
                    <Input
                      id='roster-change-reason'
                      placeholder='Contoh: Penyesuaian jadwal dinas dokter mulai minggu ini'
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className='text-sm'
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {isLoadingHistory ? (
                <div className='flex items-center justify-center py-16 text-muted-foreground gap-2'>
                  <Icons.spinner className='size-5 animate-spin' />
                  <span>Memuat riwayat audit jadwal...</span>
                </div>
              ) : !historyData || historyData.items.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-16 text-center text-muted-foreground'>
                  <Icons.calendar className='size-10 text-muted-foreground/40 mb-2' />
                  <p className='font-semibold'>Belum Ada Riwayat Perubahan</p>
                  <p className='text-xs text-muted-foreground/80 mt-0.5'>
                    Seluruh perubahan status, buka/tutup, dan roster dokter akan tercatat di sini.
                  </p>
                </div>
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
                            {new Date(row.createdAt).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
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
                'Simpan Roster'
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DoctorAssignmentModal;
