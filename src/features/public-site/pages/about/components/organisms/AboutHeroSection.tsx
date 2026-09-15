'use client';

import type { AboutHeroData, AboutVisualBandData } from '../../types';
import type { HeroConfettiRef } from '../atoms/HeroConfetti';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useRef } from 'react';
import {
  PixelMeshBackground,
  type PixelMeshBackgroundHandle
} from '@/features/public-site/components/shared';
import { cn } from '@/features/public-site/lib/helpers';
import { aboutHeroData, aboutPixelIcons, aboutVisualBandData } from '../../data';
import { DirectionalArrowIndicator } from '../atoms/DirectionalArrowIndicator';
import { HeroConfetti } from '../atoms/HeroConfetti';
import { PixelIconBadge } from '../atoms/PixelIconBadge';

gsap.registerPlugin(ScrollTrigger);

type AboutHeroSectionProps = {
  className?: string;
  data?: AboutHeroData;
  heroData?: AboutHeroData;
  visualData?: AboutVisualBandData;
};

function parseHeroHeadline(headline: string) {
  if (headline.includes(' dan ')) {
    const parts = headline.split(' dan ');
    const line1 = parts[0]?.trim() ?? '';
    const line2 = `dan ${parts.slice(1).join(' dan ').trim()}`;
    return {
      line1Words: line1.split(/\s+/).filter(Boolean),
      line2Words: line2.split(/\s+/).filter(Boolean)
    };
  }

  const allWords = headline.split(/\s+/).filter(Boolean);
  const mid = Math.ceil(allWords.length / 2);
  return {
    line1Words: allWords.slice(0, mid),
    line2Words: allWords.slice(mid)
  };
}

