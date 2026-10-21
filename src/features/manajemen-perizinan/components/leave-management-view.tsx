'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EntityCardGrid, EntityCardGridSkeleton } from '@/components/cards/master-entity-card';
import { LeaveCard } from './leave-card';
import { LeaveDetailSheet } from './leave-detail-sheet';
import { LeaveSettingsModal } from './leave-settings-modal';
import { LeavePayrollModal } from './leave-payroll-modal';
import { ReplacementDetailModal } from './replacement-detail-modal';
import { LeaveManagementToolbar } from './leave-management-toolbar';
import { useLeaveManagementPresenter, type LeaveTabKey } from '../model';

export function LeaveManagementView() {
  const {
    view,
    replacements,
    isLoading,
    detailModal,
    replacementModal,
    settingsModal,
    payrollModal
  } = useLeaveManagementPresenter();

  return (
    <>
      <LeaveDetailSheet
        leave={detailModal.selectedLeave}
        isOpen={detailModal.isOpen}
        onClose={detailModal.close}
      />

      <LeaveSettingsModal isOpen={settingsModal.isOpen} onClose={settingsModal.close} />

      <LeavePayrollModal isOpen={payrollModal.isOpen} onClose={payrollModal.close} />

      <ReplacementDetailModal
        replacement={replacementModal.selectedReplacement}
        isOpen={replacementModal.isOpen}
        onClose={replacementModal.close}
      />

      <div className='flex h-full min-h-0 flex-1 flex-col gap-4 select-none'>
        {/* Top Control Toolbar (Filter & Action Row) */}
        <LeaveManagementToolbar
          searchQuery={view.searchQuery}
          onSearchChange={view.actions.changeSearch}
          statusFilter={view.statusFilter}
          onStatusFilterChange={view.actions.changeStatusFilter}
          staffTypeFilter={view.staffTypeFilter}
          onStaffTypeFilterChange={view.actions.changeStaffTypeFilter}
          hasActiveFilters={view.hasActiveFilters}
          onResetFilters={view.actions.resetFilters}
          onOpenPayroll={payrollModal.open}
          onOpenSettings={settingsModal.open}
        />

        {/* Tabbed Content */}
        <Tabs
          value={view.activeTab}
          onValueChange={(val) => view.actions.changeTab(val as LeaveTabKey)}
          className='flex flex-col flex-1 min-h-0'
        >
          <TabsList className='w-full sm:w-auto self-start grid grid-cols-4 sm:flex gap-1 mb-3 h-9'>
            <TabsTrigger value='all' className='text-xs px-3'>
              Semua Izin ({view.counts.all})
            </TabsTrigger>
            <TabsTrigger value='practitioners' className='text-xs px-3'>
              Dokter &amp; Bidan ({view.counts.practitioners})
            </TabsTrigger>
            <TabsTrigger value='workers' className='text-xs px-3'>
              Staf Operasional ({view.counts.workers})
            </TabsTrigger>
            <TabsTrigger value='replacements' className='text-xs px-3'>
              Peluang Pengganti ({view.counts.replacements})
            </TabsTrigger>
          </TabsList>

          {/* TAB: LEAVES (all, practitioners, workers) */}
          {['all', 'practitioners', 'workers'].map((tabKey) => (
            <TabsContent
              key={tabKey}
              value={tabKey}
              className='relative flex flex-1 min-h-0 flex-col overflow-hidden m-0'
            >
              {isLoading && view.filteredLeaves.length === 0 ? (
                <div className='absolute inset-0 flex overflow-hidden'>
                  <ScrollArea className='h-full w-full pr-0 md:pr-3'>
                    <div className='pb-20 pt-1'>
                      <EntityCardGridSkeleton count={6} />
                    </div>
                  </ScrollArea>
                </div>
              ) : view.filteredLeaves.length === 0 ? (
                <div className='flex flex-1 min-h-0 h-full w-full flex-col'>
                  <EmptyState
                    icon={Icons.calendar}
                    title='Tidak ada permohonan izin ditemukan'
                    description={
                      view.hasActiveFilters
                        ? 'Tidak ada permohonan yang sesuai dengan filter atau kata kunci pencarian.'
                        : 'Belum ada permohonan izin staf pada kategori ini.'
                    }
                    action={
                      view.hasActiveFilters ? (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={view.actions.resetFilters}
                          className='h-9 text-xs'
                        >
                          Reset Filter
                        </Button>
                      ) : undefined
                    }
                    className='h-full w-full flex-1'
                  />
                </div>
              ) : (
                <div className='absolute inset-0 flex overflow-hidden'>
                  <ScrollArea className='h-full w-full pr-0 md:pr-3'>
                    <div className='pb-20 pt-1'>
                      <EntityCardGrid>
                        {view.filteredLeaves.map((leave) => (
                          <LeaveCard
                            key={leave.id}
                            leave={leave}
                            onSelect={detailModal.open}
                            isSelected={detailModal.selectedLeave?.id === leave.id}
                          />
                        ))}
                      </EntityCardGrid>
                    </div>
                  </ScrollArea>
                </div>
              )}
            </TabsContent>
          ))}

          {/* TAB: REPLACEMENTS */}
          <TabsContent
            value='replacements'
            className='relative flex flex-1 min-h-0 flex-col overflow-hidden m-0'
          >
            {replacements.length === 0 ? (
              <EmptyState
                icon={Icons.clock}
                title='Tidak ada jadwal pengganti'
                description='Saat permohonan izin staf disetujui, sesi dinas mereka akan otomatis tersedia di sini untuk diambil oleh rekan sejawat.'
                className='h-full w-full flex-1'
              />
            ) : (
              <div className='absolute inset-0 flex overflow-hidden'>
                <ScrollArea className='h-full w-full pr-0 md:pr-3'>
                  <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-20 pt-1'>
                    {replacements.map((rep) => {
                      const isClaimed = rep.status === 'claimed';
                      const isCompleted = rep.status === 'completed';
                      const isCancelled = rep.status === 'cancelled';
                      const isOpen = rep.status === 'open';

                      return (
                        <button
                          type='button'
                          key={rep.id}
                          onClick={() => replacementModal.open(rep)}
                          className='text-left bg-card border border-border/60 p-4 rounded-2xl flex flex-col justify-between gap-3 text-xs shadow-xs hover:border-border hover:shadow-md cursor-pointer transition-all w-full'
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
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
