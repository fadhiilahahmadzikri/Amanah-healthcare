'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

interface SlideItem {
  id: number;
  tag: string;
  tagColor?: string;
  title: string;
  desc: string;
  image: string;
}

const ABOUT_SLIDES: SlideItem[] = [
  {
    id: 1,
    tag: 'Featured • Precision Medicine',
    tagColor: 'text-[#34d399]',
    title: 'The Future of Cancer Therapy: Breakthrough Genomic Sequencing',
    desc: "Exploring advanced DNA profiling methods that allow oncologists to tailor targeted treatments specifically tailored to each patient's molecular profile.",
    image: '/assets/landing/node-2070_837.png'
  },
  {
    id: 2,
    tag: 'Featured • Primary Care',
    tagColor: 'text-[#34d399]',
    title: 'Strengthening Community Healthcare: Mobile Diagnostic Care',
    desc: 'Innovative health units and connected diagnostic gear are bridging critical healthcare access gaps for remote and underserved populations around the world.',
    image: '/assets/landing/node-2070_849.png'
  },
  {
    id: 3,
    tag: 'Visi Klinik Pratama Healthcare',
    tagColor: 'text-white/90',
    title: 'Menjadi Rumah Sakit Pilihan',
    desc: 'Menjadi Klinik Pratama pilihan masyarakat Yogyakarta dan sekitarnya dalam memberikan pelayanan kesehatan yang profesional, aman, terpercaya, dan berorientasi pada kebutuhan serta kenyamanan pasien.',
    image: '/assets/landing/node-2070_861.png'
  },
  {
    id: 4,
    tag: 'Featured • Modern Diagnostic',
    tagColor: 'text-[#34d399]',
    title: 'Pemeriksaan USG & Diagnostik Medis Akurat',
    desc: 'Pemeriksaan USG kandungan 2D/4D beresolusi tinggi dengan dokter berpengalaman untuk memastikan diagnosa akurat dan penanganan tepat.',
    image: '/assets/landing/node-2056_7377.png'
  },
  {
    id: 5,
    tag: 'Featured • 24 Hours Emergency',
    tagColor: 'text-[#34d399]',
    title: 'Pelayanan UGD & Persalinan Siaga 24 Jam',
    desc: 'Kesiapan tim medis dan bidan setiap saat dengan fasilitas rawat inap yang nyaman dan bersih untuk keselamatan keluarga Anda.',
    image: '/assets/landing/node-2056_7381.png'
  }
];

