'use client';

import React from 'react';
import Image from 'next/image';

export function LandingContact() {
  return (
    <section id='kontak' className='w-full bg-[#ffffff] py-14 sm:py-20 flex justify-center'>
      <div className='max-w-[1300px] w-full mx-auto px-4 sm:px-6 space-y-12'>
        {/* Top Info Grid (1256x275) */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-10 items-start text-left'>
          {/* Left Title & Description (596x220) */}
          <div className='lg:col-span-6 space-y-4 max-w-[560px]'>
            <h2 className='font-sans font-medium text-4xl sm:text-5xl lg:text-[64px] text-[#13195c] tracking-tight leading-none'>
              Mari Terhubung
            </h2>
            <p className='text-[14px] sm:text-[15px] font-medium text-[#13195c] leading-relaxed pt-2'>
              Punya pertanyaan atau ingin membuat janji kunjungan? Hubungi Klinik Amanah Healthcare.
              Tim kami siap membantu memberikan informasi mengenai layanan, jadwal dokter, dan
              kebutuhan kesehatan Anda.
            </p>
          </div>

          {/* Right Contact Channels (596x235) */}
          <div className='lg:col-span-6 space-y-6'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
              {/* Email */}
              <div className='space-y-1'>
                <span className='text-[12px] font-semibold text-[#9ca3af] uppercase tracking-wider block'>
                  Email address
                </span>
                <a
                  href='mailto:klinikamanahhealthcare@gmail.com'
                  className='text-[18px] sm:text-[20px] font-extrabold text-[#13195c] hover:underline block break-all leading-snug'
                >
                  klinikamanahhealthcare@gmail.com
                </a>
              </div>

              {/* Phone */}
              <div className='space-y-1'>
                <span className='text-[12px] font-semibold text-[#9ca3af] uppercase tracking-wider block'>
                  Phone Number
                </span>
                <a
                  href='https://wa.me/6281392456664'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-[18px] sm:text-[20px] font-extrabold text-[#13195c] hover:underline block leading-snug'
                >
                  +62 813-9245-6664
                </a>
              </div>
            </div>

            {/* Social */}
            <div className='space-y-1 pt-2'>
              <span className='text-[12px] font-semibold text-[#9ca3af] uppercase tracking-wider block'>
                Lets connect
              </span>
              <a
                href='https://instagram.com/amanahhealthcare'
                target='_blank'
                rel='noopener noreferrer'
                className='text-[18px] font-extrabold text-[#13195c] hover:underline block'
              >
                @amanahhealthcare
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Full-Width Consultation Banner Image (1256x580 R=36) */}
        <div className='relative w-full aspect-16/9 sm:aspect-21/9 rounded-[28px] sm:rounded-[36px] overflow-hidden bg-[#ffffff] shadow-xl border border-[#e2e8f0]/60'>
          <Image
            src='/assets/landing/node-2061_11258.png'
            alt='Healthcare and Medical Specialists Consulting'
            fill
            className='object-cover'
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/assets/landing/contact-consultation.png';
            }}
          />
        </div>
      </div>
    </section>
  );
}
