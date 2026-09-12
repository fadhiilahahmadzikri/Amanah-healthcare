'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useRef, useState } from 'react';
import {
  HealthcareHeading,
  HealthcareText,
  PixelIcon,
  type PixelIconName
} from '@/features/public-site/components/shared';
import { cn } from '@/features/public-site/lib/helpers';

gsap.registerPlugin(ScrollTrigger);

type PrincipleId = 'aman' | 'cepat' | 'peduli' | 'profesional' | 'ramah' | 'terpercaya';
type RevealDirection = -1 | 1;

type AbsoluteBox = {
  height: number;
  left: number;
  top: number;
  width: number;
};

type BrickRow = {
  index: number;
  lefts: number[];
  top: number;
};

type BrickCell = {
  box: AbsoluteBox;
  buildOrder: number;
  key: string;
  principleId?: PrincipleId;
  row: number;
};

type PrincipleBrick = {
  badgeClass: string;
  box: AbsoluteBox;
  description: string;
  icon: ReactNode;
  id: PrincipleId;
  imageSrc: string;
  revealDirection: RevealDirection;
  ringClass: string;
  row: number;
  title: string;
};

const STAGE_BOX: AbsoluteBox = {
  height: 720,
  left: 0,
  top: 0,
  width: 1040
};

const BRICK_WIDTH = 340;
const BRICK_HEIGHT = 160;
const OPEN_DISTANCE = BRICK_WIDTH;
const BASE_BRICK_Z_INDEX = 20;
const ROW_Z_INDEX_STEP = 2;
const SHIFTED_BRICK_Z_INDEX = 70;
const ACTIVE_BRICK_Z_INDEX = 80;
const ROW_1_TOP = 20;
const ROW_2_TOP = ROW_1_TOP + BRICK_HEIGHT;
const ROW_3_TOP = ROW_2_TOP + BRICK_HEIGHT;
const ROW_4_TOP = ROW_3_TOP + BRICK_HEIGHT;

const BRICK_ROWS: BrickRow[] = [
  {
    index: 0,
    lefts: [-670, -330, 10, 350, 690, 1030, 1370],
    top: ROW_1_TOP
  },
  {
    index: 1,
    lefts: [-500, -160, 180, 520, 860, 1200],
    top: ROW_2_TOP
  },
  {
    index: 2,
    lefts: [-500, -160, 180, 520, 860, 1200],
    top: ROW_3_TOP
  },
  {
    index: 3,
    lefts: [-670, -330, 10, 350, 690, 1030, 1370],
    top: ROW_4_TOP
  }
];