export function LandingAbout() {
  const [currentIdx, setCurrentIdx] = useState(2); // Start at slide 3 (index 2) matching Figma
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIdx((prev) => (prev + 1) % ABOUT_SLIDES.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  const handlePrev = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIdx((prev) => (prev - 1 + ABOUT_SLIDES.length) % ABOUT_SLIDES.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  const handleGoTo = (idx: number) => {
    if (isTransitioning || idx === currentIdx) return;
    setIsTransitioning(true);
    setCurrentIdx(idx);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Touch swipe support for mobile devices
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

  const prevIdx = (currentIdx - 1 + ABOUT_SLIDES.length) % ABOUT_SLIDES.length;
  const nextIdx = (currentIdx + 1) % ABOUT_SLIDES.length;

  const currentSlide = ABOUT_SLIDES[currentIdx];
  const prevSlide = ABOUT_SLIDES[prevIdx];
  const nextSlide = ABOUT_SLIDES[nextIdx];

  return (
    <section
      id='tentang-kami'
      className='w-full bg-[#ffffff] py-8 sm:py-14 flex justify-center overflow-hidden'
    >
      <div className='max-w-[1501px] w-full mx-auto px-4 sm:px-6'>
        {/* Outer White Card with rounded corners */}
        <div className='w-full rounded-[28px] sm:rounded-[40px] bg-[#ffffff] border border-[#e2e8f0]/80 shadow-xs p-6 sm:p-12 lg:p-16 text-center space-y-10 sm:space-y-12 overflow-hidden'>
          {/* Section Header */}
          <div className='max-w-[672px] mx-auto space-y-2 text-center'>
            <span className='font-caveat font-normal text-[32px] sm:text-[38px] text-[#13195c] block leading-tight'>
              Tentang Kami
            </span>
            <h2 className='font-sans font-medium text-[32px] sm:text-[48px] text-[#13195c] tracking-tight leading-tight'>
              Kenali Klinik Amanah
            </h2>
            <p className='font-sans font-normal text-[14px] sm:text-[16px] text-[#13195c]/85 leading-relaxed pt-1 max-w-[580px] mx-auto'>
              Memberikan pelayanan kesehatan yang profesional, nyaman, dan terpercaya untuk Anda dan
              keluarga.
            </p>
          </div>

          {/* Carousel Slider with Animated Side Peeks */}
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className='relative w-full max-w-[1360px] mx-auto flex items-center justify-center min-h-[440px] sm:min-h-[500px] lg:min-h-[540px] overflow-visible select-none'
          >
            {/* Left Peek Slide (Dimmed Animated Preview) */}
            <div
              onClick={handlePrev}
              className='hidden md:block absolute -left-12 lg:-left-6 w-[280px] lg:w-[340px] h-[380px] lg:h-[440px] rounded-[28px] overflow-hidden opacity-35 hover:opacity-70 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] hover:scale-95 cursor-pointer scale-90 z-0 select-none shadow-lg group'
            >
              <div className='relative w-full h-full'>
                <Image
                  key={`prev-${prevSlide.id}`}
                  src={prevSlide.image}
                  alt={prevSlide.title}
                  fill
                  className='object-cover transition-transform duration-700 group-hover:scale-105'
                />
                <div className='absolute inset-0 bg-black/45 group-hover:bg-black/30 transition-colors duration-500' />
                <div className='absolute bottom-6 left-6 right-6 text-left text-white space-y-1 z-10 transition-transform duration-500 group-hover:-translate-y-1'>
                  <span className='text-[11px] font-semibold block text-emerald-400'>
                    {prevSlide.tag}
                  </span>
                  <h4 className='text-[15px] font-bold line-clamp-2 leading-snug'>
                    {prevSlide.title}
                  </h4>
                </div>
              </div>
            </div>

            {/* Center Main Active Card (Fluid Animated Transitions) */}
            <div className='relative w-full max-w-[940px] lg:max-w-[1000px] h-[440px] sm:h-[500px] lg:h-[530px] rounded-[28px] sm:rounded-[36px] overflow-hidden bg-[#13195c] shadow-2xl z-10 flex flex-col justify-between p-6 sm:p-10 lg:p-12 text-left group transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]'>
              {/* Background Photo with Smooth Crossfade */}
              <div className='absolute inset-0 z-0 overflow-hidden'>
                {ABOUT_SLIDES.map((slide, idx) => (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                      currentIdx === idx
                        ? 'opacity-100 scale-100 z-1'
                        : 'opacity-0 scale-105 z-0 pointer-events-none'
                    }`}
                  >
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      priority={idx === currentIdx}
                      className='object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-103'
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/assets/landing/node-2070_861.png';
                      }}
                    />
                  </div>
                ))}
                {/* Gradient Overlays matching Figma */}
                <div className='absolute inset-0 z-2 bg-gradient-to-t from-[#000000]/95 via-[#000000]/45 to-transparent pointer-events-none' />
                <div className='absolute inset-0 z-2 bg-gradient-to-r from-[#000000]/85 via-transparent to-transparent pointer-events-none' />
              </div>

              {/* Top-Right Slide Counter Pill (e.g. 4 / 5) with Smooth Number Pulse */}
              <div className='relative z-10 flex justify-end'>
                <div className='px-4 py-1.5 rounded-full bg-[#000000]/60 backdrop-blur-md text-white text-[13px] sm:text-[14px] font-medium flex items-center gap-1.5 shadow-md border border-white/15 transition-transform duration-300'>
                  <span
                    className='font-extrabold text-white text-[15px] key-counter'
                    key={currentIdx}
                  >
                    {currentIdx + 1}
                  </span>
                  <span className='text-white/60 font-light'>/</span>
                  <span className='text-white/60 font-light'>{ABOUT_SLIDES.length}</span>
                </div>
              </div>

              {/* Bottom Content & Navigation Controls with Staggered Fade Slide Animation */}
              <div className='relative z-10 space-y-6 pt-12'>
                {/* Text Content with Keyed Animated Entry */}
                <div
                  key={`text-${currentIdx}`}
                  className='max-w-[680px] space-y-2.5 transition-all duration-500'
                >
                  <span
                    className={cn(
                      'text-[12px] sm:text-[13px] font-semibold tracking-wider block uppercase animate-in fade-in-0 duration-300',
                      currentSlide.tagColor || 'text-white/90'
                    )}
                  >
                    {currentSlide.tag}
                  </span>

                  <h3 className='text-2xl sm:text-3xl lg:text-[36px] font-bold text-white tracking-tight leading-tight animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-75'>
                    {currentSlide.title}
                  </h3>

                  <p className='text-xs sm:text-[14.5px] text-[#e2e8f0] leading-relaxed max-w-[560px] font-normal line-clamp-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-150'>
                    {currentSlide.desc}
                  </p>
                </div>

                {/* Bottom Navigation Bar */}
                <div className='flex items-center justify-between pt-4 border-t border-white/20'>
                  {/* Left Arrow Button */}
                  <button
                    type='button'
                    onClick={handlePrev}
                    className='size-11 sm:size-12 rounded-full bg-black/50 hover:bg-black/80 hover:scale-110 active:scale-90 backdrop-blur-md border border-white/25 text-white transition-all duration-300 flex items-center justify-center cursor-pointer shadow-lg group/btn'
                    aria-label='Previous slide'
                    title='Slide Sebelumnya'
                  >
                    <Icons.arrowRight className='size-5 text-white rotate-180 transition-transform duration-300 group-hover/btn:-translate-x-0.5' />
                  </button>

                  {/* Center Pagination Dots */}
                  <div className='flex items-center gap-2'>
                    {ABOUT_SLIDES.map((_, i) => (
                      <button
                        key={i}
                        type='button'
                        onClick={() => handleGoTo(i)}
                        className={cn(
                          'h-2 rounded-full transition-all duration-500 cursor-pointer',
                          currentIdx === i
                            ? 'w-9 bg-white shadow-sm'
                            : 'w-2.5 bg-white/35 hover:bg-white/70'
                        )}
                        aria-label={`Slide ${i + 1}`}
                      />
                    ))}
                  </div>

                  {/* Right Arrow Button */}
                  <button
                    type='button'
                    onClick={handleNext}
                    className='size-11 sm:size-12 rounded-full bg-black/50 hover:bg-black/80 hover:scale-110 active:scale-90 backdrop-blur-md border border-white/25 text-white transition-all duration-300 flex items-center justify-center cursor-pointer shadow-lg group/btn'
                    aria-label='Next slide'
                    title='Slide Selanjutnya'
                  >
                    <Icons.arrowRight className='size-5 text-white transition-transform duration-300 group-hover/btn:translate-x-0.5' />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Peek Slide (Dimmed Animated Preview) */}
            <div
              onClick={handleNext}
              className='hidden md:block absolute -right-12 lg:-right-6 w-[280px] lg:w-[340px] h-[380px] lg:h-[440px] rounded-[28px] overflow-hidden opacity-35 hover:opacity-70 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] hover:scale-95 cursor-pointer scale-90 z-0 select-none shadow-lg group'
            >
              <div className='relative w-full h-full'>
                <Image
                  key={`next-${nextSlide.id}`}
                  src={nextSlide.image}
                  alt={nextSlide.title}
                  fill
                  className='object-cover transition-transform duration-700 group-hover:scale-105'
                />
                <div className='absolute inset-0 bg-black/45 group-hover:bg-black/30 transition-colors duration-500' />
                <div className='absolute bottom-6 left-6 right-6 text-left text-white space-y-1 z-10 transition-transform duration-500 group-hover:-translate-y-1'>
                  <span className='text-[11px] font-semibold block text-emerald-400'>
                    {nextSlide.tag}
                  </span>
                  <h4 className='text-[15px] font-bold line-clamp-2 leading-snug'>
                    {nextSlide.title}
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
