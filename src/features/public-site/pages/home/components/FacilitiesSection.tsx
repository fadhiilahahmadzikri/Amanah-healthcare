'use client';

import { ArrowUpRightIcon, BadgeCheckIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  HealthcareText,
  SectionContainer,
  SectionHeader,
  ViewportLine
} from '@/features/public-site/components/shared';
import { facilities, watermark } from '../data';
import { useFacilitiesSection } from '../model/useFacilitiesSection';
import { FacilityCard } from './FacilityCard';

const facilityBorderClassNames = [
  'border-b border-line md:border-r xl:border-b-0',
  'border-b border-line md:border-r-0 xl:border-r xl:border-b-0',
  'border-b border-line md:border-r md:border-b-0 xl:border-r xl:border-b-0',
  'border-b-0 md:border-b-0 xl:border-r-0'
];

export function FacilitiesSection() {
  const facilitiesSection = useFacilitiesSection({ itemCount: facilities.length });

  return (
    <section ref={facilitiesSection.refs.sectionRef} id='fasilitas' className='bg-background'>
      <SectionContainer
        className='
        relative px-0
        sm:px-0
      '
      >
        <div
          className='
          relative px-6 py-12
          md:px-10 md:py-16
        '
        >
          <div
            ref={facilitiesSection.refs.watermarkRef}
            aria-hidden
            className='
              pointer-events-none absolute inset-0 hidden overflow-hidden
              md:block
            '
          >
            <Image
              src={watermark.src}
              alt=''
              width={547}
              height={547}
              className='
                absolute top-0 -right-14 h-auto w-[617px] max-w-none
                opacity-[0.045] brightness-0
                dark:opacity-[0.08] dark:brightness-100
              '
              aria-hidden
            />
          </div>

          <div
            ref={facilitiesSection.refs.headerRef}
            className='
              relative z-10 grid gap-10
              lg:grid-cols-[1fr_0.9fr] lg:items-center
            '
          >
            <SectionHeader
              align='left'
              eyebrow='Why Choose Us'
              title='Langkah Pertama, Untuk Keluarga'
              headingClassName='max-w-2xl'
            />

            <div className='flex items-center gap-5 text-muted-foreground'>
              <BadgeCheckIcon aria-hidden className='size-6 shrink-0 text-amanah-mint' />
              <div className='flex flex-col gap-2'>
                <HealthcareText className='italic'>Terverifikasi SATUSEHAT</HealthcareText>
                <Link
                  href='/kontak'
                  className='
                    inline-flex w-fit amanah-type-body items-center gap-2
                    border-b border-line pb-1 font-semibold text-primary
                    transition-colors
                    hover:border-primary hover:text-amanah-blue
                  '
                >
                  Jadwalkan Kunjungan Anda
                  <ArrowUpRightIcon aria-hidden />
                </Link>
              </div>
            </div>
          </div>
          <ViewportLine position='bottom' />
        </div>

        <div
          ref={facilitiesSection.refs.gridRef}
          onMouseLeave={facilitiesSection.actions.handleGridLeave}
          className='
            relative z-10 grid
            md:grid-cols-2
            xl:grid-cols-4
          '
        >
          {facilities.map((facility, index) => {
            return (
              <FacilityCard
                key={facility.title}
                facility={facility}
                index={index}
                className={facilityBorderClassNames[index]}
                isActive={facilitiesSection.getIsCardActive(index)}
                isPaused={facilitiesSection.getIsCardPaused()}
                progressDuration={4.5}
                onProgressComplete={facilitiesSection.actions.handleProgressComplete}
                onCardHover={facilitiesSection.actions.handleCardHover}
                onCardClick={facilitiesSection.actions.handleCardClick}
              />
            );
          })}
        </div>
      </SectionContainer>
    </section>
  );
}
