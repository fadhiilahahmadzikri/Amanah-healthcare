'use client';

import type { PointerEvent, WheelEvent } from 'react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/features/public-site/lib/helpers';

export type CardItem = {
  imgUrl: string;
  alt?: string;
  linkUrl?: string;
};

export type SocialCardsProps = {
  cards: CardItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
};

const MAX_VISIBLE = 7;
const HALF = 3;
const DRAG_CANCEL_CLICK_THRESHOLD_PX = 8;
const DRAG_SWIPE_THRESHOLD_PX = 48;
const WHEEL_SWIPE_THRESHOLD_PX = 36;
const WHEEL_COOLDOWN_MS = 450;
const AUTOPLAY_RESUME_DELAY_MS = 700;

const FAN_POSITIONS = [
  { rot: -21, scale: 0.7756, x: -30, y: 7.3, zIndex: 1 },
  { rot: -14, scale: 0.8498, x: -22, y: 4.0, zIndex: 2 },
  { rot: -7, scale: 0.9346, x: -11, y: 1.3, zIndex: 3 },
  { rot: 0, scale: 1.0, x: 0, y: 0.0, zIndex: 10 },
  { rot: 7, scale: 0.9346, x: 11, y: 1.3, zIndex: 3 },
  { rot: 14, scale: 0.8498, x: 22, y: 4.0, zIndex: 2 },
  { rot: 21, scale: 0.7756, x: 30, y: 7.3, zIndex: 1 }
];

function getResponsiveMultiplier(width: number) {
  if (width < 480) {
    return 0.28;
  }
  if (width < 640) {
    return 0.38;
  }
  if (width < 768) {
    return 0.5;
  }
  if (width < 1024) {
    return 0.75;
  }
  if (width < 1280) {
    return 1.0;
  }
  if (width < 1536) {
    return 1.15;
  }
  return 1.32;
}

function getHeightMultiplier(width: number) {
  if (typeof window === 'undefined') {
    return 1;
  }
  let idealPx: number;
  if (width < 480) {
    idealPx = 22 * 16;
  } else if (width < 640) {
    idealPx = 26 * 16;
  } else if (width < 768) {
    idealPx = 28 * 16;
  } else if (width < 1024) {
    idealPx = 34 * 16;
  } else {
    idealPx = 38 * 16;
  }

  const available = window.innerHeight * 0.7;
  if (available >= idealPx) {
    return 1;
  }
  return available / idealPx;
}

function getSlotConfig(totalCards: number, slot: number) {
  if (totalCards >= MAX_VISIBLE) {
    return FAN_POSITIONS[slot] || FAN_POSITIONS[3]!;
  }
  const center = totalCards >> 1;
  const distance = totalCards > 1 ? (slot - center) / center : 0;
  const absDistance = Math.abs(distance);
  return {
    rot: distance * 21,
    scale: 1.0 - 0.2244 * absDistance * absDistance,
    x: distance * 30,
    y: absDistance * absDistance * 7.3,
    zIndex: 10 - Math.abs(slot - center)
  };
}

const ARROW_CLASSES = `
    group pointer-events-auto flex size-11 cursor-pointer items-center
    justify-center rounded-full border border-white/30 bg-white/15
    text-foreground shadow-[0_8px_30px_rgb(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.6)]
    backdrop-blur-xl transition-all duration-300
    hover:scale-105 hover:border-white/50 hover:bg-white/30
    hover:shadow-[0_8px_30px_rgb(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.8)]
    active:scale-95 active:bg-white/40
    sm:size-12
    dark:border-white/20 dark:bg-white/10
  `;

function getCenteredScrollLeft(scroller: HTMLElement, activeDot: HTMLElement) {
  const activeDotCenter = activeDot.offsetLeft + activeDot.offsetWidth / 2;
  const targetScrollLeft = activeDotCenter - scroller.clientWidth / 2;
  const maxScrollLeft = Math.max(0, scroller.scrollWidth - scroller.clientWidth);

  return Math.max(0, Math.min(maxScrollLeft, targetScrollLeft));
}

