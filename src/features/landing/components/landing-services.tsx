'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Icons } from '@/components/icons';

export interface LandingServicesProps {
  onSelectService: (serviceName: string) => void;
}

const SERVICE_POSTERS = [
  {
    id: 1,
    title: 'Persalinan Full Bonus',
    image: '/assets/landing/poster-persalinan.png',
    serviceKey: 'Persalinan 24 Jam & Rawat Inap',
    badge: 'Layanan Favorit'
  },
  {
    id: 2,
    title: 'Lagi Liburan Yuk Khitan Modern',
    image: '/assets/landing/poster-khitan.png',
    serviceKey: 'Khitan Modern Tanpa Jarum Suntik',
    badge: 'Khitan Modern'
  },
  {
    id: 3,
    title: 'Jadwal Imunisasi Anak & Bayi',
    image: '/assets/landing/poster-imunisasi.png',
    serviceKey: 'Poli Umum & Konsultasi USG',
    badge: 'Jadwal Rutin'
  },
  {
    id: 4,
    title: 'USG Spesialis Kandungan',
    image: '/assets/landing/poster-usg.png',
    serviceKey: 'Poli Umum & Konsultasi USG',
    badge: 'USG 4D HD'
  },
  {
    id: 5,
    title: 'Laboratorium & Cek Darah Lengkap',
    image: '/assets/landing/poster-lab.png',
    serviceKey: 'Laboratorium & Cek Darah Lengkap',
    badge: 'Hasil Cepat'
  },
  {
    id: 6,
    title: 'Farmasi & Apotek 24 Jam',
    image: '/assets/landing/poster-farmasi.png',
    serviceKey: 'Farmasi & Apotek 24 Jam',
    badge: 'Siaga 24 Jam'
  }
];

export function LandingServices({ onSelectService }: LandingServicesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Dynamically calculate visible cards for precise boundary wrapping
  useEffect(() => {
    const updateVisibleCards = () => {
      if (typeof window === 'undefined') return;
      if (window.innerWidth < 640) {
        setVisibleCards(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCards(2);
      } else {
        setVisibleCards(3);
      }
    };
    updateVisibleCards();
    window.addEventListener('resize', updateVisibleCards);
    return () => window.removeEventListener('resize', updateVisibleCards);
  }, []);

  const maxIndex = Math.max(0, SERVICE_POSTERS.length - visibleCards);

  // Smooth rotation when reaching the end (loop wrap without dead ends)
  const handleNext = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating, maxIndex]);

  const handlePrev = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating, maxIndex]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  return (
    <section
      id='layanan'
      className='w-full bg-[#ffffff] py-12 sm:py-16 flex justify-center overflow-hidden'
    >
      <div className='max-w-[1501px] w-full mx-auto px-4 sm:px-6'>
        {/* Main Outer Container */}
        <div className='max-w-[1300px] mx-auto space-y-10'>
          {/* Header Row matching screenshot */}
          <div className='flex flex-col sm:flex-row sm:items-end justify-between gap-6'>
            {/* Left Title */}
            <div className='space-y-4 max-w-[650px] text-left'>
              {/* Pill: # SERVICES */}
              <div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f1f5f9] text-[#13195c] text-[12px] font-bold tracking-wide uppercase shadow-2xs'>
                <span># SERVICES</span>
              </div>

              {/* Title 2-lines */}
              <h2 className='font-sans font-medium text-3xl sm:text-4xl lg:text-[48px] text-[#13195c] tracking-tight leading-[1.12]'>
                Layanan Kesehatan untuk
                <br />
                Anda dan Keluarga
              </h2>
            </div>

            {/* Right Arrow Controls with Smooth Animation */}
            <div className='flex items-center gap-3 pb-2'>
              {/* Previous Button */}
              <button
                type='button'
                onClick={handlePrev}
                className='size-12 sm:size-[52px] rounded-full bg-[#ffffff] hover:bg-[#f1f5f9] border border-[#e2e8f0] text-[#13195c] active:scale-90 hover:scale-105 transition-all duration-300 flex items-center justify-center shadow-sm cursor-pointer group'
                aria-label='Scroll services left'
                title='Layanan Sebelumnya'
              >
                <Icons.arrowRight className='size-5 text-[#13195c] rotate-180 transition-transform duration-300 group-hover:-translate-x-0.5' />
              </button>

              {/* Next Button (Filled dark navy as in screenshot) */}
              <button
                type='button'
                onClick={handleNext}
                className='size-12 sm:size-[52px] rounded-full bg-[#13195c] hover:bg-[#1e277a] text-white active:scale-90 hover:scale-105 transition-all duration-300 flex items-center justify-center shadow-lg shadow-[#13195c]/25 cursor-pointer group'
                aria-label='Scroll services right'
                title='Layanan Selanjutnya'
              >
                <Icons.arrowRight className='size-5 text-white transition-transform duration-300 group-hover:translate-x-0.5' />
              </button>
            </div>
          </div>

          {/* Smooth Sliding Carousel Track */}
          <div
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className='relative w-full overflow-hidden py-4 -my-4'
          >
            <div
              className='flex items-center gap-6 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform'
              style={{
                transform: `translateX(-${currentIndex * (visibleCards === 1 ? 314 : visibleCards === 2 ? 374 : 392)}px)`
              }}
            >
              {SERVICE_POSTERS.map((poster, index) => {
                return (
                  <div
                    key={poster.id}
                    onClick={() => onSelectService(poster.serviceKey)}
                    className='shrink-0 w-[290px] sm:w-[350px] lg:w-[368px] h-[380px] sm:h-[432px] rounded-[28px] sm:rounded-[34px] overflow-hidden relative cursor-pointer group select-none border border-[#e2e8f0]/80 bg-[#f8fafc] transition-all duration-500 ease-out hover:-translate-y-2.5 hover:shadow-2xl shadow-md'
                  >
                    {/* Full Promotional Poster Graphic from Figma */}
                    <Image
                      src={poster.image}
                      alt={poster.title}
                      fill
                      className='object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105'
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/assets/landing/hero-container.png';
                      }}
                    />

                    {/* Dark gradient & shine overlay on hover */}
                    <div className='absolute inset-0 bg-gradient-to-t from-[#13195c]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none' />

                    {/* Interactive CTA Pill Button on Hover */}
                    <div className='absolute bottom-5 left-5 right-5 flex justify-between items-center z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-3 group-hover:translate-y-0'>
                      <span className='px-4 py-2 rounded-full bg-white/95 backdrop-blur-md text-[#13195c] text-[12px] font-bold shadow-xl inline-flex items-center gap-1.5'>
                        <span>Buat Janji Temu</span>
                        <Icons.arrowRight className='size-3.5' />
                      </span>
                      <span className='size-8 rounded-full bg-[#13195c] text-white flex items-center justify-center shadow-md'>
                        <Icons.calendar className='size-3.5' />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Carousel Slide Indicators / Dots that support direct clicking and wrapping */}
          <div className='flex items-center justify-center gap-2 pt-2'>
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                type='button'
                onClick={() => {
                  setIsAnimating(true);
                  setCurrentIndex(idx);
                  setTimeout(() => setIsAnimating(false), 600);
                }}
                className={`h-2.5 rounded-full transition-all duration-500 cursor-pointer ${
                  currentIndex === idx
                    ? 'w-9 bg-[#13195c]'
                    : 'w-2.5 bg-[#13195c]/20 hover:bg-[#13195c]/40'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
