'use client';

import type { CSSProperties } from 'react';
import type { HealthcareTeamMember } from '../types';
import Image from 'next/image';
import Link from 'next/link';
import {
  AmanahScriptText,
  HealthcareHeading,
  PixelMeshBackground
} from '@/features/public-site/components/shared';
import { cn } from '@/features/public-site/lib/helpers';

type TeamCardProps = {
  className?: string;
  member: HealthcareTeamMember;
  priority?: boolean;
  showLeftRail?: boolean;
  showRightRail?: boolean;
};

const hatchedRailStyle = {
  backgroundImage: `
    repeating-linear-gradient(
      135deg,
      var(--line) 0 1.5px,
      transparent 1.5px 8px
    )
  `
} satisfies CSSProperties;

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
      aria-hidden='true'
    >
      <path d='M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z' />
      <rect width='4' height='12' x='2' y='9' />
      <circle cx='4' cy='4' r='2' />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
      aria-hidden='true'
    >
      <rect width='20' height='20' x='2' y='2' rx='5' ry='5' />
      <path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' />
      <line x1='17.5' x2='17.51' y1='6.5' y2='6.5' />
    </svg>
  );
}

export function TeamCard({
  className,
  member,
  priority = false,
  showLeftRail = false,
  showRightRail = false
}: TeamCardProps) {
  const showSocials = member.showSocials ?? true;
  const instagramUrl = member.socials?.instagram ?? member.instagramUrl;
  const linkedinUrl = member.socials?.linkedin ?? member.linkedinUrl;
  const hasSocials = showSocials && Boolean(instagramUrl || linkedinUrl);

  return (
    <article
      className={cn(
        `
          relative flex h-full flex-col overflow-hidden bg-background
          text-foreground
        `,
        showLeftRail &&
          `
          pl-2.5
          sm:pl-6
          md:pl-8
        `,
        showRightRail &&
          `
          border-r border-line pr-2.5
          sm:pr-6
          md:pr-8
        `,
        className
      )}
    >
      {showLeftRail && (
        <span
          aria-hidden
          className='
            absolute inset-y-0 left-0 z-10 w-2.5 border-r border-line opacity-70
            sm:w-6
            md:w-8
          '
          style={hatchedRailStyle}
        />
      )}
      {showRightRail && (
        <span
          aria-hidden
          className='
            absolute inset-y-0 right-0 z-10 w-2.5 border-l border-line
            opacity-70
            sm:w-6
            md:w-8
          '
          style={hatchedRailStyle}
        />
      )}

      <div
        className='
        relative px-3.5 py-3
        min-[380px]:px-4
        sm:px-5 sm:pt-6 sm:pb-5
        md:px-8 md:pt-8 md:pb-6
      '
      >
        <HealthcareHeading
          as='h3'
          size='card'
          className='
            line-clamp-2 max-w-72 text-sm/snug font-extrabold
            min-[380px]:text-base
            md:amanah-type-card-title
          '
        >
          {member.name}
        </HealthcareHeading>
        <AmanahScriptText
          size='inherit'
          className='
            mt-1 line-clamp-2 text-base font-medium text-amanah-muted
            min-[380px]:text-lg
            sm:mt-2 sm:text-xl
            md:text-2xl
          '
        >
          {member.role}
        </AmanahScriptText>
      </div>

      <div
        className='
          relative min-h-[150px] w-full flex-1 overflow-hidden bg-background
          min-[380px]:min-h-[175px]
          sm:min-h-[340px]
          md:min-h-[360px]
        '
      >
        {/* Pixelize animated texture with top masking blend towards header */}
        <div
          aria-hidden='true'
          className='
            pointer-events-none absolute inset-0 z-0 overflow-hidden select-none
          '
        >
          <PixelMeshBackground
            initialProgress={1}
            progress={1}
            maskGradient='linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.7) 40%, rgba(0, 0, 0, 0.2) 72%, transparent 92%)'
            className='
              size-full opacity-45
              dark:opacity-65
            '
          />
        </div>

        <Image
          src={member.image.src}
          alt={member.image.alt}
          fill
          priority={priority}
          sizes='(min-width: 1200px) 292px, (min-width: 860px) 33vw, 50vw'
          className='z-1 object-contain object-bottom'
        />

        {hasSocials && (
          <div
            className='
            absolute right-2.5 bottom-2.5 z-10 flex gap-2
            sm:right-4 sm:bottom-4 sm:gap-2.5
            md:right-5 md:bottom-5
          '
          >
            {linkedinUrl && (
              <Link
                href={linkedinUrl}
                target='_blank'
                rel='noopener noreferrer'
                aria-label={`LinkedIn ${member.name}`}
                className='
                  inline-flex size-9 items-center justify-center rounded-lg
                  bg-primary text-primary-foreground shadow-2xs transition-all
                  hover:scale-110 hover:bg-amanah-blue hover:shadow-xs
                  sm:size-10 sm:rounded-xl
                  md:size-11
                '
              >
                <LinkedinIcon
                  className='
                  size-4.5
                  sm:size-5
                  md:size-5.5
                '
                />
              </Link>
            )}
            {instagramUrl && (
              <Link
                href={instagramUrl}
                target='_blank'
                rel='noopener noreferrer'
                aria-label={`Instagram ${member.name}`}
                className='
                  inline-flex size-9 items-center justify-center rounded-lg
                  bg-primary text-primary-foreground shadow-2xs transition-all
                  hover:scale-110 hover:bg-amanah-blue hover:shadow-xs
                  sm:size-10 sm:rounded-xl
                  md:size-11
                '
              >
                <InstagramIcon
                  className='
                  size-4.5
                  sm:size-5
                  md:size-5.5
                '
                />
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
