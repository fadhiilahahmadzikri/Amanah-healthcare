'use client';

import React, { useState } from 'react';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Heading } from '@/components/ui/heading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { QueueCallingCard } from './queue-calling-card';
import { QueueSeatCard } from './queue-seat-card';
import { QueueViewSkeleton } from './queue-view-skeleton';
import { useQueueView } from '../model/useQueueView';
import { FacetSidebarSheet } from '@/shared/ui/responsive-facet-toolbox';
import { cn } from '@/lib/utils';

export function QueueView() {
  const queueView = useQueueView();
  const [isFacetOpen, setIsFacetOpen] = useState(false);

  return (
    <div className='flex flex-col h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)] overflow-hidden font-sans select-none gap-3 pb-1'>
      {/* Desktop Heading & Poli Tabs (Hidden on mobile) */}
      <div className='hidden lg:block shrink-0'>
        <Heading
          title='Antrean Poliklinik'
          description='Pantau status panggilan dan nomor antrean pasien secara real-time'
          trailing={
            <div className='inline-flex items-center gap-1 p-1 bg-muted rounded-xl self-start sm:self-auto overflow-x-auto border border-border/40 shrink-0'>
              {queueView.poliList.map((poli) => (
                <button
                  key={poli}
                  type='button'
                  onClick={() => queueView.actions.changePoli(poli)}
                  className={cn(
                    'px-3.5 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap cursor-pointer select-none',
                    queueView.activePoli === poli
                      ? 'bg-card text-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {poli}
                </button>
              ))}
            </div>
          }
          className='shrink-0'
        />
      </div>

      {queueView.isLoading && queueView.totalItems === 0 && !queueView.currentCalling ? (
        <QueueViewSkeleton />
      ) : !queueView.currentCalling && queueView.totalItems === 0 && !queueView.searchQuery ? (
        <div className='flex flex-1 min-h-0 h-full w-full flex-col'>
          <EmptyState
            icon={Icons.inbox}
            title='Belum Ada Antrean'
            description={`Antrean pasien untuk ${queueView.activePoli} belum tersedia saat ini.`}
            resetAction={
              queueView.isFiltered
                ? {
                    label: 'Reset',
                    onReset: queueView.actions.resetFilter,
                    icon: Icons.refresh
                  }
                : undefined
            }
            className='h-full w-full flex-1'
          />
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-6 flex-1 min-h-0 items-stretch overflow-hidden'>
          <div className='lg:col-span-7 xl:col-span-7 flex flex-col min-h-0 h-full overflow-hidden'>
            <QueueCallingCard
              callingItem={queueView.currentCalling}
              nextItem={queueView.waitingList[0]}
              afterNextItem={queueView.waitingList[1]}
              estimatedTime={
                queueView.currentCalling?.eta_range ||
                queueView.currentCalling?.estimated_time ||
                queueView.currentCalling?.called_time ||
                '-'
              }
              onOpenFacet={() => setIsFacetOpen(true)}
              isFiltered={queueView.isFiltered}
              onResetFilter={queueView.actions.resetFilter}
              className='flex-1 h-full'
            />
          </div>

          {/* Desktop Right Column: Daftar Antrean & Kursi */}
          <div className='hidden lg:flex lg:col-span-5 xl:col-span-5 rounded-[22px] border border-border/50 bg-card p-5 sm:p-6 shadow-none flex-col justify-between min-h-0 h-full overflow-hidden'>
            <div className='space-y-3 shrink-0'>
              <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-2'>
                  <h3 className='text-base font-bold text-foreground tracking-tight whitespace-nowrap'>
                    Daftar Antrean
                  </h3>
                  <Badge
                    variant='secondary'
                    className='text-[11px] font-medium px-2 py-0.5 whitespace-nowrap border border-border/40'
                  >
                    {queueView.waitingList.length} Kursi
                  </Badge>
                </div>

                <span className='text-xs text-muted-foreground truncate hidden sm:inline-block'>
                  {queueView.activePoli}
                </span>
              </div>

              <div className='relative w-full'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-muted-foreground'>
                  <Icons.search className='size-4' />
                </span>
                <input
                  type='text'
                  aria-label='Cari nomor antrean atau nama pasien'
                  value={queueView.searchQuery}
                  onChange={(e) => queueView.actions.changeSearch(e.target.value)}
                  placeholder='Cari nomor antrean atau nama...'
                  className='w-full h-9 pl-9 pr-8 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/70 rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-2xs'
                />
                {queueView.searchQuery && (
                  <button
                    type='button'
                    onClick={() => queueView.actions.changeSearch('')}
                    className='absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded-md hover:bg-muted transition-colors'
                    title='Hapus pencarian'
                    aria-label='Hapus pencarian'
                  >
                    <Icons.close className='size-3.5' />
                  </button>
                )}
              </div>
            </div>

            {queueView.paginatedSeats.length > 0 ? (
              <div className='flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-1.5 my-auto'>
                <div className='grid grid-cols-5 gap-2 sm:gap-2.5 items-start justify-items-center w-full'>
                  {queueView.paginatedSeats.map((item, idx) => {
                    const isNextSeat = queueView.currentPage === 1 && idx === 0;
                    return (
                      <QueueSeatCard key={`seat-slot-${idx}`} item={item} isNext={isNextSeat} />
                    );
                  })}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={Icons.inbox}
                title='Belum ada antrean'
                description={`Antrean ${queueView.activePoli} akan ditampilkan di sini setelah tersedia.`}
                resetAction={
                  queueView.isFiltered
                    ? {
                        label: 'Reset',
                        onReset: queueView.actions.resetFilter,
                        icon: Icons.refresh
                      }
                    : undefined
                }
                className='flex-1 min-h-[320px] border-0 bg-transparent'
              />
            )}

            <div className='pt-2.5 border-t border-border/40 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground shrink-0 mt-auto bg-card z-10'>
              <div className='whitespace-nowrap font-medium text-[11px]'>
                {queueView.totalItems} kursi menunggu
              </div>

              {queueView.totalItems > 0 && (
                <div className='flex items-center gap-2'>
                  <div className='flex items-center space-x-1.5'>
                    <span className='text-[11px] text-foreground font-medium'>Baris</span>
                    <Select
                      value={`${queueView.pageSize}`}
                      onValueChange={(value) => queueView.actions.changePageSize(Number(value))}
                    >
                      <SelectTrigger className='h-6.5 w-[4rem] text-[11px] px-2'>
                        <SelectValue placeholder={`${queueView.pageSize}`} />
                      </SelectTrigger>
                      <SelectContent side='top'>
                        {[20, 25, 30].map((opt) => (
                          <SelectItem key={opt} value={`${opt}`} className='text-xs'>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='text-[11px] font-medium text-foreground whitespace-nowrap'>
                    {queueView.currentPage}/{queueView.pageCount}
                  </div>

                  <div className='flex items-center space-x-0.5'>
                    <Button
                      aria-label='Halaman sebelumnya'
                      variant='outline'
                      size='icon'
                      className='size-6.5'
                      onClick={queueView.actions.previousPage}
                      disabled={!queueView.canPrevious}
                    >
                      <ChevronLeftIcon className='size-3' />
                    </Button>
                    <Button
                      aria-label='Halaman berikutnya'
                      variant='outline'
                      size='icon'
                      className='size-6.5'
                      onClick={queueView.actions.nextPage}
                      disabled={!queueView.canNext}
                    >
                      <ChevronRightIcon className='size-3' />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Facet Sidebar Sheet */}
      <FacetSidebarSheet
        isOpen={isFacetOpen}
        onClose={() => setIsFacetOpen(false)}
        title='Daftar Antrean & Filter'
        description='Pilih poliklinik dan pantau antrean kursi yang tersedia.'
        footerSlot={
          queueView.totalItems > 0 ? (
            <div className='flex items-center justify-between w-full text-xs text-muted-foreground'>
              <div className='flex items-center gap-1.5'>
                <span className='text-[11px] text-foreground font-medium'>Baris</span>
                <Select
                  value={`${queueView.pageSize}`}
                  onValueChange={(value) => queueView.actions.changePageSize(Number(value))}
                >
                  <SelectTrigger className='h-7 w-[4.2rem] text-[11px] px-2'>
                    <SelectValue placeholder={`${queueView.pageSize}`} />
                  </SelectTrigger>
                  <SelectContent side='top'>
                    {[20, 25, 30].map((opt) => (
                      <SelectItem key={opt} value={`${opt}`} className='text-xs'>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='text-[11px] font-medium text-foreground whitespace-nowrap'>
                {queueView.currentPage}/{queueView.pageCount}
              </div>

              <div className='flex items-center space-x-1'>
                {queueView.isFiltered && (
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      queueView.actions.resetFilter();
                      setIsFacetOpen(false);
                    }}
                    className='h-7 text-xs border-dashed text-muted-foreground hover:text-foreground mr-1'
                  >
                    <Icons.refresh className='size-3 mr-1' />
                    Reset
                  </Button>
                )}
                <Button
                  aria-label='Halaman sebelumnya'
                  variant='outline'
                  size='icon'
                  className='size-7'
                  onClick={queueView.actions.previousPage}
                  disabled={!queueView.canPrevious}
                >
                  <ChevronLeftIcon className='size-3.5' />
                </Button>
                <Button
                  aria-label='Halaman berikutnya'
                  variant='outline'
                  size='icon'
                  className='size-7'
                  onClick={queueView.actions.nextPage}
                  disabled={!queueView.canNext}
                >
                  <ChevronRightIcon className='size-3.5' />
                </Button>
              </div>
            </div>
          ) : (
            <div className='flex items-center justify-between w-full'>
              {queueView.isFiltered ? (
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    queueView.actions.resetFilter();
                    setIsFacetOpen(false);
                  }}
                  className='h-8 text-xs border-dashed text-muted-foreground hover:text-foreground'
                >
                  <Icons.refresh className='size-3 mr-1.5' />
                  Reset
                </Button>
              ) : (
                <div />
              )}
              <Button
                type='button'
                size='sm'
                onClick={() => setIsFacetOpen(false)}
                className='h-8 text-xs font-medium px-4 ml-auto'
              >
                Tutup
              </Button>
            </div>
          )
        }
      >
        {/* Tab Filter Poliklinik */}
        <div className='space-y-2 pb-3 border-b border-border/40'>
          <span className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
            <Icons.filter className='size-3.5 text-muted-foreground' />
            Poliklinik
          </span>
          <div className='flex flex-wrap gap-1.5 pt-0.5'>
            {queueView.poliList.map((poli) => {
              const isActive = queueView.activePoli === poli;
              return (
                <button
                  key={poli}
                  type='button'
                  onClick={() => {
                    queueView.actions.changePoli(poli);
                    setIsFacetOpen(false);
                  }}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer border',
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary shadow-2xs font-semibold'
                      : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border/60'
                  )}
                >
                  {poli}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar (Vertically centered icon and standardized with chat search) */}
        <div className='relative w-full'>
          <span className='absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-muted-foreground'>
            <Icons.search className='size-4' />
          </span>
          <input
            type='text'
            aria-label='Cari nomor antrean atau nama pasien'
            value={queueView.searchQuery}
            onChange={(e) => queueView.actions.changeSearch(e.target.value)}
            placeholder='Cari nomor antrean atau nama...'
            className='w-full h-9 pl-9 pr-8 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/70 rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-2xs'
          />
          {queueView.searchQuery && (
            <button
              type='button'
              onClick={() => queueView.actions.changeSearch('')}
              className='absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded-md hover:bg-muted transition-colors'
              title='Hapus pencarian'
              aria-label='Hapus pencarian'
            >
              <Icons.close className='size-3.5' />
            </button>
          )}
        </div>

        {/* Daftar Antrean Header (Normal capitalization) */}
        <div className='flex items-center justify-between gap-2 pt-2'>
          <div className='flex items-center gap-2'>
            <h4 className='text-xs sm:text-sm font-bold text-foreground'>Daftar Antrean</h4>
            <Badge
              variant='secondary'
              className='text-[10.5px] font-medium px-2 py-0.5 border border-border/40'
            >
              {queueView.waitingList.length} Kursi
            </Badge>
          </div>
          <span className='text-xs text-muted-foreground font-medium'>{queueView.activePoli}</span>
        </div>

        {/* Seat Grid Cards */}
        {queueView.paginatedSeats.length > 0 ? (
          <div className='py-1'>
            <div className='grid grid-cols-5 gap-2 items-start justify-items-center w-full'>
              {queueView.paginatedSeats.map((item, idx) => {
                const isNextSeat = queueView.currentPage === 1 && idx === 0;
                return <QueueSeatCard key={`sheet-seat-${idx}`} item={item} isNext={isNextSeat} />;
              })}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Icons.inbox}
            title='Belum ada antrean'
            description={`Antrean ${queueView.activePoli} akan ditampilkan di sini setelah tersedia.`}
            resetAction={
              queueView.isFiltered
                ? {
                    label: 'Reset',
                    onReset: () => {
                      queueView.actions.resetFilter();
                      setIsFacetOpen(false);
                    },
                    icon: Icons.refresh
                  }
                : undefined
            }
            className='py-8 border-0 bg-transparent'
          />
        )}
      </FacetSidebarSheet>
    </div>
  );
}
