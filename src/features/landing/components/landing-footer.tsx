'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function LandingFooter() {
  const openGoogleMaps = () => {
    window.open('https://maps.google.com/?q=Klinik+Pratama+Amanah+Healthcare+Yogyakarta', '_blank');
  };

  return (
    <footer className='w-full bg-[#13195c] text-white pt-12 sm:pt-16 pb-12 sm:pb-14 mt-8 sm:mt-12'>
      <div className='max-w-[1400px] w-full mx-auto px-6 sm:px-10 lg:px-12'>
        {/* Main Grid */}
        <div className='grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start'>
          {/* Column 1: Brand, Address & Copyright (Span 3 cols) */}
          <div className='md:col-span-3 flex flex-col justify-between h-full space-y-6 text-left'>
            {/* Brand Logo & Name */}
            <div className='flex items-center gap-3'>
              <div className='relative size-[44px] rounded-xl overflow-hidden shrink-0 bg-white/10 p-1 flex items-center justify-center'>
                <Image
                  src='/assets/landing/brand-logo.png'
                  alt='Amanah Logo'
                  width={40}
                  height={40}
                  className='object-contain brightness-0 invert'
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/icon.svg';
                  }}
                />
              </div>
              <span className='font-sans font-medium text-[28px] text-white tracking-tight'>
                Amanah
              </span>
            </div>

            {/* Clinic Address Lines */}
            <address className='not-italic text-[13.5px] sm:text-[14px] text-white/80 leading-relaxed font-normal'>
              Jl. Anyelir 1 No. 243,
              <br />
              Perumnas Condong Catur
              <br />
              Condongcatur, Kec.
              <br />
              Depok, Kab. Sleman
              <br />
              Daerah Istimewa
              <br />
              Yogyakarta 55281
            </address>

            {/* Copyright */}
            <div className='pt-2 text-[12px] sm:text-[13px] text-white/60 font-normal leading-snug'>
              <p>© 2026, Klinik Amanah Healthcare.</p>
              <p>All Rights Reserved.</p>
            </div>
          </div>

          {/* Column 2: White Floating Card (Span 3 cols) */}
          <div className='md:col-span-3 flex justify-center md:justify-start'>
            <div className='w-full max-w-[280px] min-h-[250px] rounded-[24px] bg-[#ffffff] p-6 shadow-2xl flex flex-col justify-between text-left space-y-6'>
              <p className='font-sans font-normal text-[16px] sm:text-[17px] text-[#13195c] leading-snug'>
                Pelayanan kesehatan terpercaya, mudah dijangkau untuk anda dan keluarga
              </p>

              <div className='space-y-1.5 pt-2 border-t border-[#f1f5f9]'>
                <a
                  href='tel:+6281392456664'
                  className='block text-[13px] font-bold text-[#13195c] hover:underline'
                >
                  +62 813-9245-6664
                </a>
                <a
                  href='mailto:klinikamanahhealthcare@gmail.com'
                  className='block text-[11.5px] font-medium text-[#13195c]/85 hover:underline truncate'
                >
                  klinikamanahhealthcare@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Column 3: Quick Links 2-Columns (Span 3 cols) */}
          <div className='md:col-span-3 space-y-4 text-left pl-0 md:pl-4'>
            <h4 className='font-sans font-semibold text-[17px] sm:text-[18px] text-white'>
              Quick Links
            </h4>

            <div className='grid grid-cols-2 gap-x-4 gap-y-3 text-[14px] sm:text-[15px] text-white/90'>
              {/* Left Links Column */}
              <div className='space-y-3'>
                <Link href='/' className='block hover:text-white hover:underline transition-colors'>
                  Beranda
                </Link>
                <Link
                  href='/#fasilitas'
                  className='block hover:text-white hover:underline transition-colors'
                >
                  Fasilitas
                </Link>
                <Link
                  href='/#layanan'
                  className='block hover:text-white hover:underline transition-colors'
                >
                  Layanan
                </Link>
              </div>

              {/* Right Links Column */}
              <div className='space-y-3'>
                <Link
                  href='/dokter'
                  className='block hover:text-white hover:underline transition-colors'
                >
                  Dokter
                </Link>
                <Link
                  href='/#kontak'
                  className='block hover:text-white hover:underline transition-colors'
                >
                  Kontak
                </Link>
                <Link
                  href='/#tentang-kami'
                  className='block hover:text-white hover:underline transition-colors'
                >
                  Tentang Kami
                </Link>
              </div>
            </div>
          </div>

          {/* Column 4: Lokasi Kami & Social Icons (Span 3 cols) */}
          <div className='md:col-span-3 flex flex-col items-center md:items-end justify-between h-full space-y-6'>
            {/* Lokasi Box */}
            <div className='space-y-2 text-center flex flex-col items-center'>
              <h4 className='font-sans font-semibold text-[17px] sm:text-[18px] text-white'>
                Lokasi Kami
              </h4>
              <p className='text-[11px] text-white/80 font-normal'>
                Jl. Manggis No.6, Condongcatur
              </p>

              {/* Map Preview Card */}
              <div
                onClick={openGoogleMaps}
                className='relative w-[190px] h-[105px] rounded-[14px] overflow-hidden bg-white shadow-md border border-white/20 cursor-pointer group my-1'
              >
                <Image
                  src='/assets/landing/exact-map-preview.png'
                  alt='Peta Lokasi Klinik Amanah Healthcare'
                  fill
                  className='object-cover group-hover:scale-105 transition-transform'
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/landing/map-preview.png';
                  }}
                />
              </div>

              {/* Petunjuk Arah Pill Button */}
              <button
                type='button'
                onClick={openGoogleMaps}
                className='px-4 py-1.5 rounded-full bg-white text-[#13195c] text-[11.5px] font-medium hover:bg-white/90 transition-all shadow-xs cursor-pointer'
              >
                Petunjuk Arah
              </button>
            </div>

            {/* 4 Social Round Buttons */}
            <div className='flex items-center gap-2.5 pt-2'>
              {/* Facebook */}
              <a
                href='https://facebook.com'
                target='_blank'
                rel='noreferrer'
                className='size-[36px] rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white text-[13px] font-bold'
                aria-label='Facebook'
              >
                f
              </a>
              {/* Twitter / X */}
              <a
                href='https://twitter.com'
                target='_blank'
                rel='noreferrer'
                className='size-[36px] rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white text-[13px] font-bold'
                aria-label='X (Twitter)'
              >
                𝕏
              </a>
              {/* LinkedIn */}
              <a
                href='https://linkedin.com'
                target='_blank'
                rel='noreferrer'
                className='size-[36px] rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white text-[12px] font-bold'
                aria-label='LinkedIn'
              >
                in
              </a>
              {/* Pinterest */}
              <a
                href='https://instagram.com'
                target='_blank'
                rel='noreferrer'
                className='size-[36px] rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white text-[13px] font-bold'
                aria-label='Pinterest / Instagram'
              >
                P
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
