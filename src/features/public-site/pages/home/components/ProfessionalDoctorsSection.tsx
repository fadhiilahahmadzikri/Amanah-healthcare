'use client';

import type { HealthcareTeamMember } from '@/features/public-site/pages/doctors/types';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef } from 'react';
import {
  SectionContainer,
  SectionHeader,
  ViewportLine
} from '@/features/public-site/components/shared';
import { TeamCard } from '@/features/public-site/pages/doctors/components/TeamCard';

gsap.registerPlugin(ScrollTrigger);

const professionalDoctors = [
  {
    id: 'ika-fentiningrum',
    name: 'dr. Ika Fentiningrum',
    role: 'Dokter umum',
    image: {
      src: '/healthcare/assets/images/dokter-fenti.webp',
      alt: 'dr. Ika Fentiningrum dokter umum Klinik Amanah Healthcare'
    },
    socials: {
      instagram:
        'https://www.instagram.com/fen.penn?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw=='
    }
  },
  {
    id: 'nur-hidayatun',
    name: 'Nur Hidayatun',
    role: 'Bidan',
    image: {
      src: '/healthcare/assets/images/bidan-hida.webp',
      alt: 'Bidan Nur Hidayatun, S.ST Klinik Amanah Healthcare'
    },
    socials: {
      instagram:
        'https://www.instagram.com/nurhidayatun13?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw=='
    }
  }
] satisfies HealthcareTeamMember[];

export function ProfessionalDoctorsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (headerRef.current) {
        const maskLines = headerRef.current.querySelectorAll('[data-mask-text]');
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
              trigger: sectionRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll('article');
        gsap.fromTo(
          cards,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.1,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} id='tenaga-profesional' className='bg-background'>
      <SectionContainer
        className='
        px-0
        sm:px-0
      '
      >
        <div
          className='
          px-6 py-10 text-center
          md:px-8 md:py-14
        '
        >
          <SectionHeader
            ref={headerRef}
            eyebrow='Kenali Dokter Kami'
            title={
              <>
                <span className='inline md:hidden'>
                  Hangat Mendampingi,
                  <br />
                  Sepenuh Hati.
                </span>
                <span className='hidden md:inline'>Hangat Mendampingi, Sepenuh Hati.</span>
              </>
            }
            description='Dokter Klinik Amanah Healthcare berkomitmen memberikan pendampingan yang nyaman dan terpercaya bagi pasien dan keluarga.'
            descriptionClassName='max-w-xl'
          />
        </div>

        <div
          ref={gridRef}
          className='
            relative mx-auto grid max-w-3xl auto-rows-fr grid-cols-2 gap-px
            bg-line
          '
        >
          {professionalDoctors.map((doctor, index) => (
            <TeamCard
              key={doctor.id}
              className={index === 0 ? 'border-l border-line' : undefined}
              member={doctor}
              priority={index === 0}
              showLeftRail={index === 0}
              showRightRail={index === professionalDoctors.length - 1}
            />
          ))}
          <ViewportLine className='z-20' position='top' />
        </div>
      </SectionContainer>
    </section>
  );
}
