'use client';

import React from 'react';
import Image from 'next/image';
import { Icons } from '@/components/icons';

export interface LandingHeroProps {
  onOpenBooking: () => void;
}

export function LandingHero({ onOpenBooking }: LandingHeroProps) {
  const handleScrollToServices = () => {
    const el = document.getElementById('layanan');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id='beranda' className='w-full bg-[#ffffff] pt-2 pb-12 sm:pb-16 flex justify-center'>
      <div className='max-w-[1501px] w-full mx-auto px-4 sm:px-6'>
        {/* Main Hero Container with Doctor & Patient Background Image matching screenshot 1:1 */}
        <div className='w-full relative rounded-[28px] sm:rounded-[40px] overflow-hidden bg-[#dfe2f6] shadow-sm min-h-[680px] lg:min-h-[780px] flex flex-col justify-between p-6 sm:p-10 lg:p-12'>
          {/* Background Full Photo (Doctor smiling with pregnant patient in clinic bed) */}
          <div className='absolute inset-0 z-0'>
            <Image
              src='/assets/landing/hero-exact-bg.png'
              alt='Klinik Amanah Healthcare - Pelayanan Medis Profesional'
              fill
              priority
              className='object-cover object-[center_18%] sm:object-right-top'
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/assets/landing/hero-container.png';
              }}
            />
            {/* Soft gradient on left for crystal clear text readability */}
            <div className='absolute inset-0 bg-gradient-to-r from-[#ffffff]/75 via-[#ffffff]/25 to-transparent lg:via-transparent pointer-events-none' />
          </div>

          {/* Top-Left Hero Typography & CTA matching screenshot 1:1 */}
          <div className='relative z-10 max-w-[620px] text-left space-y-6 sm:space-y-7 pt-4 sm:pt-6'>
            {/* Pill: BERSAMA KAMI */}
            <div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ffffff]/95 backdrop-blur-md text-[#13195c] text-[11px] sm:text-[12px] font-bold tracking-wider uppercase shadow-xs border border-white/40'>
              <span>BERSAMA KAMI</span>
            </div>

            {/* Headline matching screenshot exact 3 lines */}
            <div className='space-y-0.5'>
              <h1 className='font-sans font-bold text-4xl sm:text-6xl lg:text-[64px] text-[#13195c] tracking-tight leading-[1.08]'>
                Sehat Lebih Baik,
                <br />
                Bersama Klinik
              </h1>
              <span className='font-caveat font-normal text-5xl sm:text-7xl lg:text-[76px] text-[#13195c] block mt-1 leading-none select-none'>
                Amanah Healthcare
              </span>
            </div>

            {/* CTA Button: Buat Janji Temu */}
            <div className='pt-2'>
              <button
                type='button'
                onClick={onOpenBooking}
                className='h-[52px] sm:h-[56px] px-6 pl-7 rounded-full bg-[#13195c] text-[#ffffff] text-[16px] sm:text-[17px] font-medium hover:bg-[#1e277a] active:scale-95 transition-all flex items-center gap-4 group cursor-pointer shadow-xl hover:shadow-2xl'
              >
                <span>Buat Janji Temu</span>
                <div className='size-[36px] sm:size-[40px] rounded-full bg-[#ffffff] text-[#13195c] flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform shadow-xs'>
                  <Icons.arrowUpRight className='size-4 text-[#13195c]' />
                </div>
              </button>
            </div>
          </div>

          {/* Bottom Floating Bento Cards (3 distinct floating cards overlapping bottom of hero) */}
          <div className='relative z-10 w-full pt-10 sm:pt-14'>
            <div className='grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 items-stretch'>
              {/* Card 1: Pelayanan Kesehatan (Left Composite Card - Span 6 cols) */}
              <div className='md:col-span-6 rounded-[24px] sm:rounded-[28px] bg-[#ffffff] border border-[#e2e8f0]/80 p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row justify-between gap-4 sm:gap-6 items-stretch text-left'>
                {/* Part 1: Service Text */}
                <div className='flex flex-col justify-between space-y-4 max-w-[200px]'>
                  <div className='space-y-1.5'>
                    <h3 className='font-sans font-bold text-[17px] sm:text-[18px] text-[#13195c] tracking-tight leading-snug'>
                      Pelayanan Kesehatan
                    </h3>
                    <p className='text-[12.5px] sm:text-[13px] text-[#506680] leading-snug font-normal'>
                      Layanan Lengkap
                      <br />
                      Untuk kesehatan keluarga
                    </p>
                  </div>

                  <button
                    type='button'
                    onClick={handleScrollToServices}
                    className='inline-flex items-center gap-1 text-[13px] font-bold text-[#13195c] hover:underline cursor-pointer'
                  >
                    <span>Lihat Layanan</span>
                    <Icons.arrowUpRight className='size-3.5 text-[#13195c]' />
                  </button>
                </div>

                {/* Part 2 & 3: Pasien Terlayani + 3D Medical Kit Graphic Box */}
                <div className='flex items-center gap-3 self-start sm:self-center shrink-0'>
                  {/* Pasien Terlayani 5,000+ Box */}
                  <div className='p-3 sm:p-4 rounded-[18px] bg-[#ffffff] border border-[#e2e8f0]/80 shadow-2xs text-left space-y-1.5 min-w-[115px]'>
                    <div className='size-7 rounded-full bg-[#dfe2f6] text-[#0084ff] flex items-center justify-center'>
                      <Icons.smile className='size-4 text-[#0084ff]' />
                    </div>
                    <span className='text-[11.5px] text-[#506680] block font-medium leading-tight'>
                      Pasien Terlayani
                    </span>
                    <span className='text-[21px] sm:text-[23px] font-extrabold text-[#13195c] tracking-tight block leading-none'>
                      5,000+
                    </span>
                  </div>

                  {/* 3D Medical Kit Visual Box (Solid blue 130x130) */}
                  <div className='relative size-[115px] sm:size-[135px] rounded-[18px] overflow-hidden bg-[#4285f4] shrink-0 border border-[#e2e8f0]/80 shadow-sm flex items-center justify-center p-1.5'>
                    <Image
                      src='/assets/landing/bento-2049_6925.png'
                      alt='Medical Kit 3D'
                      fill
                      className='object-contain p-1'
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/assets/landing/node-2049_6925.png';
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Bergabung Bersama Kami (Middle Card - Span 3 cols) */}
              <div className='md:col-span-3 rounded-[24px] sm:rounded-[28px] bg-[#ffffff] border border-[#e2e8f0]/80 p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-4 text-left min-h-[170px] sm:min-h-[190px]'>
                <div className='space-y-1'>
                  <h3 className='font-sans font-bold text-[16px] sm:text-[17px] text-[#13195c] tracking-tight leading-snug'>
                    Bergabung Bersama Kami
                  </h3>
                  <p className='text-[12.5px] sm:text-[13px] text-[#506680] leading-snug font-normal'>
                    Dipercaya oleh ribuan pasien
                  </p>
                </div>

                {/* 3 Round Overlapping Patient Avatar Circles */}
                <div className='flex -space-x-2.5 overflow-hidden pt-1'>
                  <div className='inline-block size-[42px] sm:size-[46px] rounded-full ring-2 ring-[#ffffff] overflow-hidden bg-[#dfe2f6] shadow-sm'>
                    <Image
                      src='/assets/landing/bento-2049_4941.png'
                      alt='Pasien 1'
                      width={48}
                      height={48}
                      className='object-cover'
                    />
                  </div>
                  <div className='inline-block size-[42px] sm:size-[46px] rounded-full ring-2 ring-[#ffffff] overflow-hidden bg-[#dfe2f6] shadow-sm'>
                    <Image
                      src='/assets/landing/bento-2049_4942.png'
                      alt='Pasien 2'
                      width={48}
                      height={48}
                      className='object-cover'
                    />
                  </div>
                  <div className='inline-block size-[42px] sm:size-[46px] rounded-full ring-2 ring-[#ffffff] overflow-hidden bg-[#dfe2f6] shadow-sm'>
                    <Image
                      src='/assets/landing/bento-2049_4943.png'
                      alt='Pasien 3'
                      width={48}
                      height={48}
                      className='object-cover'
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Testimonial Snippet (Right Card - Span 3 cols) */}
              <div className='md:col-span-3 rounded-[24px] sm:rounded-[28px] bg-[#ffffff] border border-[#e2e8f0]/80 p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-3 text-left min-h-[170px] sm:min-h-[190px]'>
                {/* Blue Crown Rating Icon */}
                <div className='text-[#0084ff]'>
                  <svg className='size-6 text-[#0084ff]' viewBox='0 0 24 24' fill='currentColor'>
                    <path d='M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z' />
                  </svg>
                </div>

                <div className='space-y-1.5'>
                  <p className='font-sans italic font-semibold text-[13px] sm:text-[13.5px] text-[#13195c] leading-snug'>
                    “Best dentist experience ever! Friendly staff and pain-free visits.”
                  </p>
                  <span className='text-[12px] text-[#506680] font-medium block'>
                    — dr. Ika Fenti
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
