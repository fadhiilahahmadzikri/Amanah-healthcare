'use client';

import React from 'react';
import Image from 'next/image';
import { Icons } from '@/components/icons';

export interface LandingFacilitiesProps {
  onOpenBooking: () => void;
}

export function LandingFacilities({ onOpenBooking }: LandingFacilitiesProps) {
  return (
    <section id='fasilitas' className='w-full bg-[#ffffff] py-8 sm:py-14 flex justify-center'>
      <div className='max-w-[1501px] w-full mx-auto px-4 sm:px-6'>
        {/* Main Navy Container (1501x845, bg #13195c, R=36) matching Figma Section 7 */}
        <div className='w-full rounded-[24px] sm:rounded-[36px] bg-[#13195c] p-6 sm:p-12 lg:p-16 relative overflow-hidden text-left shadow-lg'>
          {/* Watermark Logo in top-right */}
          <div className='absolute -right-12 -top-12 pointer-events-none opacity-5 size-[500px] sm:size-[620px]'>
            <Image
              src='/assets/landing/logo-svg-2058_8809.png'
              alt='Amanah Healthcare Watermark'
              width={620}
              height={620}
              className='object-contain'
            />
          </div>

          <div className='relative z-10 max-w-[1300px] mx-auto space-y-10 sm:space-y-12'>
            {/* Header Row */}
            <div className='flex flex-col lg:flex-row lg:items-end justify-between gap-8'>
              {/* Left Title & Tag */}
              <div className='space-y-4 max-w-[620px]'>
                {/* Pill: # WHY CHOOSE US */}
                <div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ffffff] text-[#13195c] text-[12px] font-bold tracking-wide uppercase shadow-xs'>
                  <span># WHY CHOOSE US</span>
                </div>

                {/* Heading 2-lines */}
                <h2 className='font-sans font-medium text-3xl sm:text-4xl lg:text-[48px] text-[#ffffff] tracking-tight leading-[1.12]'>
                  Fasilitas untuk
                  <br />
                  Kenyamanan Anda
                </h2>
              </div>

              {/* Right Certification & Schedule Link */}
              <div className='flex items-center gap-4 text-white pb-2'>
                {/* Certificate Medal / Document Icon matching screenshot */}
                <div className='size-14 rounded-2xl bg-white/10 border border-white/20 p-2.5 flex items-center justify-center shrink-0 shadow-inner'>
                  <Icons.shield className='size-7 text-white' />
                </div>

                <div className='space-y-1'>
                  <span className='font-sans font-medium text-[13.5px] sm:text-[14.5px] text-white block leading-snug'>
                    Certified by the American Dental Association
                  </span>
                  <button
                    type='button'
                    onClick={onOpenBooking}
                    className='inline-flex items-center gap-1 text-[13px] font-semibold text-white/90 hover:text-white hover:underline cursor-pointer'
                  >
                    <span>Schedule Your Visit</span>
                    <Icons.arrowUpRight className='size-3.5 text-white' />
                  </button>
                </div>
              </div>
            </div>

            {/* Seamless 4-Column Strip (1300x408 R=28) matching Figma exact 1:1 */}
            <div className='w-full rounded-[24px] sm:rounded-[28px] bg-[#ffffff] overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-stretch border border-white/20'>
              {/* Column 1: Ruang Tunggu Nyaman (Figma solid #f5f6fa) */}
              <div className='bg-[#f5f6fa] p-7 sm:p-9 lg:p-10 flex flex-col justify-between text-left min-h-[380px] sm:min-h-[408px]'>
                <div className='relative size-[65px] shrink-0'>
                  <Image
                    src='/assets/landing/facility-icon-2049_5038.png'
                    alt='Ruang Tunggu Nyaman Icon'
                    fill
                    className='object-contain'
                  />
                </div>

                <div className='space-y-2.5 pt-6'>
                  <h3 className='font-sans font-bold text-[19px] sm:text-[20px] text-[#13195c] tracking-tight leading-snug'>
                    Ruang Tunggu Nyaman
                  </h3>
                  <p className='text-[13.5px] sm:text-[14px] text-[#30465c] leading-relaxed font-normal'>
                    Ruang tunggu yang bersih dan nyaman untuk memberikan pengalaman terbaik bagi
                    pasien dan keluarga.
                  </p>
                </div>
              </div>

              {/* Column 2: Ruang Pemeriksaan (Figma solid #ffffff) */}
              <div className='bg-[#ffffff] p-7 sm:p-9 lg:p-10 flex flex-col justify-between text-left min-h-[380px] sm:min-h-[408px]'>
                <div className='relative size-[65px] shrink-0'>
                  <Image
                    src='/assets/landing/facility-icon-2049_5049.png'
                    alt='Ruang Pemeriksaan Icon'
                    fill
                    className='object-contain'
                  />
                </div>

                <div className='space-y-2.5 pt-6'>
                  <h3 className='font-sans font-bold text-[19px] sm:text-[20px] text-[#13195c] tracking-tight leading-snug'>
                    Ruang Pemeriksaan
                  </h3>
                  <p className='text-[13.5px] sm:text-[14px] text-[#30465c] leading-relaxed font-normal'>
                    Ruang pemeriksaan yang nyaman dan mendukung pelayanan kesehatan bagi setiap
                    pasien.
                  </p>
                </div>
              </div>

              {/* Column 3: Apotek (Figma solid #f5f6fa) */}
              <div className='bg-[#f5f6fa] p-7 sm:p-9 lg:p-10 flex flex-col justify-between text-left min-h-[380px] sm:min-h-[408px]'>
                <div className='relative size-[65px] shrink-0'>
                  <Image
                    src='/assets/landing/facility-icon-2049_5064.png'
                    alt='Apotek Icon'
                    fill
                    className='object-contain'
                  />
                </div>

                <div className='space-y-2.5 pt-6'>
                  <h3 className='font-sans font-bold text-[19px] sm:text-[20px] text-[#13195c] tracking-tight leading-snug'>
                    Apotek
                  </h3>
                  <p className='text-[13.5px] sm:text-[14px] text-[#30465c] leading-relaxed font-normal'>
                    Menyediakan kebutuhan obat pasien sesuai dengan resep dan anjuran tenaga
                    kesehatan.
                  </p>
                </div>
              </div>

              {/* Column 4: Harga Terjangkau & Transparan (Exact Figma Image Fill 7f4d0544 + Figma Linear Gradient) */}
              <div className='relative min-h-[380px] sm:min-h-[408px] w-full overflow-hidden bg-white flex flex-col justify-end p-7 sm:p-9 lg:p-10 text-left group'>
                <Image
                  src='/assets/landing/figma-raw-fill-7f4d0544.png'
                  alt='Harga Terjangkau & Transparan'
                  fill
                  className='object-cover object-center transition-transform duration-500 group-hover:scale-103'
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/landing/hero-exact-bg.png';
                  }}
                />
                {/* Linear gradient matching Figma node 2049:5079 (transparent at y:42% to pure white at y:73%) */}
                <div className='absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white' />

                <div className='relative z-10 space-y-1 pt-8'>
                  <h3 className='font-sans font-semibold text-[20px] text-[#13195c] tracking-tight leading-[1.37]'>
                    Harga Terjangkau &<br />
                    Transparan
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
