'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import gsap from 'gsap';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { QueueItem } from '../api/types';
import { QueueCallingCard } from './queue-calling-card';
import { QueueSeatCard } from './queue-seat-card';
import { loadStoredQueues, saveQueuesToStorage } from '../api/service';
import initialQueues from '../data/queues.json';
import { cn } from '@/lib/utils';

export function QueueView() {
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activePoli, setActivePoli] = useState('Poli Umum');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const isAnimatingRef = useRef(false);
  const currentMinutesRef = useRef(120);

  useEffect(() => {
    const data = loadStoredQueues();
    setQueues(data);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      saveQueuesToStorage(queues);
    }
  }, [queues, isInitialized]);

  const poliList = ['Poli Umum', 'Poli Anak', 'Poli Gigi', 'Poli Obgyn'];

  // Dynamic Calling Patient for currently selected Poli
  const currentCalling = useMemo(() => {
    return queues.find((q) => q.status === 'DIPANGGIL' && q.poli === activePoli);
  }, [queues, activePoli]);

  // Filtered Waiting Patients for currently selected Poli
  const waitingList = useMemo(() => {
    return queues.filter((item) => {
      const isWaiting = item.status === 'MENUNGGU';
      const matchesPoli = item.poli === activePoli;
      const matchesSearch =
        !searchQuery.trim() ||
        item.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.queue_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.doctor_name.toLowerCase().includes(searchQuery.toLowerCase());

      return isWaiting && matchesPoli && matchesSearch;
    });
  }, [queues, activePoli, searchQuery]);

  // Pagination calculations
  const totalItems = waitingList.length;
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
  const canPrevious = currentPage > 1;
  const canNext = currentPage < pageCount;

  // Paginated list for seat grid (20 seats per page default: 4 rows of 5)
  const paginatedSeats = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return waitingList.slice(start, start + pageSize);
  }, [waitingList, currentPage, pageSize]);

  // Stats dynamically calculated per Poli
  const totalWaitingCount = waitingList.length;

  useEffect(() => {
    currentMinutesRef.current = totalWaitingCount * 6;
  }, [totalWaitingCount, activePoli]);

  const poliStats = useMemo(() => {
    const allInPoli = queues.filter((q) => q.poli === activePoli);
    const totalEstimateMins = waitingList.length * 6;
    const timeRemainingStr = totalEstimateMins > 0 ? `${totalEstimateMins} Menit` : '0 Menit';

    return {
      totalToday: `${allInPoli.length} Pasien`,
      timeRemaining: timeRemainingStr,
      operationalHours: '08.00 - 17.00 WIB'
    };
  }, [queues, activePoli, waitingList.length]);

  // Function to reset / reload fresh 20-seat batch when fully drained
  const handleResetPoliQueues = useCallback(() => {
    const freshForPoli = (initialQueues as QueueItem[]).filter((q) => q.poli === activePoli);
    setQueues((prev) => [...prev.filter((q) => q.poli !== activePoli), ...freshForPoli]);
  }, [activePoli]);

  // Completely Smooth Grounded Relay Queue Rotation (Zero Jolt / Sentakan)
  const triggerRotateQueue = useCallback(() => {
    if (isAnimatingRef.current) return;

    const inPoli = queues.filter((q) => q.poli === activePoli);
    const currentCall = inPoli.find((q) => q.status === 'DIPANGGIL');
    const firstWaiting = inPoli.find((q) => q.status === 'MENUNGGU');

    if (!firstWaiting && !currentCall) {
      return;
    }

    isAnimatingRef.current = true;

    // 1. Time Remaining Animated Count Down
    const timeEl = document.getElementById('time-remaining-value');
    const startMins = currentMinutesRef.current;
    const endMins = Math.max(0, (waitingList.length - 1) * 6);
    currentMinutesRef.current = endMins;

    const countObj = { val: startMins };
    gsap.to(countObj, {
      val: endMins,
      duration: 1.0,
      ease: 'power2.out',
      onUpdate: () => {
        if (timeEl) {
          timeEl.innerText = `${Math.round(countObj.val)} Menit`;
        }
      }
    });

    // 2. Main Animation Timeline
    const tl = gsap.timeline({
      onComplete: () => {
        // Advance React state
        setQueues((prev) => {
          const list = prev.filter((q) => q.poli === activePoli);
          const activeCall = list.find((q) => q.status === 'DIPANGGIL');
          const nextWaiting = list.find((q) => q.status === 'MENUNGGU');

          if (!nextWaiting && activeCall) {
            return prev.map((item) => {
              if (item.queue_number === activeCall.queue_number) {
                return { ...item, status: 'SELESAI' as const };
              }
              return item;
            });
          }

          if (!nextWaiting) return prev;

          return prev.map((item) => {
            if (item.queue_number === nextWaiting.queue_number) {
              return {
                ...item,
                status: 'DIPANGGIL' as const,
                called_time:
                  new Date().toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                  }) + ' WIB'
              };
            }
            if (activeCall && item.queue_number === activeCall.queue_number) {
              return { ...item, status: 'SELESAI' as const };
            }
            return item;
          });
        });

        // Double-RAF ensures React paint is complete before clearing GSAP transform styles
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            gsap.set('.seat-grid-card', { clearProps: 'transform,opacity' });
            gsap.set(['#stack-layer-1', '#stack-layer-2'], { clearProps: 'all' });
            isAnimatingRef.current = false;
          });
        });

        // Smooth entry for hero card
        gsap.fromTo(
          '#hero-front-card',
          { scale: 0.95, y: 12, filter: 'blur(8px)', opacity: 0 },
          {
            scale: 1,
            y: 0,
            filter: 'blur(0px)',
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out'
          }
        );
      }
    });

    // 1. Hero Front Card Transition
    tl.to(
      '#hero-front-card',
      {
        scale: 1.06,
        y: -24,
        filter: 'blur(12px)',
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in'
      },
      0
    );

    // 2. Real Stacking Layer 1 Steps Up
    tl.to(
      '#stack-layer-1',
      {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out'
      },
      0
    );

    // 3. Real Stacking Layer 2 Steps Up
    tl.to(
      '#stack-layer-2',
      {
        top: 8,
        bottom: 6,
        opacity: 0.85,
        scale: 0.98,
        duration: 0.4,
        ease: 'power2.out'
      },
      0
    );

    // 4. Smooth Trailing Estafet Sliding Motion on Waiting Seats (Ease In-Out, Zero Stutter)
    const seatCards = Array.from(document.querySelectorAll<HTMLElement>('.seat-grid-card'));
    if (seatCards.length > 0) {
      // First card (NEXT) smoothly slides left & fades out
      tl.to(
        seatCards[0],
        {
          x: -40,
          opacity: 0,
          scale: 0.92,
          duration: 0.35,
          ease: 'power2.inOut'
        },
        0
      );

      // Remaining cards slide smoothly into their predecessor's exact spot
      for (let i = 1; i < seatCards.length; i++) {
        const prevCard = seatCards[i - 1];
        const currentCard = seatCards[i];
        const prevRect = prevCard.getBoundingClientRect();
        const currRect = currentCard.getBoundingClientRect();
        const deltaX = prevRect.left - currRect.left;
        const deltaY = prevRect.top - currRect.top;

        // Elegant trailing wave delay (0.016s per slot)
        const estafetDelay = 0.016 * i;

        tl.to(
          currentCard,
          {
            x: deltaX,
            y: deltaY,
            duration: 0.38,
            ease: 'power2.inOut'
          },
          estafetDelay
        );
      }
    }
  }, [queues, activePoli, waitingList.length]);

  // Autoplay loop every 3.5 seconds
  useEffect(() => {
    if (!isInitialized) return;

    const inPoli = queues.filter((q) => q.poli === activePoli);
    const hasWaiting = inPoli.some((q) => q.status === 'MENUNGGU');
    const hasCalling = inPoli.some((q) => q.status === 'DIPANGGIL');

    if (!hasWaiting && !hasCalling) {
      const resetTimeout = setTimeout(() => {
        handleResetPoliQueues();
      }, 5000);
      return () => clearTimeout(resetTimeout);
    }

    const interval = setInterval(() => {
      triggerRotateQueue();
    }, 3500);

    return () => clearInterval(interval);
  }, [isInitialized, queues, activePoli, triggerRotateQueue, handleResetPoliQueues]);

  const handlePoliChange = (poli: string) => {
    setActivePoli(poli);
    setSearchQuery('');
    setCurrentPage(1);
  };

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
          {poliList.map((poli) => (
            <button
              key={poli}
              type='button'
              onClick={() => handlePoliChange(poli)}
              className={cn(
                'px-3.5 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap cursor-pointer select-none',
                activePoli === poli
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
            callingItem={currentCalling}
            nextItem={waitingList[0]}
            afterNextItem={waitingList[1]}
            timeRemaining={poliStats.timeRemaining}
            bookingTime={
              currentCalling?.estimated_time || currentCalling?.called_time || '10:30 WIB'
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
                  {waitingList.length} Kursi
                </Badge>
              </div>

              <span className='text-xs text-muted-foreground truncate hidden sm:inline-block'>
                {activePoli}
              </span>
            </div>

            {/* Search Bar */}
            <div className='relative w-full'>
              <Icons.search className='size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
              <input
                type='text'
                aria-label='Cari nomor antrean atau nama pasien'
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder='Cari nomor antrean atau nama...'
                className='w-full text-xs pl-8 pr-3 py-2 bg-background border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-none'
              />
            </div>
          </div>

          {/* Seat Grid Area (Strict 5 Columns x 4 Rows = 20 Seats, Fixed Slot Keys for Zero-Jump Transition) */}
          {paginatedSeats.length > 0 ? (
            <div className='flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-1.5 my-auto'>
              <div className='grid grid-cols-5 gap-2 sm:gap-2.5 items-start justify-items-center w-full'>
                {paginatedSeats.map((item, idx) => {
                  const isNextSeat = currentPage === 1 && idx === 0;
                  return <QueueSeatCard key={`seat-slot-${idx}`} item={item} isNext={isNextSeat} />;
                })}
              </div>
            </div>
          ) : (
            /* True Empty State when Queue is Drained / Finished */
            <div className='py-8 px-4 text-center space-y-3 flex-1 flex flex-col items-center justify-center'>
              <div className='size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto ring-4 ring-primary/5'>
                <Icons.check className='size-6 stroke-[2.5]' />
              </div>
              <div className='space-y-1'>
                <h4 className='text-sm sm:text-base font-bold text-foreground'>
                  Semua Antrean Selesai Dilayani
                </h4>
                <p className='text-[11px] sm:text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed'>
                  Seluruh kursi antrean di {activePoli} telah dikosongkan. Sistem akan memuat
                  antrean baru dalam beberapa detik.
                </p>
              </div>
              <Button
                variant='outline'
                size='sm'
                onClick={handleResetPoliQueues}
                className='text-xs h-7.5 px-3 rounded-lg border-border/60'
              >
                Muat Ulang Antrean Sekarang
              </Button>
            </div>
          )}

          {/* Fixed Pinned Bottom Pagination Bar (Shrink-0, Never Gets Scrolled) */}
          <div className='pt-2.5 border-t border-border/40 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground shrink-0 mt-auto bg-card z-10'>
            <div className='whitespace-nowrap font-medium text-[11px]'>
              {totalItems} kursi menunggu
            </div>

            {totalItems > 0 && (
              <div className='flex items-center gap-2'>
                <div className='flex items-center space-x-1.5'>
                  <span className='text-[11px] text-foreground font-medium'>Baris</span>
                  <Select
                    value={`${pageSize}`}
                    onValueChange={(value) => {
                      setPageSize(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className='h-6.5 w-[4rem] text-[11px] px-2'>
                      <SelectValue placeholder={`${pageSize}`} />
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
                  {currentPage}/{pageCount}
                </div>

                <div className='flex items-center space-x-0.5'>
                  <Button
                    aria-label='Halaman sebelumnya'
                    variant='outline'
                    size='icon'
                    className='size-6.5'
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={!canPrevious}
                  >
                    <ChevronLeftIcon className='size-3' />
                  </Button>
                  <Button
                    aria-label='Halaman berikutnya'
                    variant='outline'
                    size='icon'
                    className='size-6.5'
                    onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
                    disabled={!canNext}
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