export function CardFanCarousel({
  cards,
  autoPlay = true,
  autoPlayInterval = 2800,
  className
}: SocialCardsProps) {
  const carouselRootRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const paginationScrollerRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);
  const hasEnteredRef = useRef(false);
  const directionRef = useRef<'left' | 'right' | null>(null);
  const prevVisibleRef = useRef<Set<number>>(new Set());
  const isPausedRef = useRef(false);
  const isCarouselVisibleRef = useRef(false);
  const dragStartXRef = useRef<number | null>(null);
  const dragStartYRef = useRef<number | null>(null);
  const hasDraggedRef = useRef(false);
  const autoplayResumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelCooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isWheelCoolingDownRef = useRef(false);
  const activeDotRef = useRef<HTMLButtonElement | null>(null);

  const totalCards = cards.length;
  const needsPagination = totalCards > MAX_VISIBLE;
  const [centerIndex, setCenterIndex] = useState(needsPagination ? HALF : totalCards >> 1);

  useEffect(() => {
    const activeDot = activeDotRef.current;
    const scroller = paginationScrollerRef.current;

    if (!activeDot || !scroller) {
      return;
    }

    scroller.scrollTo({
      left: getCenteredScrollLeft(scroller, activeDot),
      behavior: 'smooth'
    });
  }, [centerIndex]);

  useEffect(() => {
    const carouselRoot = carouselRootRef.current;

    if (!carouselRoot) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      isCarouselVisibleRef.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isCarouselVisibleRef.current = Boolean(entry?.isIntersecting);
      },
      {
        root: null,
        rootMargin: '120px 0px',
        threshold: 0.08
      }
    );

    observer.observe(carouselRoot);

    return () => {
      observer.disconnect();
    };
  }, []);

  const getVisibleMap = useCallback(
    (center: number) => {
      const map = new Map<number, number>();
      if (!needsPagination) {
        cards.forEach((_, i) => map.set(i, i));
        return map;
      }
      for (let slot = 0; slot < MAX_VISIBLE; slot++) {
        map.set((((center + slot - HALF) % totalCards) + totalCards) % totalCards, slot);
      }
      return map;
    },
    [totalCards, needsPagination, cards]
  );

  const cycle = useCallback(
    (direction: 'left' | 'right') => {
      if (isAnimatingRef.current || !needsPagination) {
        return;
      }
      isAnimatingRef.current = true;
      directionRef.current = direction;
      setCenterIndex((prev) =>
        direction === 'right' ? (prev + 1) % totalCards : (prev - 1 + totalCards) % totalCards
      );
    },
    [totalCards, needsPagination]
  );

  const pauseAutoplay = useCallback(() => {
    isPausedRef.current = true;
    if (autoplayResumeTimerRef.current) {
      clearTimeout(autoplayResumeTimerRef.current);
      autoplayResumeTimerRef.current = null;
    }
  }, []);

  const scheduleAutoplayResume = useCallback(() => {
    if (autoplayResumeTimerRef.current) {
      clearTimeout(autoplayResumeTimerRef.current);
    }

    autoplayResumeTimerRef.current = setTimeout(() => {
      isPausedRef.current = false;
      autoplayResumeTimerRef.current = null;
    }, AUTOPLAY_RESUME_DELAY_MS);
  }, []);

  // Infinite Auto-play loop
  useEffect(() => {
    if (!autoPlay || !needsPagination) {
      return;
    }

    const intervalTimer = setInterval(() => {
      if (
        isPausedRef.current ||
        !isCarouselVisibleRef.current ||
        isAnimatingRef.current ||
        (typeof document !== 'undefined' && document.hidden)
      ) {
        return;
      }
      cycle('right');
    }, autoPlayInterval);

    return () => clearInterval(intervalTimer);
  }, [autoPlay, autoPlayInterval, cycle, needsPagination]);

  useEffect(() => {
    return () => {
      if (autoplayResumeTimerRef.current) {
        clearTimeout(autoplayResumeTimerRef.current);
      }
      if (wheelCooldownTimerRef.current) {
        clearTimeout(wheelCooldownTimerRef.current);
      }
    };
  }, []);

  // GSAP fan positioning and entrance animations
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !totalCards) {
      return;
    }

    const cardElements = Array.from(container.querySelectorAll<HTMLElement>('[data-fan-card]'));
    if (!cardElements.length) {
      return;
    }

    const visibleMap = getVisibleMap(centerIndex);
    const previouslyVisible = prevVisibleRef.current;
    const direction = directionRef.current;
    const isFirstMount = !hasEnteredRef.current;
    const multiplier = getResponsiveMultiplier(window.innerWidth);
    const hMult = getHeightMultiplier(window.innerWidth);
    const slotCount = needsPagination ? MAX_VISIBLE : totalCards;
    const config = (slot: number) => getSlotConfig(slotCount, slot);

    if (isFirstMount) {
      isAnimatingRef.current = true;
    }

    let completedCount = 0;
    const visibleCount = visibleMap.size;

    // Safety timeout to prevent animation deadlocks
    const safetyTimer = setTimeout(() => {
      isAnimatingRef.current = false;
    }, 1400);

    const onCardDone = () => {
      completedCount += 1;
      if (completedCount >= visibleCount) {
        clearTimeout(safetyTimer);
        isAnimatingRef.current = false;
        if (isFirstMount) {
          hasEnteredRef.current = true;
        }
      }
    };

    const enterDistance = Math.max(48, 42 * multiplier);
    const exitDistance = Math.max(48, 42 * multiplier);

    cardElements.forEach((card, cardIndex) => {
      const slot = visibleMap.get(cardIndex);
      const wasVisible = previouslyVisible.has(cardIndex);

      if (slot !== undefined) {
        const { x, y, rot, scale, zIndex } = config(slot);
        const target = {
          x: `${x * multiplier}rem`,
          y: `${y * hMult}rem`,
          rotation: rot,
          scale,
          opacity: 1,
          zIndex
        };

        if (isFirstMount) {
          gsap.set(card, { x: 0, y: `${12 * hMult}rem`, rotation: 0, scale: 0.5, opacity: 0 });
          gsap.to(card, {
            ...target,
            duration: 1.2,
            ease: 'elastic.out(1.05,.78)',
            delay: 0.2 + slot * 0.06,
            onComplete: onCardDone
          });
        } else if (!wasVisible) {
          const enterX = direction === 'right' ? enterDistance : -enterDistance;
          gsap.set(card, {
            x: `${enterX}rem`,
            y: `${y * hMult}rem`,
            rotation: direction === 'right' ? 30 : -30,
            scale: 0.5,
            opacity: 0
          });
          gsap.to(card, {
            ...target,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: onCardDone
          });
        } else {
          gsap.to(card, {
            ...target,
            duration: 0.5,
            ease: 'power2.out',
            onComplete: onCardDone
          });
        }
      } else if (wasVisible) {
        const exitX = direction === 'right' ? -exitDistance : exitDistance;
        gsap.to(card, {
          x: `${exitX}rem`,
          opacity: 0,
          scale: 0.5,
          rotation: direction === 'right' ? -30 : 30,
          duration: 0.4,
          ease: 'power2.in',
          zIndex: 0
        });
      } else if (isFirstMount) {
        gsap.set(card, { opacity: 0, scale: 0.3, x: 0, y: 0, zIndex: 0 });
      }
    });

    prevVisibleRef.current = new Set(visibleMap.keys());

    // Hover spread interactions
    const visibleEntries: { el: HTMLElement; slot: number }[] = [];
    cardElements.forEach((el, i) => {
      const slot = visibleMap.get(i);
      if (slot !== undefined) {
        visibleEntries.push({ el, slot });
      }
    });
    visibleEntries.sort((a, b) => a.slot - b.slot);

    let activeSlot: number | null = null;
    let leaveTimer: ReturnType<typeof setTimeout> | null = null;
    const centerSlot = visibleEntries.length >> 1;

    const updateHoverLayout = (hoveredSlot: number | null) => {
      const mult = getResponsiveMultiplier(window.innerWidth);
      const hM = getHeightMultiplier(window.innerWidth);

      visibleEntries.forEach(({ el, slot }) => {
        const base = config(slot);
        let targetX = base.x * mult;
        let targetY = base.y * hM;
        let targetRot = base.rot;
        let targetScale = base.scale;
        let delay = 0;

        if (hoveredSlot !== null) {
          const distance = Math.abs(slot - hoveredSlot);
          delay = distance * 0.02;

          if (slot === hoveredSlot) {
            targetY -= 2.5 * hM;
            targetScale *= 1.08;
          } else {
            const normalized = centerSlot > 0 ? (slot - centerSlot) / centerSlot : 0;
            const pushStrength =
              8 * (1 - Math.abs(normalized)) * (1 + 0.2 * Math.max(0, 3 - distance));

            if (slot < hoveredSlot) {
              targetX -= pushStrength * mult;
              targetRot -= 3 / (distance + 1);
            } else {
              targetX += pushStrength * mult;
              targetRot += 3 / (distance + 1);
            }

            if (slot === visibleEntries.length - 1 && hoveredSlot < centerSlot) {
              targetY -= 1 * hM;
            }
            if (slot === 0 && hoveredSlot > centerSlot) {
              targetY -= 1 * hM;
            }
          }
        } else {
          delay = Math.abs(slot - centerSlot) * 0.02;
        }

        gsap.to(el, {
          x: `${targetX}rem`,
          y: `${targetY}rem`,
          rotation: targetRot,
          scale: targetScale,
          duration: 0.5,
          delay,
          ease: 'elastic.out(1,.75)',
          overwrite: 'auto'
        });
        gsap.set(el, { zIndex: base.zIndex });
      });
    };

    const enterHandlers = visibleEntries.map(({ el, slot }) => {
      const handler = () => {
        if (isAnimatingRef.current) {
          return;
        }
        if (leaveTimer) {
          clearTimeout(leaveTimer);
          leaveTimer = null;
        }
        if (activeSlot !== slot) {
          activeSlot = slot;
          updateHoverLayout(slot);
        }
      };
      el.addEventListener('mouseenter', handler);
      return { el, handler };
    });

    const onMouseEnterContainer = () => {
      pauseAutoplay();
    };

    const onMouseLeaveContainer = () => {
      scheduleAutoplayResume();
      if (isAnimatingRef.current) {
        return;
      }
      if (leaveTimer) {
        clearTimeout(leaveTimer);
      }
      leaveTimer = setTimeout(() => {
        activeSlot = null;
        updateHoverLayout(null);
      }, 50);
    };

    container.addEventListener('mouseenter', onMouseEnterContainer);
    container.addEventListener('mouseleave', onMouseLeaveContainer);

    const onResize = () => {
      if (!isAnimatingRef.current) {
        updateHoverLayout(activeSlot);
      }
    };
    window.addEventListener('resize', onResize);

    return () => {
      clearTimeout(safetyTimer);
      enterHandlers.forEach(({ el, handler }) => el.removeEventListener('mouseenter', handler));
      container.removeEventListener('mouseenter', onMouseEnterContainer);
      container.removeEventListener('mouseleave', onMouseLeaveContainer);
      window.removeEventListener('resize', onResize);
      if (leaveTimer) {
        clearTimeout(leaveTimer);
      }
    };
  }, [
    centerIndex,
    getVisibleMap,
    needsPagination,
    pauseAutoplay,
    scheduleAutoplayResume,
    totalCards
  ]);

  const goToCard = useCallback(
    (index: number) => {
      if (!needsPagination || isAnimatingRef.current || index === centerIndex) {
        return;
      }

      const diff = (index - centerIndex + totalCards) % totalCards;
      directionRef.current = diff <= totalCards / 2 ? 'right' : 'left';
      setCenterIndex(index);
    },
    [centerIndex, needsPagination, totalCards]
  );

  const handleCardClick = useCallback(
    (index: number) => {
      if (hasDraggedRef.current) {
        hasDraggedRef.current = false;
        return;
      }

      goToCard(index);
    },
    [goToCard]
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!needsPagination || event.button !== 0) {
        return;
      }

      pauseAutoplay();
      dragStartXRef.current = event.clientX;
      dragStartYRef.current = event.clientY;
      hasDraggedRef.current = false;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [needsPagination, pauseAutoplay]
  );

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (dragStartXRef.current === null || dragStartYRef.current === null) {
      return;
    }

    const deltaX = event.clientX - dragStartXRef.current;
    const deltaY = event.clientY - dragStartYRef.current;

    if (Math.abs(deltaX) > DRAG_CANCEL_CLICK_THRESHOLD_PX && Math.abs(deltaX) > Math.abs(deltaY)) {
      hasDraggedRef.current = true;
    }
  }, []);

  const handlePointerEnd = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (dragStartXRef.current === null || dragStartYRef.current === null) {
        scheduleAutoplayResume();
        return;
      }

      const deltaX = event.clientX - dragStartXRef.current;
      const deltaY = event.clientY - dragStartYRef.current;
      dragStartXRef.current = null;
      dragStartYRef.current = null;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      if (Math.abs(deltaX) >= DRAG_SWIPE_THRESHOLD_PX && Math.abs(deltaX) > Math.abs(deltaY)) {
        hasDraggedRef.current = true;
        cycle(deltaX < 0 ? 'right' : 'left');
      }

      scheduleAutoplayResume();
    },
    [cycle, scheduleAutoplayResume]
  );

  const handlePointerCancel = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      dragStartXRef.current = null;
      dragStartYRef.current = null;

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      scheduleAutoplayResume();
    },
    [scheduleAutoplayResume]
  );

  const handleWheel = useCallback(
    (event: WheelEvent<HTMLDivElement>) => {
      if (!needsPagination || isAnimatingRef.current || isWheelCoolingDownRef.current) {
        return;
      }

      const horizontalDelta =
        Math.abs(event.deltaX) >= Math.abs(event.deltaY)
          ? event.deltaX
          : event.shiftKey
            ? event.deltaY
            : 0;

      if (Math.abs(horizontalDelta) < WHEEL_SWIPE_THRESHOLD_PX) {
        return;
      }

      event.preventDefault();
      pauseAutoplay();
      isWheelCoolingDownRef.current = true;
      cycle(horizontalDelta > 0 ? 'right' : 'left');

      wheelCooldownTimerRef.current = setTimeout(() => {
        isWheelCoolingDownRef.current = false;
        scheduleAutoplayResume();
        wheelCooldownTimerRef.current = null;
      }, WHEEL_COOLDOWN_MS);
    },
    [cycle, needsPagination, pauseAutoplay, scheduleAutoplayResume]
  );

  if (!totalCards) {
    return null;
  }

  return (
    <div
      ref={carouselRootRef}
      className={cn(
        `
        relative z-20 flex w-full flex-col items-center py-0 select-none
        sm:py-1
      `,
        className
      )}
    >
      {/* Cards and navigation arrows wrapper */}
      <div className='relative w-full'>
        {/* Full-width cards container with left & right gradient masking ("tembus ke dinding tapi kena clip") */}
        <div
          className='
            relative flex w-full items-center justify-center overflow-hidden
            pt-5 pb-1
            sm:pt-6 sm:pb-2
            md:pt-7
          '
          style={{
            maskImage:
              'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)'
          }}
        >
          <div
            ref={containerRef}
            data-fan-layout
            className='
              relative flex h-[19.5rem] w-full cursor-grab touch-pan-y
              items-center justify-center overflow-visible
              active:cursor-grabbing
              sm:h-[22.5rem]
              md:h-[24.5rem]
              lg:h-[27rem]
              xl:h-[29rem]
            '
            onPointerCancel={handlePointerCancel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onWheel={handleWheel}
          >
            {cards.map((card, index) => {
              const image = (
                <div
                  className='
                  relative size-full overflow-hidden rounded-2xl bg-muted
                  shadow-xl ring-1 ring-black/10
                  md:rounded-3xl md:shadow-2xl
                  dark:ring-white/10
                '
                >
                  <Image
                    src={card.imgUrl}
                    alt={card.alt || `Dokumentasi Amanah ${index + 1}`}
                    fill
                    sizes='(max-width: 640px) 240px, (max-width: 1024px) 300px, 360px'
                    className='
                      pointer-events-none object-cover transition-transform
                      duration-500 select-none
                      hover:scale-105
                    '
                    priority={index < 4}
                  />
                  <div
                    className='
                    pointer-events-none absolute inset-0 bg-linear-to-t
                    from-black/50 via-transparent to-transparent opacity-30
                  '
                  />
                </div>
              );

              const cardClasses =
                'absolute h-[15.5rem] w-[11rem] cursor-pointer rounded-2xl will-change-transform sm:h-[18.5rem] sm:w-[13.25rem] md:h-[20.5rem] md:w-[14.75rem] md:rounded-3xl lg:h-[22.5rem] lg:w-[16.25rem]';

              return card.linkUrl ? (
                <a
                  key={card.imgUrl}
                  data-fan-card
                  href={card.linkUrl}
                  target={card.linkUrl.startsWith('http') ? '_blank' : '_self'}
                  rel='noopener noreferrer'
                  draggable={false}
                  onClick={(event) => {
                    if (hasDraggedRef.current) {
                      event.preventDefault();
                      hasDraggedRef.current = false;
                    }
                  }}
                  className={cn(cardClasses, 'block')}
                >
                  {image}
                </a>
              ) : (
                <div
                  key={card.imgUrl}
                  data-fan-card
                  onClick={() => handleCardClick(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleCardClick(index);
                    }
                  }}
                  role='button'
                  tabIndex={0}
                  className={cardClasses}
                >
                  {image}
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation arrows centered on the cards */}
        {needsPagination && (
          <div
            className='
              pointer-events-none absolute inset-x-4 top-1/2 z-40 flex
              -translate-y-1/2 items-center justify-between
              sm:inset-x-8
              lg:inset-x-14
            '
          >
            <button
              type='button'
              className={ARROW_CLASSES}
              onClick={() => cycle('left')}
              aria-label='Dokumentasi sebelumnya'
            >
              <ChevronLeft
                className='
                  size-5 transition-transform
                  group-hover:-translate-x-0.5
                '
              />
            </button>

            <button
              type='button'
              className={ARROW_CLASSES}
              onClick={() => cycle('right')}
              aria-label='Dokumentasi selanjutnya'
            >
              <ChevronRight
                className='
                  size-5 transition-transform
                  group-hover:translate-x-0.5
                '
              />
            </button>
          </div>
        )}
      </div>

      {/* Pagination indicators placed below the cards container */}
      {needsPagination && (
        <div
          className='
          mt-1 flex w-full justify-center px-4
          sm:mt-2
          md:mt-3
        '
        >
          <div
            ref={paginationScrollerRef}
            className='
              flex max-w-[min(480px,calc(100vw-2rem))] items-center gap-1.5
              overflow-x-auto rounded-full border border-line/70 bg-card/90
              px-3.5 py-1.5 shadow-xs backdrop-blur-md scrollbar-none
              dark:border-line/50 dark:bg-card/80
            '
          >
            {cards.map((card, i) => (
              <button
                key={`dot-${card.imgUrl}`}
                ref={i === centerIndex ? activeDotRef : null}
                type='button'
                onClick={() => goToCard(i)}
                aria-label={`Lihat dokumentasi ke-${i + 1}`}
                className='
                  flex h-5 shrink-0 cursor-pointer items-center
                  justify-center p-0.5
                  focus:outline-none
                '
              >
                <span
                  className={cn(
                    'block h-1.5 rounded-full transition-all duration-300',
                    i === centerIndex
                      ? 'w-7 bg-primary shadow-xs'
                      : `
                        size-1.5 bg-foreground/35
                        hover:bg-foreground/75
                      `
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { CardFanCarousel as SocialCards };
export default CardFanCarousel;
