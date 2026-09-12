'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import {
  AmanahScriptText,
  ArrowCtaButton,
  HealthcareHeading,
  HealthcareText,
  PixelIcon,
  type PixelIconName,
  SectionHeader
} from '@/features/public-site/components/shared';

gsap.registerPlugin(ScrollTrigger);

const khitanPixelIcons = [
  { name: 'roket', title: 'Roket Petualangan Anak' },
  { name: 'bintang', title: 'Bintang Berani' },
  { name: 'gamepad', title: 'Gamepad Santai' }
] as const satisfies readonly { name: PixelIconName; title: string }[];

export function KhitanShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  useGSAP(
    () => {
      if (!sectionRef.current) {
        return;
      }

      // Animate on scroll: Header pixel icons anime pop-in stagger & heading reveal
      if (headerRef.current) {
        const iconItems = headerRef.current.querySelectorAll('[data-header-icon]');
        const heading = headerRef.current.querySelector('[data-mask-text]');

        if (iconItems.length > 0) {
          gsap.fromTo(
            iconItems,
            { scale: 0.35, y: 18, opacity: 0 },
            {
              scale: 1,
              y: 0,
              opacity: 1,
              duration: 0.7,
              stagger: 0.12,
              ease: 'back.out(2)',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        }

        if (heading) {
          gsap.fromTo(
            heading,
            { yPercent: 120, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 1.1,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        }
      }

      // Animate on scroll: Card container entrance
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // Animate on scroll: Left text staggered reveal
      if (contentRef.current) {
        const textElements = contentRef.current.querySelectorAll('[data-content-item]');
        if (textElements.length > 0) {
          gsap.fromTo(
            textElements,
            { y: 25, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.9,
              stagger: 0.1,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: cardRef.current ?? sectionRef.current,
                start: 'top 78%',
                toggleActions: 'play none none reverse'
              }
            }
          );
        }
      }

      // Animate on scroll: Right video container scale & fade
      if (videoWrapperRef.current) {
        gsap.fromTo(
          videoWrapperRef.current,
          { scale: 0.94, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cardRef.current ?? sectionRef.current,
              start: 'top 78%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id='khitan'
      className='
        relative w-full overflow-hidden bg-background py-14
        sm:py-20
        md:py-24
      '
    >
      <SectionHeader
        ref={headerRef}
        className='
          mb-10 w-full px-4
          sm:mb-12
          md:mb-14
        '
        eyebrow={
          <div
            data-header-icons
            className='
              mb-3.5 flex items-center justify-center gap-3
              sm:gap-4
              select-none
            '
            aria-hidden
          >
            {khitanPixelIcons.map((icon) => (
              <div
                key={icon.name}
                data-header-icon
                className='inline-flex shrink-0 items-center justify-center will-change-transform'
              >
                <PixelIcon
                  name={icon.name}
                  size='responsive'
                  svgClassName='size-10 md:size-8 transition-transform duration-300 hover:scale-110'
                  title={icon.title}
                />
              </div>
            ))}
          </div>
        }
        headingSize='section'
        title='Khitan Nyaman, Anak Tenang.'
      />

      {/* Wrapper mentok kanan-kiri tanpa padding/margin luar, bersatu dengan shell rails dan respect tema */}
      <div ref={cardRef} className='w-full border-y border-line bg-card text-card-foreground'>
        <div
          className='
          flex w-full flex-col
          lg:flex-row lg:items-stretch
        '
        >
          {/* SISI KIRI (Desktop) / SISI BAWAH (Mobile): Cerita & kutipan Gibran */}
          <div
            ref={contentRef}
            className='
              order-2 flex flex-1 flex-col justify-between p-6
              sm:p-8
              md:p-10
              lg:order-1 lg:p-12
              xl:p-14
            '
          >
            {/* Group Atas: Pengalaman Nyata & Narasi Cerita */}
            <div className='flex flex-col'>
              <div data-content-item className='mb-3.5 overflow-hidden sm:mb-5'>
                <AmanahScriptText
                  size='accent'
                  className='inline-block font-semibold text-amanah-blue dark:text-amanah-sky'
                >
                  Pengalaman Nyata
                </AmanahScriptText>
              </div>

              {/* Headline Kutipan */}
              <div data-content-item className='mb-5 overflow-hidden sm:mb-6'>
                <HealthcareHeading
                  as='h2'
                  size='subsection'
                  className='font-medium leading-snug text-foreground'
                >
                  &ldquo;Gibran aja sudah buktiin, kalau khitan itu nggak semenakutkan yang
                  dibayangkan! 🤩✨&rdquo;
                </HealthcareHeading>
              </div>

              {/* Isi teks narasi */}
              <div data-content-item className='flex flex-col gap-4 text-muted-foreground sm:gap-5'>
                <HealthcareText className='leading-relaxed text-muted-foreground'>
                  Bukannya nangis, Gibran malah ketiduran saking nyamannya proses khitan di Klinik
                  Amanah Health Care Yogyakarta. 💤👍
                </HealthcareText>
                <HealthcareText size='small' className='leading-relaxed text-muted-foreground/85'>
                  Buat Ayah &amp; Bunda yang masih ragu pilih tempat khitan untuk si kecil, yuk ke
                  Klinik Amanah aja! Prosesnya cepat, minim sakit, dan ditangani oleh tim
                  profesional.
                </HealthcareText>
              </div>

              {/* Tautan Lihat Testimoni Lainnya */}
              <div data-content-item className='mt-5 sm:mt-6'>
                <Link
                  href='/testimoni'
                  className='
                    inline-flex items-center gap-1.5 border-b border-line pb-0.5
                    text-xs font-semibold text-primary transition-colors
                    hover:border-primary hover:text-amanah-blue
                    sm:gap-[10px] sm:amanah-type-small
                  '
                >
                  <span>Lihat Testimoni Lainnya</span>
                  <svg
                    width='13'
                    height='13'
                    viewBox='0 0 13 13'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                    className='size-3 shrink-0'
                    aria-hidden='true'
                  >
                    <path
                      d='M10.4114 3.41421L1.80483 12.0208L0.390625 10.6066L8.99722 2H1.41144V0H12.4114V11H10.4114V3.41421Z'
                      fill='currentColor'
                    />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Identitas Pasien & Tombol Jadwalkan */}
            <div
              data-content-item
              className='
                mt-10 flex flex-col gap-5 border-t border-line pt-6
                sm:mt-12 sm:flex-row sm:items-center sm:justify-between sm:pt-8
              '
            >
              <div>
                <HealthcareText size='small' className='font-semibold text-foreground'>
                  Gibran (8 tahun)
                </HealthcareText>
                <HealthcareText size='caption' className='text-muted-foreground'>
                  Pasien Khitan Anak Klinik Amanah
                </HealthcareText>
              </div>

              <div>
                <ArrowCtaButton
                  href='https://wa.me/6281234567890?text=Halo%20Klinik%20Amanah,%20saya%20ingin%20jadwalkan%20layanan%20khitan%20anak'
                  treatment='primary'
                >
                  Jadwalkan
                </ArrowCtaButton>
              </div>
            </div>
          </div>

          {/* SISI KANAN (Desktop) / SISI ATAS (Mobile): Video Vertikal 9:16 dari Gibran dengan autoplay */}
          <div
            ref={videoWrapperRef}
            className='
              order-1 relative flex w-full shrink-0 items-center justify-center
              overflow-hidden border-b border-line bg-muted/30
              lg:order-2 lg:w-[380px] lg:border-b-0 lg:border-l
              xl:w-[420px]
            '
          >
            <div
              className='
              relative aspect-9/16 w-full overflow-hidden bg-black
              lg:h-full lg:w-full lg:aspect-auto
            '
            >
              <video
                ref={videoRef}
                src='/healthcare/assets/videos/khitan-anak-gibran.mp4'
                autoPlay
                loop
                muted={isMuted}
                playsInline
                aria-label='Video dokumentasi khitan anak Gibran di Klinik Amanah'
                className='size-full object-cover'
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                <track
                  kind='captions'
                  src='/healthcare/assets/videos/khitan-anak-gibran.vtt'
                  srcLang='id'
                  label='Bahasa Indonesia'
                />
              </video>

              {/* Tombol Play/Pause Video */}
              <button
                type='button'
                onClick={togglePlay}
                aria-label={isPlaying ? 'Jeda video' : 'Putar video'}
                className='
                  group absolute inset-0 z-10 flex cursor-pointer items-center
                  justify-center bg-transparent transition-colors
                  hover:bg-black/20
                '
              >
                {!isPlaying && (
                  <span
                    className='
                    flex size-14 items-center justify-center rounded-full border
                    border-white/40 bg-black/60 text-white shadow-lg
                    backdrop-blur-md transition-transform
                    group-hover:scale-110
                  '
                  >
                    <Play className='ml-1 size-6 text-white' />
                  </span>
                )}
              </button>

              {/* Tombol Audio Mute/Unmute */}
              <div className='absolute right-4 bottom-4 z-20'>
                <button
                  type='button'
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Nyalakan suara' : 'Bisukan suara'}
                  className='
                    flex size-9 cursor-pointer items-center justify-center
                    rounded-full border border-white/20 bg-black/60 text-white
                    backdrop-blur-md transition-colors
                    hover:bg-black/80
                  '
                >
                  {isMuted ? (
                    <VolumeX className='size-4' />
                  ) : (
                    <Volume2 className='size-4 text-amanah-blue' />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
