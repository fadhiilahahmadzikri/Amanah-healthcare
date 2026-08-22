'use client';

import React from 'react';
import Image from 'next/image';
import { Icons } from '@/components/icons';

export interface LandingAppointmentProps {
  onOpenBooking: () => void;
}

export function LandingAppointment({ onOpenBooking }: LandingAppointmentProps) {
  return (
    <section id='dokter' className='w-full bg-[#ffffff] py-8 sm:py-14 flex justify-center'>
      <div className='max-w-[1501px] w-full mx-auto px-4 sm:px-6'>
        {/* Main Navy Box (1501x815, R=16, bg #13195c) matching Figma exact Section 9 */}
        <div className='w-full rounded-[24px] sm:rounded-[36px] bg-[#13195c] p-6 sm:p-12 lg:p-16 relative overflow-hidden text-left'>
          {/* Subtle Watermark Logo Background from Figma */}
          <div className='absolute -left-16 -top-16 pointer-events-none opacity-5 size-[650px] sm:size-[780px]'>
            <Image
              src='/assets/landing/logo-svg-2058_8809.png'
              alt='Amanah Watermark'
              width={780}
              height={780}
              className='object-contain'
            />
          </div>

          <div className='relative z-10 max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center'>
            {/* Left Column Content (650x392) */}
            <div className='lg:col-span-6 space-y-6 sm:space-y-8 max-w-[580px]'>
              {/* Pill: JANJI TEMU */}
              <div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ffffff] text-[#13195c] text-[12px] font-bold tracking-wide uppercase shadow-xs'>
                <span>JANJI TEMU</span>
              </div>

              {/* Title */}
              <h2 className='font-sans font-medium text-3xl sm:text-4xl lg:text-[48px] text-[#ffffff] tracking-tight leading-[1.12]'>
                Jadwalkan Kunjungan Anda
              </h2>

              {/* Description */}
              <p className='text-[15px] sm:text-[16px] text-[#e2e8f0] leading-relaxed font-normal'>
                Pilih layanan dan jadwal yang sesuai dengan kebutuhan Anda. Buat janji dengan mudah
                dan dapatkan pelayanan kesehatan terbaik di Klinik Amanah.
              </p>

              {/* Pill Button: Buat Janji Temu */}
              <div className='pt-2'>
                <button
                  type='button'
                  onClick={onOpenBooking}
                  className='h-[54px] sm:h-[58px] min-w-[240px] sm:min-w-[250px] px-6 pl-8 rounded-full bg-[#ffffff] text-[#13195c] text-[16px] sm:text-[18px] font-medium hover:bg-[#ffffff]/90 transition-all flex items-center justify-between gap-4 group cursor-pointer shadow-lg hover:shadow-2xl'
                >
                  <span>Buat Janji Temu</span>
                  <div className='size-[40px] sm:size-[44px] rounded-full bg-[#13195c] text-[#ffffff] flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform'>
                    <Icons.arrowUpRight className='size-5 text-[#ffffff]' />
                  </div>
                </button>
              </div>
            </div>

            {/* Right Column Doctor Appointment Photo from Figma (621x605 R=16) */}
            <div className='lg:col-span-6 relative flex justify-center lg:justify-end'>
              <div className='relative w-full max-w-[580px] h-[380px] sm:h-[480px] lg:h-[540px] rounded-[24px] sm:rounded-[28px] overflow-hidden bg-[#dfe2f6] shadow-xl border border-white/10'>
                <Image
                  src='/assets/landing/image--appointment--2056_7466.png'
                  alt='Dokter Spesialis Jadwal Kunjungan Amanah Healthcare'
                  fill
                  priority
                  className='object-cover object-top'
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/landing/appointment-doctor.png';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
