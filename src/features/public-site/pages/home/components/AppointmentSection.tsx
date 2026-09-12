'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useRef } from 'react';
import {
  ArrowCtaButton,
  SectionContainer,
  SectionHeader
} from '@/features/public-site/components/shared';
import { PixelMeshBackground } from '@/features/public-site/pages/about/components/atoms/PixelMeshBackground';
import { appointment, watermark } from '../data';

gsap.registerPlugin(ScrollTrigger);

export function AppointmentSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const mobileTextureRef = useRef<HTMLDivElement>(null);
  const watermarkRef = useRef<HTMLImageElement>(null);

  useGSAP(
    () => {
      const sectionElement = sectionRef.current;

      if (!sectionElement) {
        return;
      }

      if (watermarkRef.current) {
        gsap.to(watermarkRef.current, {
          yPercent: 20,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionElement,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        });
      }

      if (mobileTextureRef.current) {
        gsap.fromTo(
          mobileTextureRef.current,
          { autoAlpha: 0, scale: 0.92, y: -10 },
          {
            autoAlpha: 1,
            duration: 0.9,
            ease: 'power3.out',
            scale: 1,
            scrollTrigger: {
              trigger: sectionElement,
              start: 'top 88%',
              toggleActions: 'play none none reverse'
            },
            y: 0
          }
        );
      }

      if (textRef.current) {
        const maskLines = textRef.current.querySelectorAll<HTMLElement>('[data-mask-text]');
        gsap.fromTo(
          maskLines,
          { yPercent: 120, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.12,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionElement,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { opacity: 0, scale: 1.08 },
          {
            opacity: 1,
            scale: 1,
            duration: 1.4,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionElement,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} id='dokter' className='bg-background'>
      <SectionContainer
        className='
        relative isolate overflow-hidden px-0
        sm:px-0
      '
      >
        <div
          className='
          relative z-10 grid
          lg:grid-cols-2
        '
        >
          <div
            className='
            relative isolate flex min-h-[520px] flex-col items-start
            justify-center gap-8 overflow-hidden bg-background px-6 py-12
            text-foreground
            md:px-10 md:py-16
          '
          >
            <div
              ref={mobileTextureRef}
              aria-hidden='true'
              className='
                pointer-events-none absolute -top-5 -right-7 z-0 size-48
                overflow-hidden opacity-0 will-change-[transform,opacity]
                select-none
                sm:size-56
                md:hidden
              '
            >
              <PixelMeshBackground
                initialProgress={1}
                progress={1}
                maskGradient='radial-gradient(ellipse at top right, rgba(0, 0, 0, 0.98) 0%, rgba(0, 0, 0, 0.72) 42%, rgba(0, 0, 0, 0.26) 68%, transparent 86%)'
                className='
                  size-full opacity-55
                  dark:opacity-70
                '
              />
            </div>

            <Image
              ref={watermarkRef}
              src={watermark.src}
              alt=''
              width={547}
              height={547}
              className='
                pointer-events-none absolute top-24 -left-44 hidden h-auto
                w-[760px] max-w-none opacity-[0.045] brightness-0
                md:block
                xl:w-[808px]
                dark:opacity-[0.08] dark:brightness-100
              '
              aria-hidden
            />

            <SectionHeader
              ref={textRef}
              align='left'
              className='relative z-10 max-w-xl'
              eyebrow={appointment.eyebrow}
              headingSize='display'
              title={appointment.title}
              description={appointment.description}
              descriptionSize='lead'
              actionSlot={
                <div
                  className='
                  mt-8
                  sm:mt-10
                '
                >
                  <ArrowCtaButton href='/kontak'>Buat Janji Temu</ArrowCtaButton>
                </div>
              }
            />
          </div>

          <div
            ref={imageRef}
            className='
              relative min-h-[420px] overflow-hidden border-t border-line
              bg-background
              lg:min-h-[560px] lg:border-t-0 lg:border-l
            '
          >
            <Image
              src={appointment.image.src}
              alt={appointment.image.alt}
              fill
              sizes='(min-width: 1024px) 45vw, 100vw'
              className='object-cover'
            />
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