const PRINCIPLES: PrincipleBrick[] = [
  {
    badgeClass: 'bg-amanah-mint text-white',
    box: createBrickBox(350, ROW_1_TOP),
    description: 'Pelayanan hangat dan tulus dengan senyuman sepenuh hati.',
    icon: <PixelHeartIcon />,
    id: 'ramah',
    imageSrc: '/healthcare/assets/images/about-blocks/about-us-ramah.webp',
    revealDirection: 1,
    ringClass: 'ring-amanah-mint/40',
    row: 0,
    title: 'Ramah'
  },
  {
    badgeClass: 'bg-amanah-blue text-white',
    box: createBrickBox(180, ROW_2_TOP),
    description: 'Ditangani dokter dan tenaga medis berlisensi serta berpengalaman.',
    icon: <PixelShieldIcon />,
    id: 'profesional',
    imageSrc: '/healthcare/assets/images/about-blocks/about-us-professionl.webp',
    revealDirection: -1,
    ringClass: 'ring-amanah-blue/40',
    row: 1,
    title: 'Profesional'
  },
  {
    badgeClass: 'bg-amanah-sky text-white',
    box: createBrickBox(520, ROW_2_TOP),
    description: 'Penanganan sigap, sistematis, dan efisien tanpa antre lama.',
    icon: <PixelBoltIcon />,
    id: 'cepat',
    imageSrc: '/healthcare/assets/images/about-blocks/about-us-cepat.webp',
    revealDirection: 1,
    ringClass: 'ring-amanah-sky/40',
    row: 1,
    title: 'Cepat'
  },
  {
    badgeClass: 'bg-amanah-mint text-white',
    box: createBrickBox(180, ROW_3_TOP),
    description: 'Standar medis higienis, steril, aman, dan nyaman untuk pasien.',
    icon: <PixelShieldSecurityIcon />,
    id: 'aman',
    imageSrc: '/healthcare/assets/images/about-blocks/about-us-aman.webp',
    revealDirection: -1,
    ringClass: 'ring-amanah-mint/40',
    row: 2,
    title: 'Aman'
  },
  {
    badgeClass: 'bg-amanah-blue text-white',
    box: createBrickBox(520, ROW_3_TOP),
    description: 'Pelayanan jujur, transparan, teruji, dan bertanggung jawab.',
    icon: <PixelCheckIcon />,
    id: 'terpercaya',
    imageSrc: '/healthcare/assets/images/about-blocks/about-us-terpercaya.webp',
    revealDirection: 1,
    ringClass: 'ring-amanah-blue/40',
    row: 2,
    title: 'Terpercaya'
  },
  {
    badgeClass: 'bg-amanah-sky text-white',
    box: createBrickBox(350, ROW_4_TOP),
    description: 'Mendengarkan dan merawat kebutuhan setiap pasien secara personal.',
    icon: <PixelCareIcon />,
    id: 'peduli',
    imageSrc: '/healthcare/assets/images/about-blocks/about-us-perduli.webp',
    revealDirection: 1,
    ringClass: 'ring-amanah-sky/40',
    row: 3,
    title: 'Peduli'
  }
];

const PRINCIPLES_BY_ID = PRINCIPLES.reduce<Record<PrincipleId, PrincipleBrick>>(
  (principles, principle) => {
    principles[principle.id] = principle;
    return principles;
  },
  {} as Record<PrincipleId, PrincipleBrick>
);

const PRINCIPLE_ID_BY_POSITION = new Map(
  PRINCIPLES.map((principle) => [getPositionKey(principle.row, principle.box.left), principle.id])
);

const WALL_CELLS = BRICK_ROWS.flatMap((row) =>
  row.lefts.map((left, column) => ({
    box: createBrickBox(left, row.top),
    buildOrder: getBuildOrder(row.index, column),
    key: getPositionKey(row.index, left),
    principleId: PRINCIPLE_ID_BY_POSITION.get(getPositionKey(row.index, left)),
    row: row.index
  }))
);

const WALL_POSITION_KEYS = new Set(
  WALL_CELLS.map((cell) => getPositionKey(cell.row, cell.box.left))
);

const principleHeaderPixelIcons = [
  { name: 'stetoskop', title: 'Stetoskop Medis' },
  { name: 'jantung', title: 'Jantung Kasih' },
  { name: 'p3k', title: 'Kotak P3K Medis' }
] as const satisfies readonly { name: PixelIconName; title: string }[];

type StackedBlocksSectionProps = {
  className?: string;
};

