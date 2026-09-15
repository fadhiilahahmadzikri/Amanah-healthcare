'use client';

import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
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
import { useQueueView } from '../model/useQueueView';
import { cn } from '@/lib/utils';

export function QueueView() {
  const queueView = useQueueView();

  return (
    <div className='flex flex-col h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)] overflow-hidden font-sans select-none gap-3 pb-1'>
      {/* 1. Top Page Bar: Poliklinik Switcher Navigation */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0'>
        <div>
          <h2 className='text-lg sm:text-xl font-bold text-foreground tracking-tight'>
            Antrean Poliklinik
          </h2>
          <p className='text-xs text-muted-foreground'>
            Pantau status panggilan dan nomor antrean pasien secara real-time
          </p>
        </div>

        {/* Poli Switcher Tabs */}
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
      </div>

      {/* 2. Main Harmonized 2-Column Section (Exact 100% Viewport, Min-H-0, No Horizontal Scroll) */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-6 flex-1 min-h-0 items-stretch overflow-hidden'>
        {/* LEFT SIDE: YANG SEDANG DIPANGGIL (DOMINANT HERO CARD WITH REAL MULTI-CARD STACKING) */}
        <div className='lg:col-span-7 xl:col-span-7 flex flex-col min-h-0 h-full overflow-hidden'>
          <QueueCallingCard
            callingItem={queueView.currentCalling}
            nextItem={queueView.waitingList[0]}
            afterNextItem={queueView.waitingList[1]}
            timeRemaining={queueView.poliStats.timeRemaining}
            bookingTime={
              queueView.currentCalling?.estimated_time ||
              queueView.currentCalling?.called_time ||
              ''
            }
            className='flex-1 h-full'
          />
        </div>

        {/* RIGHT SIDE: YANG SEDANG DUDUK (20 SEATS PER PAGE - 4 ROWS X 5 COLS FULLY FILLING VERTICAL SPACE) */}
        <div className='lg:col-span-5 xl:col-span-5 rounded-[22px] border border-border/50 bg-card p-5 sm:p-6 shadow-none flex flex-col justify-between min-h-0 h-full overflow-hidden'>
          {/* Top Header & Search inside Right Box (Shrink-0) */}
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

            {/* Search Bar */}
            <div className='relative w-full'>
              <Icons.search className='size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
              <input
                type='text'
                aria-label='Cari nomor antrean atau nama pasien'
                value={queueView.searchQuery}
                onChange={(e) => queueView.actions.changeSearch(e.target.value)}
                placeholder='Cari nomor antrean atau nama...'
                className='w-full text-xs pl-8 pr-3 py-2 bg-background border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-none'
              />
            </div>
          </div>

          {/* Seat Grid Area (Strict 5 Columns x 4 Rows = 20 Seats, Fixed Slot Keys for Zero-Jump Transition) */}
          {queueView.paginatedSeats.length > 0 ? (
            <div className='flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-1.5 my-auto'>
              <div className='grid grid-cols-5 gap-2 sm:gap-2.5 items-start justify-items-center w-full'>
                {queueView.paginatedSeats.map((item, idx) => {
                  const isNextSeat = queueView.currentPage === 1 && idx === 0;
                  return <QueueSeatCard key={`seat-slot-${idx}`} item={item} isNext={isNextSeat} />;
                })}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Icons.inbox}
              title='Belum ada antrean'
              description={`Antrean ${queueView.activePoli} akan ditampilkan di sini setelah tersedia.`}
              className='flex-1 min-h-[320px] border-0 bg-transparent'
            />
          )}

          {/* Fixed Pinned Bottom Pagination Bar (Shrink-0, Never Gets Scrolled) */}
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
    </div>
  );
}
