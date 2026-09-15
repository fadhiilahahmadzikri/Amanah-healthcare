'use client';

import Image from 'next/image';
import {
  AmanahScriptText,
  ArrowCtaButton,
  HealthcareEyebrow,
  HealthcareHeading,
  PixelMeshBackground,
  SectionContainer,
  ViewportLine
} from '@/features/public-site/components/shared';
import { cn } from '@/features/public-site/lib/helpers';
import { hero } from '../data';
import { useHeroSectionMotion } from '../model/useHeroSectionMotion';

const heroMetrics = ['Layanan 24 Jam', 'Dokter & Bidan', 'Condongcatur, Sleman'] as const;

type HeroMetricsRailPlacement = 'desktop' | 'mobile';

type HeroMetricsRailProps = {
  className?: string;
  placement: HeroMetricsRailPlacement;
};

function HeroMetricsRail({ className, placement }: HeroMetricsRailProps) {
  const isMobilePlacement = placement === 'mobile';

  return (
    <div
      data-hero-metrics-rail
      data-hero-desktop-metrics-rail={!isMobilePlacement ? true : undefined}
      data-hero-mobile-metrics-rail={isMobilePlacement ? true : undefined}
      className={cn('grid grid-cols-3 border-y border-line text-muted-foreground', className)}
    >
      {heroMetrics.map((item) => (
        <HealthcareEyebrow
          as='span'
          key={item}
          data-hero-pill
          className={cn(
            'min-w-0 border-line py-3',
            isMobilePlacement
              ? `
                border-r px-1 text-center text-[10px] min-[360px]:text-xs
                last:border-r-0
                min-[380px]:px-2
                sm:px-4
              `
              : `
                border-r px-4
                first:pl-0
                last:border-r-0
              `
          )}
        >
          {item}
        </HealthcareEyebrow>
      ))}
    </div>
  );
}

export function HeroSection() {
  const { containerRef, imageRef, contentRef } = useHeroSectionMotion();

  return (
    <section ref={containerRef} id='beranda' className='relative bg-background'>
      {/* Texture pixel mesh di pojok atas kanan dengan masking diagonal ke bawah */}
      <div
        data-pixel-background
        aria-hidden='true'
        className='
          pointer-events-none absolute top-0 right-0 z-0 h-[450px] w-full max-w-[550px]
          overflow-hidden select-none
          sm:h-[520px] sm:max-w-[650px]
          md:h-[620px] md:max-w-[750px]
          lg:h-[720px] lg:max-w-[850px]
        '
      >
        <PixelMeshBackground
          initialProgress={1}
          maskGradient='linear-gradient(225deg, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.75) 20%, rgba(0, 0, 0, 0.4) 45%, rgba(0, 0, 0, 0.12) 65%, transparent 80%)'
          className='
            size-full opacity-35
            dark:opacity-55
          '
        />
      </div>

      <div
        data-hero-mobile-stack
        className='
          relative overflow-hidden
          lg:min-h-[720px]
        '
      >
        <div data-hero-copy className='relative z-10'>
          <SectionContainer
            className='
              flex px-4 pt-12 pb-8
              sm:px-5 sm:pt-14 sm:pb-10
              md:px-10 md:pt-16
              lg:min-h-[720px] lg:items-center lg:py-0
            '
          >
            <div
              ref={contentRef}
              className='
                max-w-[760px]
                max-sm:pt-2
              '
            >
              <div
                className='
                  mb-7 overflow-hidden
                  md:mb-10
                '
              >
                <HealthcareEyebrow
                  data-hero-eyebrow
                  className='
                    inline-flex rounded-none border border-line
                    bg-amanah-soft/70 px-3 py-1.5 text-primary backdrop-blur-sm
                    dark:bg-amanah-soft/30
                  '
                >
                  {hero.eyebrow}
                </HealthcareEyebrow>
              </div>

              <HealthcareHeading
                as='h1'
                size='hero'
                className='flex flex-col gap-2 text-foreground'
              >
                <div className='-mb-1 overflow-hidden pb-2'>
                  <span data-mask-line className='inline-block will-change-transform'>
                    {hero.title}
                  </span>
                </div>
                <div className='-mb-2 overflow-hidden pb-4'>
                  <AmanahScriptText as='span' mask='line' size='hero' className='inline-block'>
                    {hero.scriptTitle}
                  </AmanahScriptText>
                </div>
              </HealthcareHeading>

              <div
                data-hero-cta
                className='
                  mt-8 w-fit
                  md:mt-10
                '
              >
                <ArrowCtaButton href='/kontak'>Buat Janji Temu</ArrowCtaButton>
              </div>

              <HeroMetricsRail
                placement='desktop'
                className='
                  mt-10 hidden max-w-2xl
                  lg:grid
                '
              />
            </div>
          </SectionContainer>
        </div>

        <div
          ref={imageRef}
          data-hero-media-panel
          className='
            relative z-0 aspect-4/3 overflow-hidden border-y border-line
            bg-muted opacity-0 will-change-transform
            sm:aspect-16/10
            md:aspect-video
            lg:absolute lg:inset-0 lg:aspect-auto lg:size-full lg:border-0
            lg:opacity-100
          '
        >
          <Image
            src={hero.image.src}
            alt={hero.image.alt}
            fill
            sizes='(min-width: 1300px) 1300px, 100vw'
            className='
              object-cover object-[62%_center]
              md:object-center
            '
            priority
          />
          <div
            className='
              absolute inset-0 hidden bg-linear-to-r from-background
              via-background/88 to-background/20
              lg:block
            '
          />
        </div>

        <HeroMetricsRail
          placement='mobile'
          className='
            border-y-0 opacity-0 will-change-transform
            lg:hidden
          '
        />
      </div>
      <ViewportLine
        position='bottom'
        className='
          hidden
          lg:block
        '
      />
    </section>
  );
}