export function AboutHeroSection({ className, data, heroData, visualData }: AboutHeroSectionProps) {
  const resolvedHero = heroData ?? data ?? aboutHeroData;
  const resolvedVisual = visualData ?? aboutVisualBandData;
  const icons = resolvedHero.icons ?? aboutPixelIcons;
  const { line1Words, line2Words } = parseHeroHeadline(resolvedHero.headline);

  const containerRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const line1WrapperRef = useRef<HTMLSpanElement>(null);
  const line1WordsRef = useRef<HTMLSpanElement[]>([]);
  const line2WrapperRef = useRef<HTMLSpanElement>(null);
  const line2WordsRef = useRef<HTMLSpanElement[]>([]);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const rightShellRef = useRef<HTMLDivElement>(null);
  const initialTextRef = useRef<HTMLDivElement>(null);
  const initialTextContentRef = useRef<HTMLParagraphElement>(null);
  const expandedTextRef = useRef<HTMLDivElement>(null);
  const iconsContainerRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<HTMLDivElement[]>([]);
  const arrowContainerRef = useRef<HTMLDivElement>(null);
  const arrowInnerRef = useRef<HTMLDivElement>(null);
  const confettiRef = useRef<HeroConfettiRef>(null);
  const pixelMeshRef = useRef<PixelMeshBackgroundHandle>(null);
  const expandedTextContentRef = useRef<HTMLDivElement>(null);
  const mobileCommitmentRef = useRef<HTMLDivElement>(null);
  const mobileConfettiRef = useRef<HeroConfettiRef>(null);
  const mobilePixelMeshRef = useRef<PixelMeshBackgroundHandle>(null);
  const mobileHeadlineRef = useRef<HTMLHeadingElement>(null);
  const mobileLine1WrapperRef = useRef<HTMLSpanElement>(null);
  const mobileLine1WordsRef = useRef<HTMLSpanElement[]>([]);
  const mobileLine2WrapperRef = useRef<HTMLSpanElement>(null);
  const mobileLine2WordsRef = useRef<HTMLSpanElement[]>([]);
  const mobileLeadTextRef = useRef<HTMLParagraphElement>(null);
  const mobileImageWrapperRef = useRef<HTMLDivElement>(null);
  const mobileIconsContainerRef = useRef<HTMLDivElement>(null);
  const mobileIconsRef = useRef<HTMLDivElement[]>([]);
  const mobileCommitmentTextRef = useRef<HTMLParagraphElement>(null);
  const mobileArrowRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) {
        return;
      }

      const mm = gsap.matchMedia();

      // Desktop: Pinned scroll transformation where the right shell expands to fill viewport
      mm.add('(min-width: 1024px)', () => {
        // --- 0. HERO ENTRANCE CHOREOGRAPHY (Desktop) ---
        // Measure vertical distance from Line 1 to Line 2 so Line 1 initially sits at Line 2
        const line1El = line1WrapperRef.current;
        const line2El = line2WrapperRef.current;
        const rect1 = line1El?.getBoundingClientRect();
        const rect2 = line2El?.getBoundingClientRect();
        const deltaY =
          rect1 && rect2 && rect2.top > rect1.top
            ? rect2.top - rect1.top
            : (line1El?.offsetHeight ?? 54);

        if (line1El) {
          gsap.set(line1El, { y: deltaY });
        }

        const entranceTl = gsap.timeline({
          delay: 0.15
        });

        // (a) Line 1 words tick up randomly like digital clock counter digits on Line 2
        const line1Elements = line1WordsRef.current.filter(Boolean);
        if (line1Elements.length > 0) {
          entranceTl.fromTo(
            line1Elements,
            {
              opacity: 0,
              yPercent: 120
            },
            {
              duration: 0.55,
              ease: 'back.out(1.4)',
              opacity: 1,
              stagger: {
                each: 0.08,
                from: 'random'
              },
              yPercent: 0
            },
            0
          );
        }

        // (b) Doctor fluid image in left column enters smoothly
        if (imageWrapperRef.current) {
          entranceTl.fromTo(
            imageWrapperRef.current,
            {
              opacity: 0,
              scale: 1.06
            },
            {
              duration: 1.2,
              ease: 'power2.out',
              opacity: 1,
              scale: 1
            },
            0.15
          );
        }

        // (c) After settling on Line 2, Line 1 shifts up to its natural Line 1 spot
        if (line1El) {
          entranceTl.to(
            line1El,
            {
              duration: 0.75,
              ease: 'power3.inOut',
              y: 0
            },
            0.85
          );
        }

        // (d) Line 2 words tick up randomly from below onto Line 2
        const line2Elements = line2WordsRef.current.filter(Boolean);
        if (line2Elements.length > 0) {
          entranceTl.fromTo(
            line2Elements,
            {
              opacity: 0,
              yPercent: 120
            },
            {
              duration: 0.55,
              ease: 'back.out(1.4)',
              opacity: 1,
              stagger: {
                each: 0.08,
                from: 'random'
              },
              yPercent: 0
            },
            1.1
          );
        }

        // (e) Initial description text on right shell glides in
        if (initialTextContentRef.current) {
          entranceTl.fromTo(
            initialTextContentRef.current,
            {
              opacity: 0,
              y: 20
            },
            {
              duration: 0.85,
              ease: 'power3.out',
              opacity: 1,
              y: 0
            },
            1.0
          );
        }

        // (f) Directional arrow indicator enters smoothly
        if (arrowInnerRef.current) {
          entranceTl.fromTo(
            arrowInnerRef.current,
            {
              opacity: 0,
              y: 16
            },
            {
              duration: 0.8,
              ease: 'power3.out',
              opacity: 1,
              y: 0
            },
            1.25
          );
        }

        entranceTl.call(() => {
          ScrollTrigger.refresh();
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top+=48',
            end: '+=2400', // Generous scroll distance: ensures ~2-3 extra scrolls linger on the 100% completed state
            scrub: 0.8,
            pin: true,
            anticipatePin: 1,
            refreshPriority: 10
          }
        });

        // 1. Downward arrows fade out as expand begins
        if (arrowContainerRef.current) {
          tl.to(
            arrowContainerRef.current,
            {
              autoAlpha: 0,
              scale: 0.85,
              duration: 0.25,
              ease: 'power1.out'
            },
            0
          );

          // Collapse the arrow compartment so the text gets the full vertical center of the viewport
          tl.to(
            arrowContainerRef.current,
            {
              borderTopWidth: 0,
              duration: 0.85,
              ease: 'power2.inOut',
              height: 0
            },
            0.05
          );
        }

        // 2. Headline slides up and fades out cleanly
        if (headlineRef.current) {
          tl.to(
            headlineRef.current,
            {
              autoAlpha: 0,
              duration: 0.4,
              ease: 'power2.inOut',
              y: -50
            },
            0
          );
        }

        // 3. Initial text fades out completely first
        if (initialTextRef.current) {
          tl.to(
            initialTextRef.current,
            {
              autoAlpha: 0,
              duration: 0.25,
              ease: 'power2.in',
              y: -12
            },
            0
          );
        }

        // 4. PHASE 1: SCREEN EXPANSION (0.0 -> 1.0)
        if (leftColRef.current && rightShellRef.current) {
          tl.to(
            leftColRef.current,
            {
              duration: 1.0,
              ease: 'power2.inOut',
              width: '0%'
            },
            0
          );

          tl.to(
            rightShellRef.current,
            {
              duration: 1.0,
              ease: 'power2.inOut',
              width: '100%'
            },
            0
          );
        }

        // 5. PHASE 2: SCREEN HAS REACHED 100% EXPANDED!
        if (expandedTextRef.current) {
          tl.set(expandedTextRef.current, { autoAlpha: 1 }, 1.0);
        }

        // 5b. PIXEL SUMMON: Parasite emerges from bottom to top
        const crawlState = { progress: 0 };
        tl.to(
          crawlState,
          {
            duration: 0.85,
            ease: 'none',
            progress: 1,
            onUpdate: () => {
              pixelMeshRef.current?.setProgress(crawlState.progress);
            }
          },
          1.0
        );

        // 5c. Expanded text content glides in as pixels charge past mid-screen
        if (expandedTextContentRef.current) {
          tl.fromTo(
            expandedTextContentRef.current,
            {
              autoAlpha: 0,
              y: 20
            },
            {
              autoAlpha: 1,
              duration: 0.45,
              ease: 'power2.out',
              y: 0
            },
            1.35
          );
        }

        // 6. PHASE 3: 3 Pixel Icons pop out after pixel mesh is summoned
        if (iconsRef.current.length > 0) {
          tl.fromTo(
            iconsRef.current,
            {
              autoAlpha: 0,
              scale: 0.8,
              y: 20
            },
            {
              autoAlpha: 1,
              duration: 0.3,
              ease: 'back.out(1.5)',
              scale: 1,
              stagger: 0.1,
              y: 0
            },
            1.85
          );
        }

        // 7. Confetti celebration burst exactly when icon at index 2 emerges
        tl.call(
          () => {
            confettiRef.current?.fire();
          },
          [],
          2.05
        );

        // 8. PHASE 4: HOLD / REST BUFFER
        const holdState = { buffer: 0 };
        tl.to(
          holdState,
          {
            buffer: 1,
            duration: 1.5
          },
          2.15
        );
      });

      // Mobile / Tablet (< 1024px): Hero Entrance Choreography matching desktop + ScrollTrigger for commitment section
      mm.add('(max-width: 1023px)', () => {
        // --- 1. Mobile Hero Entrance Timeline ---
        const line1El = mobileLine1WrapperRef.current;
        const line2El = mobileLine2WrapperRef.current;
        const rect1 = line1El?.getBoundingClientRect();
        const rect2 = line2El?.getBoundingClientRect();
        const deltaY =
          rect1 && rect2 && rect2.top > rect1.top
            ? rect2.top - rect1.top
            : (line1El?.offsetHeight ?? 38);

        if (line1El) {
          gsap.set(line1El, { y: deltaY });
        }

        const mobileEntranceTl = gsap.timeline({
          delay: 0.15
        });

        // (a) Line 1 words tick up randomly like digital clock counter digits on Line 2
        const queriedLine1 = line1El
          ? Array.from(line1El.querySelectorAll<HTMLSpanElement>('[data-hero-headline-word]'))
          : [];
        const line1Elements =
          queriedLine1.length > 0 ? queriedLine1 : mobileLine1WordsRef.current.filter(Boolean);

        if (line1Elements.length > 0) {
          mobileEntranceTl.fromTo(
            line1Elements,
            {
              opacity: 0,
              yPercent: 120
            },
            {
              duration: 0.55,
              ease: 'back.out(1.4)',
              opacity: 1,
              stagger: {
                each: 0.08,
                from: 'random'
              },
              yPercent: 0
            },
            0
          );
        }

        // (b) Doctor team image below headline enters smoothly
        if (mobileImageWrapperRef.current) {
          mobileEntranceTl.fromTo(
            mobileImageWrapperRef.current,
            {
              opacity: 0,
              scale: 1.05
            },
            {
              duration: 1.1,
              ease: 'power2.out',
              opacity: 1,
              scale: 1
            },
            0.2
          );
        }

        // (c) Line 1 shifts up to its natural spot
        if (line1El) {
          mobileEntranceTl.to(
            line1El,
            {
              duration: 0.75,
              ease: 'power3.inOut',
              y: 0
            },
            0.85
          );
        }

        // (d) Line 2 words tick up randomly from below onto Line 2
        const queriedLine2 = line2El
          ? Array.from(line2El.querySelectorAll<HTMLSpanElement>('[data-hero-headline-word]'))
          : [];
        const line2Elements =
          queriedLine2.length > 0 ? queriedLine2 : mobileLine2WordsRef.current.filter(Boolean);

        if (line2Elements.length > 0) {
          mobileEntranceTl.fromTo(
            line2Elements,
            {
              opacity: 0,
              yPercent: 120
            },
            {
              duration: 0.55,
              ease: 'back.out(1.4)',
              opacity: 1,
              stagger: {
                each: 0.08,
                from: 'random'
              },
              yPercent: 0
            },
            1.1
          );
        }

        // (e) Lead description text glides in
        if (mobileLeadTextRef.current) {
          mobileEntranceTl.fromTo(
            mobileLeadTextRef.current,
            {
              opacity: 0,
              y: 18
            },
            {
              duration: 0.85,
              ease: 'power3.out',
              opacity: 1,
              y: 0
            },
            1.0
          );
        }

        // --- 2. Mobile Commitment Section on Scroll ---
        if (mobileCommitmentRef.current) {
          const commitmentTl = gsap.timeline({
            scrollTrigger: {
              trigger: mobileCommitmentRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          });

          const mobileIconEls = mobileIconsRef.current.filter(Boolean);
          if (mobileIconEls.length > 0) {
            commitmentTl.fromTo(
              mobileIconEls,
              {
                opacity: 0,
                scale: 0.8,
                y: 18
              },
              {
                duration: 0.35,
                ease: 'back.out(1.5)',
                opacity: 1,
                scale: 1,
                stagger: 0.1,
                y: 0
              },
              0
            );
          }

          if (mobileCommitmentTextRef.current) {
            commitmentTl.fromTo(
              mobileCommitmentTextRef.current,
              {
                opacity: 0,
                y: 20
              },
              {
                duration: 0.7,
                ease: 'power2.out',
                opacity: 1,
                y: 0
              },
              0.15
            );
          }

          if (mobileArrowRef.current) {
            commitmentTl.fromTo(
              mobileArrowRef.current,
              {
                opacity: 0,
                y: 14
              },
              {
                duration: 0.6,
                ease: 'power2.out',
                opacity: 1,
                y: 0
              },
              0.3
            );
          }

          ScrollTrigger.create({
            trigger: mobileCommitmentRef.current,
            start: 'top 80%',
            once: true,
            onEnter: () => {
              mobileConfettiRef.current?.fire();
            }
          });
        }
      });

      return () => {
        mm.revert();
      };
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        `
        relative w-full overflow-hidden border-b border-line bg-background
        lg:h-[calc(100vh-48px)] lg:min-h-[600px]
      `,
        className
      )}
    >
      {/* Desktop Split Columns (>= 1024px) */}
      <div
        className='
        relative z-0 hidden size-full overflow-hidden
        lg:flex lg:flex-row
      '
      >
        {/* Left Column: Unified Headline + Fluid Edge-to-Edge Illustration */}
        <div
          ref={leftColRef}
          className='
            relative flex shrink-0 flex-col justify-between overflow-hidden
            border-b border-line
            lg:h-full lg:w-[68%] lg:border-r lg:border-b-0
          '
        >
          {/* Upper: Headline Area */}
          <div
            className='
            flex flex-1 flex-col justify-end px-6 pt-16 pb-8
            sm:px-10 sm:pt-24 sm:pb-10
            lg:px-12 lg:pt-28 lg:pb-10
          '
          >
            <h1
              ref={headlineRef}
              className='
                relative w-full max-w-none text-2xl font-medium tracking-tight
                text-foreground will-change-transform
                sm:text-3xl
                md:text-4xl
                lg:text-[2.35rem]/[1.15]
                xl:text-[2.85rem]/[1.15]
                2xl:text-5xl/[1.14]
              '
            >
              <span className='sr-only'>{resolvedHero.headline}</span>
              <span aria-hidden='true' className='block'>
                {/* Line 1: 'Sehat Lebih Mudah, Nyaman,' */}
                <span
                  ref={line1WrapperRef}
                  className='
                    block will-change-transform
                    sm:whitespace-nowrap
                  '
                >
                  {line1Words.map((word, index) => (
                    <span
                      key={`l1-${word}-${index}`}
                      className='
                        -mb-1 inline-block overflow-hidden pt-0.5 pb-1 align-top
                      '
                    >
                      <span
                        ref={(el) => {
                          if (el) {
                            line1WordsRef.current[index] = el;
                          }
                        }}
                        className='inline-block opacity-0 will-change-transform'
                      >
                        {word}
                        {index < line1Words.length - 1 ? '\u00A0' : ''}
                      </span>
                    </span>
                  ))}
                </span>

                {/* Line 2: 'dan Terpercaya Bersama Kami.' */}
                <span
                  ref={line2WrapperRef}
                  className='
                    block will-change-transform
                    sm:whitespace-nowrap
                  '
                >
                  {line2Words.map((word, index) => (
                    <span
                      key={`l2-${word}-${index}`}
                      className='
                        -mb-1 inline-block overflow-hidden pt-0.5 pb-1 align-top
                      '
                    >
                      <span
                        ref={(el) => {
                          if (el) {
                            line2WordsRef.current[index] = el;
                          }
                        }}
                        className='inline-block opacity-0 will-change-transform'
                      >
                        {word}
                        {index < line2Words.length - 1 ? '\u00A0' : ''}
                      </span>
                    </span>
                  ))}
                </span>
              </span>
            </h1>
          </div>

          {/* Lower: FLUID Illustration - Zero margin, zero padding, zero gap */}
          <figure
            className='
            relative h-[220px] w-full shrink-0 overflow-hidden border-t
            border-line bg-muted/20
            sm:h-[260px]
            lg:h-[290px]
          '
          >
            <div
              ref={imageWrapperRef}
              className='relative size-full opacity-0 will-change-transform'
            >
              <Image
                src={resolvedVisual.image.src}
                alt={resolvedVisual.image.alt}
                fill
                priority
                sizes='(min-width: 1280px) 880px, (min-width: 1024px) 68vw, 100vw'
                className='object-cover object-center'
              />
            </div>
          </figure>
        </div>

        {/* Right Shell (TARGET UTAMA): Expanding Shell wrapping description */}
        <div
          ref={rightShellRef}
          className='
            relative flex shrink-0 flex-col justify-between overflow-hidden
            bg-surface/50 transition-colors
            lg:h-full lg:w-[32%]
            dark:bg-surface/25
          '
        >
          {/* Upper Compartment: Initial Text sits at the bottom, matching Headline baseline */}
          <div
            className='
            flex flex-1 flex-col justify-end px-6 pt-16 pb-8
            sm:px-8 sm:pt-24 sm:pb-10
            lg:px-12 lg:pt-28 lg:pb-10
          '
          >
            <div ref={initialTextRef} className='w-full max-w-sm text-left will-change-transform'>
              <p
                ref={initialTextContentRef}
                className='
                  text-left text-sm/relaxed text-muted-foreground opacity-0
                  will-change-transform
                  sm:text-base/relaxed
                '
              >
                {resolvedHero.initialDescription ??
                  'Kenali Klinik Amanah Healthcare lebih dekat, dan temukan cara kami hadir untuk kesehatan Anda dan keluarga.'}
              </p>
            </div>
          </div>

          {/* Lower: Downward Arrows with Continuous Game Glow */}
          <div
            ref={arrowContainerRef}
            className='
              flex h-[220px] shrink-0 items-center justify-start overflow-hidden
              border-t border-line px-6
              sm:h-[260px] sm:px-8
              lg:h-[290px] lg:pl-10
            '
          >
            <div ref={arrowInnerRef} className='opacity-0 will-change-transform'>
              <DirectionalArrowIndicator />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Expanded Camouflaged Content (>= 1024px) */}
      <div
        ref={expandedTextRef}
        className='
          pointer-events-none absolute inset-0 z-10 hidden items-center
          justify-center overflow-hidden px-6 opacity-0 will-change-transform
          sm:px-10
          lg:flex lg:px-16
        '
      >
        <PixelMeshBackground
          ref={pixelMeshRef}
          className='
            pointer-events-none absolute inset-0 z-0 size-full overflow-hidden
          '
        />

        <HeroConfetti ref={confettiRef} className='z-20' />

        <div
          ref={expandedTextContentRef}
          className='
            relative z-10 flex max-w-3xl flex-col items-center justify-center
            text-center opacity-0 will-change-transform
          '
        >
          {icons.length > 0 && (
            <div
              ref={iconsContainerRef}
              className='
                mb-6 flex items-center justify-center gap-4
                sm:mb-8 sm:gap-6
              '
            >
              {icons.map((icon, index) => (
                <div
                  key={icon.id}
                  ref={(el) => {
                    if (el) {
                      iconsRef.current[index] = el;
                    }
                  }}
                  className='opacity-0 will-change-transform'
                >
                  <PixelIconBadge icon={icon} size={48} />
                </div>
              ))}
            </div>
          )}

          <p
            className='
            max-w-2xl text-center text-lg/relaxed font-medium text-foreground
            sm:text-xl/relaxed
            md:text-2xl/relaxed
            lg:max-w-3xl lg:text-3xl/[1.35]
          '
          >
            {resolvedHero.description}
          </p>
        </div>
      </div>

      {/* Mobile Layout (< 1024px): Natural, Impeccable Flow with Synchronized GSAP Animations */}
      <div className='flex w-full flex-col lg:hidden'>
        {/* Upper: Headline & Lead Description */}
        <div className='px-5 pt-8 pb-6 sm:px-8 sm:pt-12 sm:pb-8'>
          <h2
            ref={mobileHeadlineRef}
            className='
              relative w-full text-2xl font-medium tracking-tight
              text-foreground will-change-transform leading-snug
              sm:text-3xl md:text-4xl
            '
          >
            <span className='sr-only'>{resolvedHero.headline}</span>
            <span aria-hidden='true' className='block'>
              {/* Line 1 */}
              <span ref={mobileLine1WrapperRef} className='block will-change-transform'>
                {line1Words.map((word, index) => (
                  <span
                    key={`mobile-l1-${word}-${index}`}
                    className='-mb-1 inline-block overflow-hidden pt-0.5 pb-1 align-top'
                  >
                    <span
                      data-hero-headline-word='true'
                      ref={(el) => {
                        if (el) {
                          mobileLine1WordsRef.current[index] = el;
                        }
                      }}
                      className='inline-block opacity-0 will-change-transform'
                    >
                      {word}
                      {index < line1Words.length - 1 ? '\u00A0' : ''}
                    </span>
                  </span>
                ))}
              </span>

              {/* Line 2 */}
              <span ref={mobileLine2WrapperRef} className='block will-change-transform'>
                {line2Words.map((word, index) => (
                  <span
                    key={`mobile-l2-${word}-${index}`}
                    className='-mb-1 inline-block overflow-hidden pt-0.5 pb-1 align-top'
                  >
                    <span
                      data-hero-headline-word='true'
                      ref={(el) => {
                        if (el) {
                          mobileLine2WordsRef.current[index] = el;
                        }
                      }}
                      className='inline-block opacity-0 will-change-transform'
                    >
                      {word}
                      {index < line2Words.length - 1 ? '\u00A0' : ''}
                    </span>
                  </span>
                ))}
              </span>
            </span>
          </h2>

          <p
            ref={mobileLeadTextRef}
            className='mt-3 text-sm leading-relaxed text-muted-foreground opacity-0 will-change-transform sm:mt-4 sm:text-base'
          >
            {resolvedHero.initialDescription}
          </p>
        </div>

        {/* Middle: Doctor Team Image with clean framing */}
        <figure className='relative aspect-16/10 w-full overflow-hidden border-y border-line bg-muted/20 sm:aspect-21/9'>
          <div
            ref={mobileImageWrapperRef}
            className='relative size-full opacity-0 will-change-transform'
          >
            <Image
              src={resolvedVisual.image.src}
              alt={resolvedVisual.image.alt}
              fill
              priority
              sizes='(max-width: 1023px) 100vw, 880px'
              className='object-cover object-center'
            />
          </div>
        </figure>

        {/* Lower: Dedicated Commitment Card with Pixel Mesh & Pixel Icons */}
        <div
          ref={mobileCommitmentRef}
          className='relative w-full overflow-hidden bg-card/40 px-5 py-8 sm:px-8 sm:py-10 text-center'
        >
          <PixelMeshBackground
            ref={mobilePixelMeshRef}
            initialProgress={1}
            progress={1}
            className='pointer-events-none absolute inset-0 z-0 size-full opacity-55 dark:opacity-75'
          />

          <HeroConfetti ref={mobileConfettiRef} className='z-20' />

          <div className='relative z-10 mx-auto flex max-w-xl flex-col items-center'>
            {icons.length > 0 && (
              <div
                ref={mobileIconsContainerRef}
                className='mb-4 flex items-center justify-center gap-3.5 sm:mb-5 sm:gap-4'
              >
                {icons.map((icon, index) => (
                  <div
                    key={icon.id}
                    ref={(el) => {
                      if (el) {
                        mobileIconsRef.current[index] = el;
                      }
                    }}
                    className='opacity-0 will-change-transform transition-transform hover:scale-105'
                  >
                    <PixelIconBadge icon={icon} size={42} />
                  </div>
                ))}
              </div>
            )}

            <p
              ref={mobileCommitmentTextRef}
              className='text-base font-medium leading-relaxed text-foreground opacity-0 will-change-transform sm:text-lg'
            >
              {resolvedHero.description}
            </p>

            <div ref={mobileArrowRef} className='mt-5 pt-1 opacity-0 will-change-transform'>
              <DirectionalArrowIndicator />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
