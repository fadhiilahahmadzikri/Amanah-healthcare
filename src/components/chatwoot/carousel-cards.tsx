'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DoctorScheduleCard } from '@/features/jadwal-dokter/components/doctor-schedule-card';
import { initialDoctorSchedules, type DoctorSchedule } from '@/constants/mock-api-doctor-schedules';

interface CarouselCardsProps {
  slides: string[];
  className?: string;
}

// Doctor Avatar Map with high quality illustrations/portraits from the project assets
const DOCTOR_AVATARS: Record<string, string> = {
  'sarah putri': '/assets/avatar/docter/woman-docter-1.png',
  'andika perkasa': '/assets/avatar/docter/man-docter-1.png',
  'budi santoso': '/assets/avatar/docter/man-docter-2.png',
  'pratama agung': '/assets/avatar/docter/man-docter-1.png',
  'ratna sari': '/assets/avatar/docter/woman-docter-2.png',
  'maya indah': '/assets/avatar/docter/woman-docter-3.png',
  'ika fenti': '/assets/avatar/docter/woman-docter-1.png',
  ika: '/assets/avatar/docter/woman-docter-1.png',
  bella: '/assets/avatar/docter/woman-docter-3.png',
  jaga: '/assets/avatar/docter/man-docter-2.png',
  default: '/assets/avatar/docter/woman-docter-1.png'
};

function getDoctorAvatar(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, url] of Object.entries(DOCTOR_AVATARS)) {
    if (lower.includes(key)) return url;
  }
  return DOCTOR_AVATARS.default;
}

