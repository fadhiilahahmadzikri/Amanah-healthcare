'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LeaveCard } from './leave-card';
import { LeaveDetailSheet } from './leave-detail-sheet';
import { LeaveSettingsModal } from './leave-settings-modal';
import { LeavePayrollModal } from './leave-payroll-modal';
import { ReplacementDetailModal } from './replacement-detail-modal';
import { useAllLeavesQuery, useReplacementsQuery } from '../api/queries';
import { useLeaveRealtimeSync } from '../hooks/useLeaveRealtimeSync';
import type { LeaveRequestItem, ReplacementOpportunityItem } from '../api/types';

export function LeaveManagementView() {
  const searchParams = useSearchParams();
  const leaveIdParam = searchParams.get('leaveId');

  const { data: leaves = [], isLoading, refetch } = useAllLeavesQuery();
  const { data: replacements = [], refetch: refetchReplacements } = useReplacementsQuery('all');

  // Architectural decoupled real-time synchronization
  useLeaveRealtimeSync({
    refetch: () => {
      void refetch();
      void refetchReplacements();
    }
  });

  const [selectedLeave, setSelectedLeave] = useState<LeaveRequestItem | null>(null);
  const [selectedReplacement, setSelectedReplacement] = useState<ReplacementOpportunityItem | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPayrollOpen, setIsPayrollOpen] = useState(false);

  // Auto-open detail sheet when leaveId query param matches a leave request
  useEffect(() => {
    if (leaveIdParam && leaves.length > 0) {
      const matched = leaves.find((l) => l.id === leaveIdParam);
      if (matched) {
        setSelectedLeave(matched);
        setIsDetailOpen(true);
      }
    }
  }, [leaveIdParam, leaves]);

  const handleSelectLeave = (leave: LeaveRequestItem) => {
    setSelectedLeave(leave);
    setIsDetailOpen(true);
  };

  const doctorMidwifeLeaves = leaves.filter(
    (l) => l.staff?.staffType === 'doctor' || l.staff?.staffType === 'midwife'
  );
  const workerLeaves = leaves.filter((l) => l.staff?.staffType === 'worker');

  return (
    <>
      <LeaveDetailSheet
        leave={selectedLeave}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedLeave(null);
        }}
      />

      <LeaveSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <LeavePayrollModal isOpen={isPayrollOpen} onClose={() => setIsPayrollOpen(false)} />

      <ReplacementDetailModal
        replacement={selectedReplacement}
        isOpen={!!selectedReplacement}
        onClose={() => setSelectedReplacement(null)}
      />

      <div className='flex h-full min-h-0 flex-1 flex-col gap-4 select-none'>
        {/* Top Header Actions */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0'>
          <div>
            <h2 className='text-xl font-bold tracking-tight text-foreground'>
              Manajemen Perizinan &amp; Cuti
            </h2>
            <p className='text-xs text-muted-foreground mt-0.5'>
              Persetujuan cuti dokter &amp; staf, distribusi peluang jadwal pengganti, dan
              rekapitulasi dinas.
            </p>
          </div>

          <div className='flex items-center gap-2 shrink-0'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsPayrollOpen(true)}
              className='h-9 gap-1.5 text-xs rounded-xl'
            >
              <Icons.calendar className='size-4 text-primary' />
              Kalkulasi Payroll
            </Button>

            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsSettingsOpen(true)}
              className='h-9 gap-1.5 text-xs rounded-xl'
            >
              <Icons.settings className='size-4 text-muted-foreground' />
              Pengaturan Kebijakan
            </Button>
          </div>
        </div>

        {/* Tabbed Content: All, Practitioner, Staff, Replacement Slots */}
        <Tabs defaultValue='all' className='flex flex-col flex-1 min-h-0'>
          <TabsList className='w-full sm:w-auto self-start grid grid-cols-4 sm:flex gap-1 mb-3'>
            <TabsTrigger value='all' className='text-xs px-3'>
              Semua Izin ({leaves.length})
            </TabsTrigger>
            <TabsTrigger value='practitioners' className='text-xs px-3'>
              Dokter &amp; Bidan ({doctorMidwifeLeaves.length})
            </TabsTrigger>
            <TabsTrigger value='workers' className='text-xs px-3'>
              Staf Operasional ({workerLeaves.length})
            </TabsTrigger>
            <TabsTrigger value='replacements' className='text-xs px-3'>
              Peluang Pengganti ({replacements.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: ALL LEAVES */}
          <TabsContent value='all' className='flex-1 min-h-0 relative m-0'>
            {isLoading ? (
              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-20 pt-1'>
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div
                    key={idx}
                    className='h-48 rounded-2xl bg-muted/20 animate-pulse border border-border/40'
                  />
                ))}
              </div>
            ) : leaves.length === 0 ? (
              <EmptyState
                icon={Icons.calendar}
                title='Belum ada permohonan cuti'
                description='Seluruh permohonan cuti staf klinik akan ditampilkan di sini.'
                className='h-full w-full flex-1'
              />
            ) : (
              <ScrollArea className='h-full w-full pr-0 md:pr-3'>
                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-20 pt-1'>
                  {leaves.map((leave) => (
                    <LeaveCard key={leave.id} leave={leave} onSelect={handleSelectLeave} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* TAB 2: PRACTITIONERS */}
          <TabsContent value='practitioners' className='flex-1 min-h-0 relative m-0'>
            {isLoading ? (
              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-20 pt-1'>
                {[1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className='h-48 rounded-2xl bg-muted/20 animate-pulse border border-border/40'
                  />
                ))}
              </div>
            ) : doctorMidwifeLeaves.length === 0 ? (
              <EmptyState
                icon={Icons.user}
                title='Tidak ada izin dokter & bidan'
                description='Belum ada permohonan cuti yang diajukan oleh dokter maupun bidan.'
                className='h-full w-full flex-1'
              />
            ) : (
              <ScrollArea className='h-full w-full pr-0 md:pr-3'>
                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-20 pt-1'>
                  {doctorMidwifeLeaves.map((leave) => (
                    <LeaveCard key={leave.id} leave={leave} onSelect={handleSelectLeave} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* TAB 3: WORKERS */}
          <TabsContent value='workers' className='flex-1 min-h-0 relative m-0'>
            {isLoading ? (
              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-20 pt-1'>
                {[1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className='h-48 rounded-2xl bg-muted/20 animate-pulse border border-border/40'
                  />
                ))}
              </div>
            ) : workerLeaves.length === 0 ? (
              <EmptyState
                icon={Icons.teams}
                title='Tidak ada izin staf operasional'
                description='Belum ada permohonan cuti yang diajukan oleh staf operasional klinik.'
                className='h-full w-full flex-1'
              />
            ) : (
              <ScrollArea className='h-full w-full pr-0 md:pr-3'>
                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-20 pt-1'>
                  {workerLeaves.map((leave) => (
                    <LeaveCard key={leave.id} leave={leave} onSelect={handleSelectLeave} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          {/* TAB 4: REPLACEMENTS */}
          <TabsContent value='replacements' className='flex-1 min-h-0 relative m-0'>
            {replacements.length === 0 ? (
              <EmptyState
                icon={Icons.clock}
                title='Tidak ada jadwal pengganti'
                description='Saat permohonan izin staf disetujui, sesi dinas mereka akan otomatis tersedia di sini dan di aplikasi mobile untuk diambil oleh rekan sejawat.'
                className='h-full w-full flex-1'
              />
            ) : (
              <ScrollArea className='h-full w-full pr-0 md:pr-3'>
                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-20 pt-1'>
                  {replacements.map((rep) => {
                    const isClaimed = rep.status === 'claimed';
                    const isCompleted = rep.status === 'completed';
                    const isCancelled = rep.status === 'cancelled';
                    const isOpen = rep.status === 'open';

                    return (
                      <div
                        key={rep.id}
                        onClick={() => setSelectedReplacement(rep)}
                        className='bg-card border border-border/60 p-4 rounded-2xl flex flex-col justify-between gap-3 text-xs shadow-xs hover:border-border hover:shadow-md cursor-pointer transition-all'
                      >
                        <div className='flex items-center justify-between'>
                          <span className='font-semibold text-foreground text-xs'>
                            {rep.sessionLabel || rep.sessionCode || 'Sesi Dinas'}
                          </span>
                          {isOpen && (
                            <span className='bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide'>
                              Terbuka
                            </span>
                          )}
                          {isClaimed && (
                            <span className='bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide'>
                              Diklaim
                            </span>
                          )}
                          {isCompleted && (
                            <span className='bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide'>
                              Selesai
                            </span>
                          )}
                          {isCancelled && (
                            <span className='bg-destructive/10 text-destructive px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide'>
                              Dibatalkan
                            </span>
                          )}
                        </div>

                        <div className='bg-muted/30 p-2.5 rounded-xl flex flex-col gap-2'>
                          <div className='flex items-center gap-1.5 text-foreground font-medium'>
                            <Icons.calendar className='size-3.5 text-muted-foreground' />
                            <span>Tanggal: {rep.workDate}</span>
                          </div>

                          {rep.startTime && rep.endTime && (
                            <div className='flex items-center gap-1.5 text-muted-foreground'>
                              <Icons.clock className='size-3.5 text-muted-foreground' />
                              <span>
                                Jam: {rep.startTime.slice(0, 5)} - {rep.endTime.slice(0, 5)} WIB
                              </span>
                            </div>
                          )}

                          <div className='flex items-center gap-2 text-muted-foreground'>
                            <Avatar className='size-5 rounded-md border border-border/40 shrink-0'>
                              <AvatarImage
                                src={rep.originalStaffAvatarUrl || ''}
                                alt={rep.originalStaffName || 'Staf'}
                              />
                              <AvatarFallback className='rounded-md text-[9px] font-semibold bg-primary/10 text-primary'>
                                {(rep.originalStaffName || 'S').charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className='truncate'>
                              Staf Izin:{' '}
                              <strong className='text-foreground'>
                                {rep.originalStaffName || 'Staf Klinik'}
                              </strong>
                              {rep.originalStaffRole && (
                                <span className='text-muted-foreground text-[10px] font-normal ml-1'>
                                  ({rep.originalStaffRole})
                                </span>
                              )}
                            </span>
                          </div>

                          <div className='flex items-center gap-2 text-muted-foreground'>
                            <Avatar className='size-5 rounded-md border border-border/40 shrink-0'>
                              <AvatarImage
                                src={rep.claimedByAvatarUrl || ''}
                                alt={rep.claimedByName || 'Pengganti'}
                              />
                              <AvatarFallback className='rounded-md text-[9px] font-semibold bg-emerald-500/10 text-emerald-600'>
                                {(rep.claimedByName || 'P').charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className='truncate'>
                              Pengganti:{' '}
                              {isClaimed && rep.claimedByName ? (
                                <>
                                  <strong className='text-primary font-semibold'>
                                    {rep.claimedByName}
                                  </strong>
                                  {rep.claimedByRole && (
                                    <span className='text-muted-foreground text-[10px] font-normal ml-1'>
                                      ({rep.claimedByRole})
                                    </span>
                                  )}
                                </>
                              ) : isOpen ? (
                                <span className='text-emerald-600 dark:text-emerald-400 font-medium'>
                                  Terbuka untuk diklaim rekan di mobile
                                </span>
                              ) : (
                                <span>-</span>
                              )}
                            </span>
                          </div>
                        </div>

                        <div className='flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40'>
                          <span>
                            {isClaimed
                              ? 'Staf pengganti sah untuk scan QR presensi.'
                              : 'Klik untuk melihat detail peluang dinas.'}
                          </span>
                          <span className='text-primary font-medium text-[10px]'>Detail →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