export function StackedBlocksSection({ className }: StackedBlocksSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [hoveredCard, setHoveredCard] = useState<PrincipleId | null>(null);
  const activePrinciple = hoveredCard ? PRINCIPLES_BY_ID[hoveredCard] : null;

  useGSAP(
    () => {
      if (!sectionRef.current) {
        return;
      }

      const section = sectionRef.current;
      const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // 1. Header pixel icons animation
      const iconItems = section.querySelectorAll('[data-header-icon]');
      if (iconItems.length > 0) {
        if (isReducedMotion) {
          gsap.fromTo(
            iconItems,
            { opacity: 0 },
            {
              duration: 0.35,
              opacity: 1,
              scrollTrigger: {
                start: 'top 88%',
                toggleActions: 'play none none reverse',
                trigger: section
              }
            }
          );
        } else {
          gsap.fromTo(
            iconItems,
            { opacity: 0, scale: 0.35, y: 18 },
            {
              duration: 0.7,
              ease: 'back.out(2)',
              opacity: 1,
              scale: 1,
              scrollTrigger: {
                start: 'top 85%',
                toggleActions: 'play none none reverse',
                trigger: section
              },
              stagger: 0.12,
              y: 0
            }
          );
        }
      }

      // 2. Heading mask lines
      const headingLines = section.querySelectorAll('[data-mask-text]');
      if (headingLines.length > 0) {
        if (isReducedMotion) {
          gsap.fromTo(
            headingLines,
            { opacity: 0 },
            {
              duration: 0.35,
              opacity: 1,
              scrollTrigger: {
                start: 'top 88%',
                toggleActions: 'play none none reverse',
                trigger: section
              }
            }
          );
        } else {
          gsap.fromTo(
            headingLines,
            { opacity: 0, yPercent: 120 },
            {
              duration: 1.2,
              ease: 'expo.out',
              opacity: 1,
              scrollTrigger: {
                start: 'top 88%',
                toggleActions: 'play none none reverse',
                trigger: section
              },
              stagger: 0.1,
              yPercent: 0
            }
          );
        }
      }

      // 3. Mobile alternating cards animation
      const mobileCards = section.querySelectorAll('[data-mobile-principle]');
      if (mobileCards.length > 0) {
        if (isReducedMotion) {
          gsap.fromTo(
            mobileCards,
            { opacity: 0 },
            {
              duration: 0.35,
              opacity: 1,
              scrollTrigger: {
                start: 'top 85%',
                toggleActions: 'play none none reverse',
                trigger: mobileCards[0] ?? section
              }
            }
          );
        } else {
          gsap.fromTo(
            mobileCards,
            { opacity: 0, y: 24 },
            {
              duration: 0.75,
              ease: 'expo.out',
              opacity: 1,
              scrollTrigger: {
                start: 'top 85%',
                toggleActions: 'play none none reverse',
                trigger: mobileCards[0] ?? section
              },
              stagger: 0.1,
              y: 0
            }
          );
        }
      }

      // 4. Desktop Brick pieces animation
      const brickPieces = getOrderedBrickPieces(section);
      if (brickPieces.length === 0) {
        return;
      }

      const brickAnimationTrigger = {
        start: 'top 82%',
        toggleActions: 'play none none reverse',
        trigger: section
      };

      if (isReducedMotion) {
        gsap.fromTo(
          brickPieces,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.35,
            ease: 'power2.out',
            scrollTrigger: brickAnimationTrigger,
            stagger: 0.045
          }
        );
        return;
      }

      gsap.fromTo(
        brickPieces,
        {
          autoAlpha: 0,
          y: 56
        },
        {
          autoAlpha: 1,
          duration: 0.75,
          ease: 'expo.out',
          scrollTrigger: brickAnimationTrigger,
          stagger: 0.045,
          y: 0
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      aria-label='Prinsip klinik amanah healthcare'
      className={cn(
        `
          relative w-full overflow-hidden bg-background py-14 text-foreground
          select-none
          sm:py-20
          md:py-28
        `,
        className
      )}
    >
      <div
        className='
          pointer-events-none absolute inset-0 hidden items-center
          justify-center opacity-40
          dark:flex
        '
        aria-hidden='true'
      >
        <div
          className='
          h-[520px] w-[820px] rounded-full bg-amanah-blue/15 blur-[150px]
        '
        />
        <div
          className='
          h-[400px] w-[600px] -translate-y-20 rounded-full bg-amanah-sky/10
          blur-[130px]
        '
        />
      </div>

      <div
        className='
        relative mx-auto mb-10 max-w-4xl px-4 text-center
        sm:mb-14
        md:mb-16
      '
      >
        {/* Header Pixel Icons */}
        <div
          data-header-icons
          className='
            mb-3.5 flex items-center justify-center gap-3
            sm:gap-4
            select-none
          '
          aria-hidden
        >
          {principleHeaderPixelIcons.map((icon) => (
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

        <div className='-mb-2 overflow-hidden pb-2'>
          <HealthcareHeading
            as='h2'
            data-mask-text
            size='section'
            className='
              inline-block font-medium text-foreground will-change-transform
            '
          >
            Prinsip klinik amanah healthcare
          </HealthcareHeading>
        </div>
      </div>

      {/* Mobile View: Vertical order with alternating horizontal cards, always open without hover */}
      <div className='mx-auto flex w-full max-w-lg flex-col gap-3.5 px-4 md:hidden'>
        {PRINCIPLES.map((principle, index) => (
          <MobilePrincipleCard
            key={principle.id}
            principle={principle}
            isImageLeft={index % 2 === 0}
          />
        ))}
      </div>

      {/* Desktop View: Interactive 3D Brick Wall with hover reveal */}
      <div
        className='
          relative mx-auto hidden h-[360px] w-full max-w-[1360px] items-center
          justify-center px-4
          md:flex md:h-[620px]
          lg:h-[720px]
          xl:h-[780px]
          2xl:h-[820px]
        '
      >
        <div
          className='
            relative h-[720px] w-[1040px] shrink-0 origin-center scale-[0.78]
            transition-transform duration-300
            lg:scale-[0.98]
            xl:scale-[1.10]
            2xl:scale-[1.18]
          '
          style={getBoxStyle(STAGE_BOX)}
        >
          {PRINCIPLES.map((principle) => (
            <PrincipleImagePreview
              key={`image-${principle.id}`}
              isHovered={hoveredCard === principle.id}
              onHoverEnd={() => setHoveredCard(null)}
              onHoverStart={() => setHoveredCard(principle.id)}
              principle={principle}
            />
          ))}

          {WALL_CELLS.map((cell) => (
            <BrickWallCell
              activePrinciple={activePrinciple}
              cell={cell}
              key={cell.key}
              onHoverEnd={() => setHoveredCard(null)}
              onHoverStart={setHoveredCard}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function MobilePrincipleCard({
  isImageLeft,
  principle
}: {
  isImageLeft: boolean;
  principle: PrincipleBrick;
}) {
  return (
    <article
      data-mobile-principle
      className={cn(
        'group relative flex w-full items-stretch overflow-hidden border border-line bg-card shadow-2xs transition-colors hover:border-primary/40',
        isImageLeft ? 'flex-row' : 'flex-row-reverse'
      )}
    >
      {/* Image half with seamless mask fade into the adjacent text container */}
      <div
        className='relative min-h-[140px] w-[42%] shrink-0 overflow-hidden select-none'
        style={{
          maskImage: isImageLeft
            ? 'linear-gradient(to right, black 0%, black 40%, rgba(0, 0, 0, 0.6) 70%, transparent 100%)'
            : 'linear-gradient(to left, black 0%, black 40%, rgba(0, 0, 0, 0.6) 70%, transparent 100%)',
          WebkitMaskImage: isImageLeft
            ? 'linear-gradient(to right, black 0%, black 40%, rgba(0, 0, 0, 0.6) 70%, transparent 100%)'
            : 'linear-gradient(to left, black 0%, black 40%, rgba(0, 0, 0, 0.6) 70%, transparent 100%)'
        }}
      >
        <Image
          src={principle.imageSrc}
          alt={principle.title}
          fill
          sizes='(max-width: 768px) 45vw, 220px'
          className='object-cover object-center brightness-95 contrast-105 transition-transform duration-500 group-hover:scale-105'
        />
        {/* Soft edge blend gradient */}
        <div
          aria-hidden='true'
          className={cn(
            'pointer-events-none absolute inset-0',
            isImageLeft
              ? 'bg-linear-to-r from-transparent via-transparent to-card/90'
              : 'bg-linear-to-l from-transparent via-transparent to-card/90'
          )}
        />
        <div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 bg-linear-to-t from-card/60 via-transparent to-transparent'
        />
      </div>

      {/* Content half */}
      <div className='flex flex-1 flex-col justify-between p-3.5 sm:p-4'>
        <div>
          <div className='mb-2 flex items-center gap-2'>
            <PixelBadge bgClass={principle.badgeClass}>{principle.icon}</PixelBadge>
            <HealthcareHeading as='h3' size='card' className='font-medium text-card-foreground'>
              {principle.title}
            </HealthcareHeading>
          </div>
          <HealthcareText
            size='caption'
            className='text-xs leading-relaxed text-muted-foreground sm:text-sm'
          >
            {principle.description}
          </HealthcareText>
        </div>
      </div>
    </article>
  );
}

function BrickWallCell({
  activePrinciple,
  cell,
  onHoverEnd,
  onHoverStart
}: {
  activePrinciple: PrincipleBrick | null;
  cell: BrickCell;
  onHoverEnd: () => void;
  onHoverStart: (id: PrincipleId) => void;
}) {
  const offsetX = getCellOffsetX(cell, activePrinciple);
  const zIndex = getCellZIndex(cell, activePrinciple);

  if (!cell.principleId) {
    return <PlaceholderBrick cell={cell} offsetX={offsetX} zIndex={zIndex} />;
  }

  const principle = PRINCIPLES_BY_ID[cell.principleId];

  return (
    <PrincipleCard
      cell={cell}
      isHovered={activePrinciple?.id === principle.id}
      offsetX={offsetX}
      onHoverEnd={onHoverEnd}
      onHoverStart={() => onHoverStart(principle.id)}
      principle={principle}
      zIndex={zIndex}
    />
  );
}

function PlaceholderBrick({
  cell,
  offsetX,
  zIndex
}: {
  cell: BrickCell;
  offsetX: number;
  zIndex: number;
}) {
  return (
    <div
      aria-hidden='true'
      data-brick-piece
      data-build-order={cell.buildOrder}
      className='absolute overflow-visible will-change-transform'
      style={getLayeredBoxStyle(cell.box, zIndex)}
    >
      <div
        className={cn(
          `
            size-full rounded-none bg-card transition-transform duration-300
            ease-out will-change-transform
          `,
          getCollapsedBorderClass(cell)
        )}
        style={getOffsetStyle(offsetX)}
      />
    </div>
  );
}

function PrincipleImagePreview({
  isHovered,
  onHoverEnd,
  onHoverStart,
  principle
}: {
  isHovered: boolean;
  onHoverEnd: () => void;
  onHoverStart: () => void;
  principle: PrincipleBrick;
}) {
  return (
    <div
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      className={cn(
        `
          absolute z-30 overflow-hidden rounded-none border border-border
          bg-card transition-opacity duration-200
        `,
        isHovered ? cn('opacity-100 ring-1', principle.ringClass) : `pointer-events-none opacity-0`
      )}
      style={getBoxStyle(principle.box)}
      aria-hidden='true'
    >
      <Image
        src={principle.imageSrc}
        alt=''
        fill
        sizes='340px'
        className='object-cover object-center brightness-95 contrast-105'
      />
      <div
        className='
        absolute inset-0 bg-linear-to-t from-background/80 via-background/20
        to-transparent
      '
      />
    </div>
  );
}

function PrincipleCard({
  cell,
  isHovered,
  offsetX,
  onHoverEnd,
  onHoverStart,
  principle,
  zIndex
}: {
  cell: BrickCell;
  isHovered: boolean;
  offsetX: number;
  onHoverEnd: () => void;
  onHoverStart: () => void;
  principle: PrincipleBrick;
  zIndex: number;
}) {
  return (
    <div
      onBlur={onHoverEnd}
      onFocus={onHoverStart}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      tabIndex={0}
      role='button'
      aria-label={principle.title}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onHoverStart();
        }
      }}
      data-brick-piece
      data-build-order={cell.buildOrder}
      className='
        group absolute overflow-visible will-change-transform
        focus-visible:outline-none
      '
      style={getLayeredBoxStyle(principle.box, zIndex)}
    >
      <div
        className={cn(
          `
            flex size-full cursor-pointer flex-col justify-between rounded-none
            bg-card p-6 transition-transform duration-300 ease-out
            will-change-transform
            group-focus-visible:ring-1 group-focus-visible:ring-ring
          `,
          getCollapsedBorderClass(cell),
          isHovered && cn('border-primary/50 ring-1', principle.ringClass)
        )}
        style={getOffsetStyle(offsetX)}
      >
        <PixelBadge bgClass={principle.badgeClass}>{principle.icon}</PixelBadge>

        <div>
          <HealthcareHeading as='h3' size='card' className='font-medium text-card-foreground'>
            {principle.title}
          </HealthcareHeading>
          <HealthcareText size='caption' className='mt-1.5 text-muted-foreground'>
            {principle.description}
          </HealthcareText>
        </div>
      </div>
    </div>
  );
}

function PixelBadge({ bgClass, children }: { bgClass: string; children: ReactNode }) {
  return (
    <div
      aria-hidden='true'
      className={cn('flex size-7 items-center justify-center rounded-none select-none', bgClass)}
    >
      {children}
    </div>
  );
}

function PixelHeartIcon() {
  return (
    <svg
      width='14'
      height='14'
      viewBox='0 0 7 7'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='[image-rendering:pixelated]'
    >
      <rect x='1' y='1' width='2' height='1' fill='white' />
      <rect x='4' y='1' width='2' height='1' fill='white' />
      <rect x='0' y='2' width='7' height='2' fill='white' />
      <rect x='1' y='4' width='5' height='1' fill='white' />
      <rect x='2' y='5' width='3' height='1' fill='white' />
      <rect x='3' y='6' width='1' height='1' fill='white' />
    </svg>
  );
}

function PixelShieldIcon() {
  return (
    <svg
      width='14'
      height='14'
      viewBox='0 0 7 7'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='text-amanah-blue [image-rendering:pixelated]'
    >
      <rect x='1' y='1' width='5' height='4' fill='white' />
      <rect x='2' y='5' width='3' height='1' fill='white' />
      <rect x='3' y='6' width='1' height='1' fill='white' />
      <rect x='3' y='2' width='1' height='2' fill='currentColor' />
      <rect x='2' y='2' width='3' height='1' fill='currentColor' />
    </svg>
  );
}

function PixelBoltIcon() {
  return (
    <svg
      width='14'
      height='14'
      viewBox='0 0 7 7'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='[image-rendering:pixelated]'
    >
      <rect x='3' y='0' width='2' height='2' fill='white' />
      <rect x='2' y='2' width='3' height='1' fill='white' />
      <rect x='1' y='3' width='5' height='1' fill='white' />
      <rect x='2' y='4' width='2' height='1' fill='white' />
      <rect x='1' y='5' width='2' height='1' fill='white' />
      <rect x='1' y='6' width='1' height='1' fill='white' />
    </svg>
  );
}

function PixelShieldSecurityIcon() {
  return (
    <svg
      width='14'
      height='14'
      viewBox='0 0 7 7'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='text-amanah-mint [image-rendering:pixelated]'
    >
      <rect x='2' y='1' width='3' height='2' fill='white' />
      <rect x='3' y='2' width='1' height='1' fill='currentColor' />
      <rect x='1' y='3' width='5' height='3' fill='white' />
      <rect x='3' y='4' width='1' height='1' fill='currentColor' />
    </svg>
  );
}

function PixelCheckIcon() {
  return (
    <svg
      width='14'
      height='14'
      viewBox='0 0 7 7'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='[image-rendering:pixelated]'
    >
      <rect x='5' y='1' width='1' height='2' fill='white' />
      <rect x='4' y='3' width='1' height='2' fill='white' />
      <rect x='1' y='3' width='1' height='2' fill='white' />
      <rect x='2' y='4' width='1' height='2' fill='white' />
      <rect x='3' y='5' width='1' height='1' fill='white' />
    </svg>
  );
}

function PixelCareIcon() {
  return (
    <svg
      width='14'
      height='14'
      viewBox='0 0 7 7'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='[image-rendering:pixelated]'
    >
      <rect x='1' y='1' width='2' height='2' fill='white' />
      <rect x='4' y='1' width='2' height='2' fill='white' />
      <rect x='0' y='3' width='7' height='1' fill='white' />
      <rect x='1' y='4' width='5' height='1' fill='white' />
      <rect x='2' y='5' width='3' height='1' fill='white' />
      <rect x='3' y='6' width='1' height='1' fill='white' />
    </svg>
  );
}

function createBrickBox(left: number, top: number): AbsoluteBox {
  return {
    height: BRICK_HEIGHT,
    left,
    top,
    width: BRICK_WIDTH
  };
}

function getPositionKey(row: number, left: number): string {
  return `${row}:${left}`;
}

function getBuildOrder(row: number, column: number): number {
  return (BRICK_ROWS.length - 1 - row) * 10 + column;
}

function getCellOffsetX(cell: BrickCell, activePrinciple: PrincipleBrick | null): number {
  if (!activePrinciple || cell.row !== activePrinciple.row) {
    return 0;
  }

  if (cell.principleId === activePrinciple.id) {
    return activePrinciple.revealDirection * OPEN_DISTANCE;
  }

  if (activePrinciple.revealDirection === 1 && cell.box.left > activePrinciple.box.left) {
    return OPEN_DISTANCE;
  }

  if (activePrinciple.revealDirection === -1 && cell.box.left < activePrinciple.box.left) {
    return -OPEN_DISTANCE;
  }

  return 0;
}

function getCellZIndex(cell: BrickCell, activePrinciple: PrincipleBrick | null): number {
  if (!activePrinciple || cell.row !== activePrinciple.row) {
    return getRestingBrickZIndex(cell.row);
  }

  if (cell.principleId === activePrinciple.id) {
    return ACTIVE_BRICK_Z_INDEX;
  }

  if (getCellOffsetX(cell, activePrinciple) !== 0) {
    return SHIFTED_BRICK_Z_INDEX;
  }

  return getRestingBrickZIndex(cell.row);
}

function getRestingBrickZIndex(row: number): number {
  return BASE_BRICK_Z_INDEX + (BRICK_ROWS.length - row) * ROW_Z_INDEX_STEP;
}

function getCollapsedBorderClass(cell: BrickCell): string {
  return cn(
    'border-t border-l border-border',
    !hasHorizontalNeighbor(cell, 1) && 'border-r',
    cell.row === BRICK_ROWS.length - 1 && 'border-b'
  );
}

function hasHorizontalNeighbor(cell: BrickCell, direction: RevealDirection): boolean {
  return WALL_POSITION_KEYS.has(getPositionKey(cell.row, cell.box.left + direction * BRICK_WIDTH));
}

function getOrderedBrickPieces(section: HTMLElement): HTMLElement[] {
  return Array.from(section.querySelectorAll<HTMLElement>('[data-brick-piece]')).toSorted(
    (current, next) =>
      Number(current.dataset.buildOrder ?? 0) - Number(next.dataset.buildOrder ?? 0)
  );
}

function getBoxStyle(box: AbsoluteBox): CSSProperties {
  return {
    height: box.height,
    left: box.left,
    top: box.top,
    width: box.width
  };
}

function getLayeredBoxStyle(box: AbsoluteBox, zIndex: number): CSSProperties {
  return {
    ...getBoxStyle(box),
    zIndex
  };
}

function getOffsetStyle(offsetX: number): CSSProperties {
  return {
    transform: `translate3d(${offsetX}px, 0, 0)`
  };
}