function parseSlideContent(slide: string, idx: number) {
  const lower = slide.toLowerCase();
  const isDoctor =
    lower.includes('dr.') ||
    lower.includes('dr ') ||
    lower.includes('spesialis') ||
    lower.includes('jadwal praktik');

  // Extract badges
  const isUsgOn =
    lower.includes('usg on') || lower.includes('usg: on') || lower.includes('tersedia');
  const isBpjs = lower.includes('bpjs');
  const is24Hours = lower.includes('24 jam');

  if (isDoctor) {
    // Extract Doctor Name
    const nameMatch = slide.match(/###?\s*([^\n\r]+)/) || slide.match(/\*\*([^\*]+)\*\*/);
    const rawName = nameMatch ? nameMatch[1].replace(/[\*#]/g, '').trim() : `Dokter #${idx + 1}`;

    // Extract Specialty
    const specMatch =
      slide.match(/\*\*Spesialisasi:\*\*\s*([^\n\r]+)/i) ||
      slide.match(/Spesialisasi:\s*([^\n\r]+)/i);
    const specialty = specMatch ? specMatch[1].trim() : 'Dokter Umum & USG';

    // Extract Hari Praktik
    const daysMatch =
      slide.match(/\*\*(?:Hari Praktik|Hari):\*\*\s*([^\n\r]+)/i) ||
      slide.match(/(?:Hari Praktik|Hari):\s*([^\n\r]+)/i);
    const days = daysMatch ? daysMatch[1].trim() : 'Senin – Jumat';

    // Extract Jam Praktik
    const hoursMatch =
      slide.match(/\*\*(?:Jam Praktik|Jam|Waktu):\*\*\s*([^\n\r]+)/i) ||
      slide.match(/(?:Jam Praktik|Jam|Waktu):\s*([^\n\r]+)/i);
    const hours = hoursMatch ? hoursMatch[1].trim() : '08.00–14.00 WIB';

    // Search in database first for 100% identical data
    const matchedDoc = initialDoctorSchedules.find((d) => {
      const q = rawName.toLowerCase();
      const dName = d.nama_dokter.toLowerCase();
      return (
        q.includes(dName) ||
        dName.includes(q) ||
        (q.includes('sarah') && dName.includes('sarah')) ||
        (q.includes('andika') && dName.includes('andika')) ||
        (q.includes('budi') && dName.includes('budi')) ||
        (q.includes('ratna') && dName.includes('ratna')) ||
        (q.includes('maya') && dName.includes('maya'))
      );
    });

    const finalDoctor: DoctorSchedule = matchedDoc
      ? {
          ...matchedDoc,
          tanggal_praktik: days || matchedDoc.tanggal_praktik,
          jadwal_hari_ini: hours || matchedDoc.jadwal_hari_ini
        }
      : {
          id: `doc-ai-${idx}`,
          nama_dokter: rawName,
          spesialisasi: specialty,
          status_dokter: 'Buka',
          email: 'kontak@amanahhealthcare.id',
          nomor_telepon: '12345678910',
          ruang_praktik: 'Poli Umum & USG',
          tanggal_praktik: days,
          avatar: getDoctorAvatar(rawName),
          slot_tersedia: 14,
          kapasitas_per_hari: 25,
          jadwal_hari_ini: hours,
          status_jadwal: 'Buka',
          bulan_jadwal: 'Mei 2026',
          monthly_schedule: [],
          sesi_harian: [
            {
              id: `s-ai-${idx}-1`,
              nama_sesi: 'Sesi Pagi',
              jam_mulai: '08:00',
              jam_selesai: '14:00',
              waktu: hours,
              kuota_pasien: 15,
              slot_tersedia: 8,
              status_sesi: 'Buka'
            }
          ],
          is_cuti: false
        };

    return {
      type: 'doctor' as const,
      doctor: finalDoctor
    };
  }

  // Extract General/Service/Facility Card
  const titleMatch = slide.match(/###?\s*([^\n\r]+)/) || slide.match(/\*\*([^\*]+)\*\*/);
  const title = titleMatch ? titleMatch[1].replace(/[\*#]/g, '').trim() : `Layanan #${idx + 1}`;

  // Extract Category Pill label
  let categoryPill = 'Layanan Medis';
  if (lower.includes('laboratorium') || lower.includes('surat')) {
    categoryPill = 'Lab & Surat';
  } else if (lower.includes('ibu') || lower.includes('bayi') || lower.includes('anak')) {
    categoryPill = 'Ibu & Bayi';
  } else if (lower.includes('persalinan')) {
    categoryPill = 'Persalinan 24 Jam';
  } else if (lower.includes('fasilitas')) {
    categoryPill = 'Fasilitas Klinik';
  } else if (lower.includes('khitan')) {
    categoryPill = 'Khitan Modern';
  }

  // Extract list items cleanly
  const lines = slide.split('\n');
  const items = lines
    .map((l) => l.trim())
    .filter((l) => l.startsWith('-') || l.startsWith('*') || /^\d+\./.test(l))
    .map((l) =>
      l
        .replace(/^[-*•]\s*|^\d+\.\s*/, '')
        .replace(/\*\*/g, '')
        .trim()
    )
    .filter(Boolean);

  return {
    type: 'general' as const,
    title,
    categoryPill,
    items,
    isUsgOn,
    isBpjs,
    is24Hours,
    rawSlide: slide
  };
}

export function CarouselCards({ slides, className }: CarouselCardsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(slides.length > 1);

  const isPointerDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const checkScrollability = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);

    const cards = containerRef.current.querySelectorAll<HTMLElement>('.snap-start');
    if (cards.length > 0) {
      let closestIdx = 0;
      let minDiff = Infinity;
      cards.forEach((card, i) => {
        const diff = Math.abs(card.offsetLeft - containerRef.current!.offsetLeft - scrollLeft);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      });
      setActiveIndex(closestIdx);
    }
  }, []);

  useEffect(() => {
    checkScrollability();
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('scroll', checkScrollability, { passive: true });
    window.addEventListener('resize', checkScrollability);

    // Shift + Wheel horizontal translation without blocking vertical page/window scroll
    const handleWheel = (e: WheelEvent) => {
      if (e.shiftKey && e.deltaY !== 0) {
        e.preventDefault();
        el.scrollBy({
          left: e.deltaY,
          behavior: 'smooth'
        });
      }
      // Standard vertical mouse wheel is deliberately NOT intercepted,
      // allowing it to bubble up to the main chat window smoothly!
    };

    el.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      el.removeEventListener('scroll', checkScrollability);
      window.removeEventListener('resize', checkScrollability);
      el.removeEventListener('wheel', handleWheel);
    };
  }, [checkScrollability]);

  // Pointer drag-to-slide handlers (smooth & non-intrusive)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || !containerRef.current) return;
    isPointerDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.clientX;
    scrollLeftStartRef.current = containerRef.current.scrollLeft;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current || !containerRef.current) return;
    const dx = e.clientX - startXRef.current;
    if (Math.abs(dx) > 6) {
      hasDraggedRef.current = true;
      containerRef.current.scrollLeft = scrollLeftStartRef.current - dx;
    }
  };

  const handlePointerUpOrCancel = () => {
    isPointerDownRef.current = false;
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 60);
  };

  const scrollTo = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    const card = containerRef.current.querySelector<HTMLElement>('.snap-start');
    const scrollStep = card ? card.offsetWidth + 14 : 320;
    const offset = direction === 'left' ? -scrollStep : scrollStep;
    containerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const scrollToIndex = (index: number) => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll<HTMLElement>('.snap-start');
    if (cards[index]) {
      cards[index].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      });
    }
  };

  if (!slides.length) return null;

  return (
    <div className={cn('relative my-3.5 group/carousel max-w-full overflow-hidden', className)}>
      {/* Header Carousel Controls (Title Case, Clean Typography) */}
      <div className='flex items-center justify-between px-1 mb-2.5'>
        <span className='text-[12px] font-bold tracking-tight text-foreground flex items-center gap-1.5'>
          <Icons.dashboard className='size-3.5 text-primary' />
          <span>Katalog Layanan & Informasi</span>
        </span>
        <div className='flex items-center gap-1.5'>
          <Button
            type='button'
            variant='outline'
            size='icon'
            disabled={!canScrollLeft}
            onClick={(e) => {
              e.stopPropagation();
              scrollTo('left');
            }}
            className='size-7 rounded-full border-border/70 hover:bg-muted disabled:opacity-25 transition-opacity active:scale-95 duration-200'
          >
            <Icons.chevronLeft className='size-3.5' />
          </Button>
          <Button
            type='button'
            variant='outline'
            size='icon'
            disabled={!canScrollRight}
            onClick={(e) => {
              e.stopPropagation();
              scrollTo('right');
            }}
            className='size-7 rounded-full border-border/70 hover:bg-muted disabled:opacity-25 transition-opacity active:scale-95 duration-200'
          >
            <Icons.chevronRight className='size-3.5' />
          </Button>
        </div>
      </div>

      {/* Snap-Scrolling Card Container with Smooth Sliding */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUpOrCancel}
        onPointerCancel={handlePointerUpOrCancel}
        onClickCapture={(e) => {
          if (hasDraggedRef.current) {
            e.stopPropagation();
            e.preventDefault();
          }
        }}
        style={{ touchAction: 'pan-y' }}
        className='flex gap-3.5 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth overscroll-x-contain pb-3 pt-1 px-1 cursor-grab active:cursor-grabbing select-none'
      >
        {slides.map((slideContent, idx) => {
          const parsed = parseSlideContent(slideContent, idx);

          // Render Type 1: 100% IDENTICAL DoctorScheduleCard from the Jadwal Dokter Page
          if (parsed.type === 'doctor') {
            return (
              <div
                key={idx}
                className='snap-start shrink-0 w-[300px] sm:w-[340px] max-w-[88vw] flex flex-col'
              >
                <DoctorScheduleCard
                  doctor={parsed.doctor}
                  showActions={true}
                  showCallButton={true}
                  showStats={true}
                  variant='elevated'
                  className='h-full min-h-[350px]'
                />
              </div>
            );
          }

          // Render Type 2: General Service & Facility Card (With Beautiful Ribbon & Clean Item Badges)
          return (
            <div
              key={idx}
              className={cn(
                'snap-start shrink-0 w-[300px] sm:w-[340px] max-w-[88vw] rounded-3xl border border-border/80 bg-card/98',
                'shadow-xs hover:shadow-md hover:border-primary/50 transition-all duration-300',
                'flex flex-col justify-between relative overflow-hidden backdrop-blur-md'
              )}
            >
              {/* Top Accent Ribbon with Category Background */}
              <div className='px-4 py-2.5 bg-gradient-to-r from-primary/15 via-sky-400/10 to-transparent border-b border-border/50 flex items-center justify-between gap-2 flex-wrap'>
                <Badge
                  variant='secondary'
                  className='text-[10.5px] px-2.5 py-0.5 rounded-full font-bold bg-primary/20 text-primary border border-primary/30'
                >
                  {parsed.categoryPill}
                </Badge>

                <div className='flex items-center gap-1 flex-wrap'>
                  {parsed.isUsgOn && (
                    <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'>
                      <span className='size-1.5 rounded-full bg-emerald-500 animate-pulse' />
                      USG ON
                    </span>
                  )}
                  {parsed.isBpjs && (
                    <span className='inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25'>
                      BPJS
                    </span>
                  )}
                  {parsed.is24Hours && (
                    <span className='inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25'>
                      24 Jam
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className='p-4 sm:p-5 flex flex-col justify-between flex-1 space-y-3'>
                {/* Title */}
                <h4 className='text-[14.5px] font-bold text-foreground tracking-tight leading-snug break-words'>
                  {parsed.title}
                </h4>

                {/* List Items rendered with clean icon checkmarks (Zero text truncation) */}
                {parsed.items.length > 0 ? (
                  <div className='space-y-2 pt-1'>
                    {parsed.items.map((itemText, i) => (
                      <div
                        key={i}
                        className='flex items-start gap-2.5 p-2.5 rounded-xl bg-muted/40 border border-border/40 text-xs leading-relaxed text-foreground/90'
                      >
                        <Icons.check className='size-3.5 text-primary shrink-0 mt-0.5' />
                        <span className='break-words font-medium text-[11.5px] leading-relaxed flex-1 min-w-0 whitespace-normal'>
                          {itemText}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='prose prose-sm dark:prose-invert max-w-none text-foreground text-xs leading-relaxed break-words'>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{parsed.rawSlide}</ReactMarkdown>
                  </div>
                )}

                {/* Card Footer Indicator */}
                <div className='pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground'>
                  <span>Klinik Amanah HealthCare</span>
                  <span className='flex items-center gap-1 text-primary font-semibold'>
                    <Icons.circleCheck className='size-3.5' />
                    Terverifikasi
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Dots */}
      {slides.length > 1 && (
        <div className='flex items-center justify-center gap-1.5 pt-2'>
          {slides.map((_, idx) => (
            <button
              key={idx}
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                scrollToIndex(idx);
              }}
              className={cn(
                'size-1.5 rounded-full transition-all duration-300 cursor-pointer',
                activeIndex === idx
                  ? 'w-4 bg-primary rounded-full'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
