'use client';

import Image from 'next/image';
import {
  ArrowCtaButton,
  PixelMeshBackground,
  SectionContainer,
  SectionHeader
} from '@/features/public-site/components/shared';
import { appointment, watermark } from '../data';
import { useAppointmentSectionMotion } from '../model/useAppointmentSectionMotion';

export function AppointmentSection() {
  const { sectionRef, textRef, imageRef, mobileTextureRef, watermarkRef } =
    useAppointmentSectionMotion();

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
