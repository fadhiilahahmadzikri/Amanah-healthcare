'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

const TESTIMONIAL_SLIDES = [
  {
    quote:
      'Amazing experience! The team is caring, gentle, and professional. My smile has never looked better—highly recommend their dental care services',
    author: 'Juairiya',
    role: 'Medical Assistant',
    font: 'font-lora',
    avatar: '/assets/landing/node-2049_5251.png'
  },
  {
    quote:
      '“Pelayanan di Klinik Amanah sangat ramah dan nyaman. Dokternya menjelaskan dengan baik dan membuat saya merasa tenang selama pemeriksaan.”',
    author: 'Cooper, Kristin',
    role: 'Medical Assistant',
    font: 'font-caveat text-[26px]',
    avatar: '/assets/landing/node-2049_5267.png'
  }
];

export function LandingTestimonials() {
  const [activeIdx, setActiveIdx] = useState(1); // Set to Cooper, Kristin matching screenshot

  const handleNext = () => {
    setActiveIdx((prev) => (prev + 1) % TESTIMONIAL_SLIDES.length);
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev - 1 + TESTIMONIAL_SLIDES.length) % TESTIMONIAL_SLIDES.length);
  };

  const current = TESTIMONIAL_SLIDES[activeIdx];

  return (
    <section className='w-full bg-[#ffffff] py-14 sm:py-20 flex justify-center'>
      <div className='max-w-[1300px] w-full mx-auto px-4 sm:px-6'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center'>
          {/* Left Column (Span 6 Cols: Dark Navy Card + Patient Smile Photo) */}
          <div className='lg:col-span-6 flex flex-col sm:flex-row gap-5 items-stretch'>
            {/* Dark Navy Card (257x410) */}
            <div className='w-full sm:w-[260px] rounded-[24px] bg-[#13195c] p-6 sm:p-7 text-white text-left flex flex-col justify-between shadow-md min-h-[360px]'>
              <div className='space-y-6'>
                <div className='inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ffffff] text-[#13195c] text-[12px] font-bold tracking-wide uppercase shadow-xs'>
                  <span># KISAH PASIEN</span>
                </div>
                <p className='text-[15.5px] sm:text-[16.5px] font-normal text-white leading-relaxed'>
                  Pelayanan yang ramah dan membuat saya merasa nyaman selama berobat di Klinik
                  Amanah.
                </p>
              </div>

              <div className='pt-4 border-t border-white/20'>
                <h4 className='text-[14px] font-medium text-white'>Pasien Klinik Amanah</h4>
                <p className='text-[13px] text-white/70 font-normal'>Pasien</p>
              </div>
            </div>

            {/* Patient Smile Photo (354x479) */}
            <div className='w-full sm:flex-1 relative rounded-[24px] overflow-hidden min-h-[300px] sm:min-h-[360px] bg-[#dfe2f6] shadow-md'>
              <Image
                src='/assets/landing/node-2049_5238.png'
                alt='Patient Smile Testimonial'
                fill
                className='object-cover'
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/landing/testi-avatar-1.png';
                }}
              />
            </div>
          </div>

          {/* Right Column (Span 6 Cols: Giant Quote Mark + Editorial Quote + Author) */}
          <div className='lg:col-span-6 space-y-6 text-left pl-0 lg:pl-6 flex flex-col justify-between min-h-[340px]'>
            <div className='space-y-4'>
              {/* Giant Quote Icon Vector matching screenshot */}
              <div className='text-[#dfe2f6]'>
                <Icons.quote className='size-16 text-[#dfe2f6]' />
              </div>

              {/* Dynamic Font Quote */}
              <p
                className={cn(
                  'text-[#13195c] text-xl sm:text-[24px] leading-relaxed font-normal min-h-[110px]',
                  current.font
                )}
              >
                {current.quote}
              </p>
            </div>

            {/* Author Row & Slide Arrows */}
            <div className='pt-4 border-t border-[#13195c]/10 flex items-center justify-between'>
              <div className='flex items-center gap-3.5'>
                <div className='relative size-[52px] sm:size-[56px] rounded-full overflow-hidden bg-[#dfe2f6] ring-2 ring-[#ffffff] shadow-sm shrink-0'>
                  <Image
                    src={current.avatar}
                    alt={current.author}
                    fill
                    className='object-cover'
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/assets/avatar/docter/woman-docter-1.png';
                    }}
                  />
                </div>
                <div>
                  <h4 className='font-sans font-semibold text-[17px] sm:text-[18px] text-[#13195c] leading-tight'>
                    {current.author}
                  </h4>
                  <span className='text-[12px] font-normal text-[#30465c] block'>
                    {current.role}
                  </span>
                </div>
              </div>

              {/* Slider Controls */}
              <div className='flex items-center gap-2'>
                <button
                  type='button'
                  onClick={handlePrev}
                  className='size-10 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#13195c] active:scale-95 transition-transform flex items-center justify-center cursor-pointer'
                  aria-label='Previous story'
                >
                  <Icons.chevronLeft className='size-4 text-[#13195c]' />
                </button>
                <button
                  type='button'
                  onClick={handleNext}
                  className='size-10 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#13195c] active:scale-95 transition-transform flex items-center justify-center cursor-pointer'
                  aria-label='Next story'
                >
                  <Icons.chevronRight className='size-4 text-[#13195c]' />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
