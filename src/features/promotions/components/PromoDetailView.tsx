'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, CheckCircle2, MessageCircle, ShieldCheck } from 'lucide-react';
import { SectionContainer } from '@/features/public-site/components/shared/SectionContainer';
import { TechnicalDivider } from '@/features/public-site/components/shared/TechnicalDivider';
import { ROUTES } from '@/core/routes';
import { cn } from '@/lib/utils';
import type { PublicPromotion } from '../types/promotions.types';
import { PromoImage } from './PromoImage';
import { formatWibPeriod } from '../lib/schedule';
import { buildPromoWhatsAppUrl } from '../lib/cta';

interface PromoDetailViewProps {
  promo: PublicPromotion;
  otherPromos?: PublicPromotion[];
}

export function PromoDetailView({ promo, otherPromos = [] }: PromoDetailViewProps) {
  const periodText = formatWibPeriod(promo.startsAt, promo.endsAt);
  const whatsappUrl = buildPromoWhatsAppUrl(
    undefined,
    `Halo Admin Amanah Healthcare, saya ingin bertanya mengenai program/promosi: ${promo.title}`
  );

  return (
    <article className='w-full'>
      {/* Top Breadcrumb & Navigation */}
      <div className='border-b border-line bg-muted/20'>
        <SectionContainer className='py-3.5'>
          <nav aria-label='Breadcrumb' className='flex items-center gap-2 text-xs text-muted-foreground'>
            <Link
              href={ROUTES.home}
              className='hover:text-foreground transition-colors inline-flex items-center gap-1 font-medium'
            >
              <ArrowLeft className='size-3.5' />
              <span>Beranda</span>
            </Link>
            <span aria-hidden='true'>/</span>
            <span className='text-muted-foreground'>Program & Promo</span>
            <span aria-hidden='true'>/</span>
            <span className='font-semibold text-foreground truncate max-w-[220px] sm:max-w-md'>
              {promo.title}
            </span>
          </nav>
        </SectionContainer>
      </div>

      {/* Main Content Area */}
      <SectionContainer className='py-8 sm:py-12'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12'>
          {/* Left Column: Visual Poster & Article Body */}
          <div className='lg:col-span-8 space-y-6 sm:space-y-8'>
            {/* Header Title & Meta */}
            <header className='space-y-3'>
              <div className='inline-flex items-center gap-2 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary'>
                <Calendar className='size-3.5' />
                <span>{periodText}</span>
              </div>

              <h1 className='text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight'>
                {promo.title}
              </h1>

              <p className='text-sm sm:text-base text-muted-foreground leading-relaxed'>
                {promo.summary}
              </p>
            </header>

            {/* Poster Visual (Full Width Image) */}
            <div className='relative w-full overflow-hidden rounded-2xl border border-border/80 bg-muted shadow-xs'>
              <PromoImage
                src={promo.image.src}
                alt={promo.image.alt || promo.title}
                fallbackTitle={promo.title}
                fallbackSummary={promo.summary}
                aspectRatio='video'
                priority
                className='w-full object-cover'
              />
            </div>

            {/* Body Content / Article Details */}
            {promo.body ? (
              <section className='space-y-4 pt-2' aria-label='Rincian Program'>
                <h2 className='text-lg sm:text-xl font-bold tracking-tight text-foreground'>
                  Rincian Informasi & Layanan
                </h2>
                <div className='prose prose-sm sm:prose-base dark:prose-invert max-w-none text-foreground/90 leading-relaxed whitespace-pre-line'>
                  {promo.body}
                </div>
              </section>
            ) : null}

            {/* Terms and Conditions Box */}
            {promo.terms ? (
              <section
                aria-label='Syarat dan Ketentuan'
                className='rounded-xl border border-border/70 bg-muted/30 p-5 sm:p-6 space-y-2.5'
              >
                <div className='flex items-center gap-2 text-sm font-bold text-foreground'>
                  <ShieldCheck className='size-4 text-primary' />
                  <span>Syarat & Ketentuan Berlaku</span>
                </div>
                <p className='text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line'>
                  {promo.terms}
                </p>
              </section>
            ) : null}
          </div>

          {/* Right Column: Floating Action Card & Quick Contact */}
          <aside className='lg:col-span-4'>
            <div className='sticky top-20 rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-6'>
              <div className='space-y-2'>
                <span className='text-xs font-semibold text-primary uppercase tracking-wider block'>
                  Aksi Pasien
                </span>
                <h3 className='text-lg font-bold text-foreground'>
                  Tertarik dengan penawaran ini?
                </h3>
                <p className='text-xs text-muted-foreground leading-relaxed'>
                  Segera jadwalkan janji temu Anda atau hubungi layanan pelanggan kami untuk konsultasi langsung.
                </p>
              </div>

              {/* Action Buttons */}
              <div className='space-y-3 pt-1'>
                <Link
                  href={promo.cta?.href || ROUTES.clinicNewAppointment}
                  target={promo.cta?.href?.startsWith('http') ? '_blank' : undefined}
                  rel={promo.cta?.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className='w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 active:scale-98 transition-all'
                >
                  <CheckCircle2 className='size-4' />
                  <span>{promo.cta?.label || 'Jadwalkan Janji Temu'}</span>
                </Link>

                <a
                  href={whatsappUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border/80 bg-background px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted active:scale-98 transition-all'
                >
                  <MessageCircle className='size-4 text-emerald-600' />
                  <span>Tanya via WhatsApp</span>
                </a>
              </div>

              {/* Clinic Assurance Points */}
              <div className='border-t border-border/60 pt-4 space-y-2 text-xs text-muted-foreground'>
                <div className='flex items-start gap-2'>
                  <span className='text-primary font-bold'>✓</span>
                  <span>Pelayanan ramah berorientasi kenyamanan keluarga</span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-primary font-bold'>✓</span>
                  <span>Tenaga medis bersertifikasi resmi & berpengalaman</span>
                </div>
                <div className='flex items-start gap-2'>
                  <span className='text-primary font-bold'>✓</span>
                  <span>Klinik terakreditasi standar Kementerian Kesehatan RI</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </SectionContainer>

      {/* Other Active Promos Recommendation */}
      {otherPromos.length > 0 ? (
        <>
          <TechnicalDivider />
          <SectionContainer className='py-12'>
            <div className='space-y-6'>
              <div>
                <h3 className='text-xl font-bold tracking-tight text-foreground'>
                  Program & Promo Lainnya
                </h3>
                <p className='text-xs sm:text-sm text-muted-foreground mt-1'>
                  Informasi penawaran layanan kesehatan terbaik lainnya dari Amanah Healthcare
                </p>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {otherPromos.map((item) => (
                  <Link
                    key={item.id}
                    href={`/promosi/${item.id}`}
                    className='group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card text-card-foreground shadow-xs transition-all hover:shadow-md hover:border-primary/40'
                  >
                    <div className='relative w-full overflow-hidden bg-muted'>
                      <PromoImage
                        src={item.image.src}
                        alt={item.image.alt || item.title}
                        fallbackTitle={item.title}
                        fallbackSummary={item.summary}
                        aspectRatio='video'
                        className='transition-transform duration-300 group-hover:scale-102'
                      />
                    </div>
                    <div className='p-4 space-y-1.5 flex-1 flex flex-col justify-between'>
                      <div>
                        <h4 className='text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors'>
                          {item.title}
                        </h4>
                        <p className='text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed'>
                          {item.summary}
                        </p>
                      </div>
                      <span className='text-xs font-semibold text-primary pt-2 block'>
                        Pelajari Selengkapnya →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </SectionContainer>
        </>
      ) : null}
    </article>
  );
}
