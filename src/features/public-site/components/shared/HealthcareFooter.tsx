'use client';

import type { ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRightIcon, LinkIcon, MapPinIcon } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';
import { SiFacebook, SiInstagram, SiTiktok } from 'react-icons/si';
import { AppConfig } from '@/features/public-site/lib/app-config';
import { cn, getI18nPath } from '@/features/public-site/lib/helpers';
import { AmanahLogo } from './AmanahLogo';
import { healthcareContactItems, healthcareFooter, healthcareNavigationItems } from './data';
import { getHealthcareHref } from './healthcareNavigation';
import { HealthcareEyebrow, HealthcareText } from './HealthcareTypography';
import { SectionContainer } from './SectionContainer';
import { ViewportLine } from './ViewportLine';

gsap.registerPlugin(ScrollTrigger);

function SocialIcon({ url }: { url: string }) {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('instagram.com')) {
    return <SiInstagram aria-hidden className='size-4' />;
  }
  if (lowerUrl.includes('tiktok.com')) {
    return <SiTiktok aria-hidden className='size-4' />;
  }
  if (lowerUrl.includes('facebook.com')) {
    return <SiFacebook aria-hidden className='size-[19px]' />;
  }
  return <LinkIcon aria-hidden className='size-4' />;
}

type HealthcareFooterProps = {
  locale?: string;
};

type FooterPanelProps = {
  children: ReactNode;
  className?: string;
  label: string;
};

type FooterRowProps = {
  children: ReactNode;
  className?: string;
};

const mobilePanelDividerClassName = 'max-md:border-b max-md:border-line';

function FooterRow({ children, className }: FooterRowProps) {
  return (
    <div className={cn('relative grid', className)}>
      {children}
      <ViewportLine position='bottom' />
    </div>
  );
}

function FooterPanel({ children, className, label }: FooterPanelProps) {
  return (
    <section
      data-footer-panel
      className={cn(
        `
        bg-background p-5
        md:p-6
      `,
        className
      )}
    >
      <HealthcareEyebrow className='mb-5 text-muted-foreground'>{label}</HealthcareEyebrow>
      {children}
    </section>
  );
}

export function HealthcareFooter({ locale = AppConfig.i18n.defaultLocale }: HealthcareFooterProps) {
  const footerRef = useRef<HTMLElement>(null);
  const phone = healthcareContactItems[1];
  const email = healthcareContactItems[0];

  useGSAP(
    () => {
      if (!footerRef.current) {
        return;
      }

      const panels = footerRef.current.querySelectorAll('[data-footer-panel]');
      gsap.fromTo(
        panels,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 90%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    },
    { scope: footerRef }
  );

  return (
    <footer ref={footerRef} className='bg-background pb-6'>
      <SectionContainer
        className='
        relative border-x border-line px-0
        sm:px-0
      '
      >
        <FooterRow className='md:grid-cols-4'>
          <FooterPanel
            label='Klinik'
            className={cn(mobilePanelDividerClassName, 'md:col-span-2 md:border-r')}
          >
            <div className='flex flex-col gap-8'>
              <AmanahLogo locale={locale} />
              <HealthcareText
                as='address'
                size='lead'
                className='max-w-2xl text-muted-foreground not-italic'
              >
                {healthcareFooter.address}
              </HealthcareText>
            </div>
          </FooterPanel>

          <FooterPanel label='Kontak' className={cn(mobilePanelDividerClassName, 'md:border-r')}>
            <div className='flex flex-col gap-3 amanah-type-small font-semibold'>
              {phone && (
                <a
                  href={phone.href}
                  className='
                    w-fit border-b border-line pb-0.5 transition-colors
                    hover:border-foreground/50
                  '
                >
                  {phone.value}
                </a>
              )}
              {email && (
                <a
                  href={email.href}
                  className='
                    w-fit border-b border-line pb-0.5 wrap-break-word
                    transition-colors
                    hover:border-foreground/50
                  '
                >
                  {email.value}
                </a>
              )}
            </div>
          </FooterPanel>

          <FooterPanel label='Sosial'>
            <div className='flex flex-wrap gap-2'>
              {healthcareFooter.socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='
                    inline-flex size-10 items-center justify-center rounded-xl
                    border border-line text-muted-foreground transition-all
                    hover:border-foreground/40 hover:bg-accent
                    hover:text-foreground
                  '
                  aria-label={link.label}
                >
                  <SocialIcon url={link.href} />
                </a>
              ))}
            </div>
          </FooterPanel>
        </FooterRow>

        <FooterRow className='md:grid-cols-4'>
          <FooterPanel
            label='Navigasi'
            className={cn(mobilePanelDividerClassName, 'md:col-span-2 md:border-r')}
          >
            <nav
              aria-label='Navigasi footer'
              className='
                grid amanah-type-body grid-cols-2 gap-x-8 gap-y-4 font-medium
              '
            >
              {healthcareNavigationItems.map((item) => (
                <a
                  key={`${item.path}${item.hash ?? ''}`}
                  href={getHealthcareHref(item, locale)}
                  className='
                    w-fit border-b border-line pb-0.5 text-muted-foreground
                    transition-colors
                    hover:border-foreground/50 hover:text-foreground
                  '
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </FooterPanel>

          <FooterPanel label='Lokasi' className='md:col-span-2'>
            <div
              className='
              grid gap-5
              sm:grid-cols-[180px_1fr] sm:items-start
            '
            >
              <a
                href={healthcareFooter.map.href}
                target='_blank'
                rel='noopener noreferrer'
                className='block overflow-hidden bg-muted'
                aria-label='Buka lokasi Klinik Amanah di Google Maps'
              >
                <Image
                  src={healthcareFooter.map.src}
                  alt={healthcareFooter.map.alt}
                  width={360}
                  height={240}
                  className='h-auto w-full object-cover'
                />
              </a>
              <div className='flex flex-col items-start gap-5'>
                <div className='flex flex-col gap-2'>
                  <HealthcareText
                    size='small'
                    className='flex items-start gap-2 text-muted-foreground'
                  >
                    <MapPinIcon aria-hidden className='mt-0.5 size-4 shrink-0' />
                    <span>{healthcareFooter.location}</span>
                  </HealthcareText>
                  <HealthcareText size='caption' className='text-muted-foreground'>
                    {healthcareFooter.plusCode}
                  </HealthcareText>
                </div>
                <a
                  href={healthcareFooter.map.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='
                    inline-flex h-10 items-center gap-2 rounded-xl border
                    border-line px-3 amanah-type-small font-semibold
                    transition-colors
                    hover:bg-accent
                  '
                >
                  Petunjuk Arah
                  <ArrowUpRightIcon aria-hidden className='size-4' />
                </a>
              </div>
            </div>
          </FooterPanel>
        </FooterRow>

        <div
          className='
          relative flex flex-col gap-2 px-5 py-4 amanah-type-caption
          text-muted-foreground
          sm:flex-row sm:items-center sm:justify-between
          md:px-6
        '
        >
          <p>© 2026 Klinik Amanah Healthcare. All Rights Reserved.</p>
          <a
            href={getI18nPath('/', locale)}
            className='
              w-fit transition-colors
              hover:text-foreground
            '
          >
            amanah.healthcare
          </a>
          <ViewportLine position='bottom' />
        </div>
      </SectionContainer>
    </footer>
  );
}
