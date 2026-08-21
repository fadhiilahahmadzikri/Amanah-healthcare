'use client';

import React, { useId } from 'react';
import { getStatusConfig } from '@/styles/clinical-tokens';
import { cn } from '@/lib/utils';

export type StatusBadgeVariant = 'pill' | 'ribbon' | 'dot' | 'full';

export interface StatusBadgeProps {
  status: string;
  variant?: StatusBadgeVariant;
  size?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
  label?: string;
}

export function StatusBadge({
  status,
  variant = 'pill',
  size = 'md',
  className = '',
  label
}: StatusBadgeProps) {
  const clipId = useId();
  const config = getStatusConfig(status);
  const displayLabel = label || config.label;
  const normalizedStatus = status.toUpperCase().replace(/\s+/g, '_');

  // Full ribbon header variant (fills card header / width)
  if (variant === 'full' || size === 'full') {
    const width = 260;
    const height = 46;
    const slashWidth = 32;
    const bandOffset = 14;

    const ribbonColors: Record<string, { c1: string; c2: string; c3: string }> = {
      CONFIRMED: { c1: 'var(--success-border)', c2: 'var(--success)', c3: 'var(--success)' },
      PENDING: { c1: 'var(--warning-border)', c2: 'var(--warning)', c3: 'var(--warning)' },
      MENUNGGU: { c1: 'var(--warning-border)', c2: 'var(--warning)', c3: 'var(--warning)' },
      CHECKED_IN: {
        c1: 'var(--border-accent)',
        c2: 'var(--primary-bright)',
        c3: 'var(--primary-bright)'
      },
      DIPANGGIL: {
        c1: 'var(--border-accent)',
        c2: 'var(--primary-bright)',
        c3: 'var(--primary-bright)'
      },
      COMPLETED: {
        c1: 'var(--status-completed-border)',
        c2: 'var(--status-completed)',
        c3: 'var(--status-completed)'
      },
      SELESAI: {
        c1: 'var(--status-completed-border)',
        c2: 'var(--status-completed)',
        c3: 'var(--status-completed)'
      },
      CANCELLED: {
        c1: 'var(--destructive-border)',
        c2: 'var(--destructive)',
        c3: 'var(--destructive)'
      },
      BATAL: { c1: 'var(--destructive-border)', c2: 'var(--destructive)', c3: 'var(--destructive)' }
    };

    const colorSet = ribbonColors[normalizedStatus] || {
      c1: 'var(--border-subtle)',
      c2: 'var(--muted-foreground)',
      c3: 'var(--foreground)'
    };

    return (
      <div
        className={cn(
          'relative inline-flex items-center justify-end w-full h-full select-none overflow-hidden',
          className
        )}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          preserveAspectRatio='none'
          className='w-full h-full block'
        >
          {/* Layer 1: Soft accent band */}
          <polygon
            points={`0,${height} ${slashWidth},0 ${slashWidth + bandOffset},0 ${bandOffset},${height}`}
            fill={colorSet.c1}
          />
          {/* Layer 2: Mid accent band */}
          <polygon
            points={`${bandOffset},${height} ${slashWidth + bandOffset},0 ${slashWidth + bandOffset * 2},0 ${bandOffset * 2},${height}`}
            fill={colorSet.c2}
          />
          {/* Layer 3: Solid main body */}
          <polygon
            points={`${bandOffset * 2},${height} ${slashWidth + bandOffset * 2},0 ${width},0 ${width},${height}`}
            fill={colorSet.c3}
          />
          {/* Centered label */}
          <text
            x={165}
            y={height / 2 + 4.5}
            textAnchor='middle'
            fill='#ffffff'
            fontSize='12.5'
            fontWeight='700'
            fontFamily="'Plus Jakarta Sans', sans-serif"
            letterSpacing='0.01em'
          >
            {displayLabel.toLowerCase()}
          </text>
        </svg>
      </div>
    );
  }

  // Ribbon standalone pill variant
  if (variant === 'ribbon') {
    const h = size === 'lg' ? 32 : size === 'md' ? 28 : 26;
    const w = size === 'lg' ? 200 : size === 'md' ? 180 : 160;
    const slashWidth = 20;
    const bandOffset = 10;
    const solidStartX = (slashWidth + bandOffset * 2) * 0.7;
    const textCenterX = solidStartX + (w - solidStartX) / 2;

    const ribbonColors: Record<string, { c1: string; c2: string; c3: string }> = {
      CONFIRMED: { c1: 'var(--success-border)', c2: 'var(--success)', c3: 'var(--success)' },
      PENDING: { c1: 'var(--warning-border)', c2: 'var(--warning)', c3: 'var(--warning)' },
      MENUNGGU: { c1: 'var(--warning-border)', c2: 'var(--warning)', c3: 'var(--warning)' },
      CHECKED_IN: {
        c1: 'var(--border-accent)',
        c2: 'var(--primary-bright)',
        c3: 'var(--primary-bright)'
      },
      DIPANGGIL: {
        c1: 'var(--border-accent)',
        c2: 'var(--primary-bright)',
        c3: 'var(--primary-bright)'
      },
      COMPLETED: {
        c1: 'var(--status-completed-border)',
        c2: 'var(--status-completed)',
        c3: 'var(--status-completed)'
      },
      SELESAI: {
        c1: 'var(--status-completed-border)',
        c2: 'var(--status-completed)',
        c3: 'var(--status-completed)'
      },
      CANCELLED: {
        c1: 'var(--destructive-border)',
        c2: 'var(--destructive)',
        c3: 'var(--destructive)'
      },
      BATAL: { c1: 'var(--destructive-border)', c2: 'var(--destructive)', c3: 'var(--destructive)' }
    };

    const colorSet = ribbonColors[normalizedStatus] || {
      c1: 'var(--border-subtle)',
      c2: 'var(--muted-foreground)',
      c3: 'var(--foreground)'
    };

    return (
      <div
        className={cn(
          'inline-flex items-center select-none overflow-hidden rounded-md shadow-2xs',
          className
        )}
        style={{ height: `${h}px`, width: `${w}px` }}
      >
        <svg
          viewBox={`0 0 ${w} ${h}`}
          width={w}
          height={h}
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          className='block w-full h-full'
        >
          <defs>
            <clipPath id={clipId}>
              <rect x='0' y='0' width={w} height={h} rx={8} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>
            <polygon
              points={`0,${h} ${slashWidth},0 ${slashWidth + bandOffset},0 ${bandOffset},${h}`}
              fill={colorSet.c1}
            />
            <polygon
              points={`${bandOffset},${h} ${slashWidth + bandOffset},0 ${slashWidth + bandOffset * 2},0 ${bandOffset * 2},${h}`}
              fill={colorSet.c2}
            />
            <polygon
              points={`${bandOffset * 2},${h} ${slashWidth + bandOffset * 2},0 ${w},0 ${w},${h}`}
              fill={colorSet.c3}
            />
            <text
              x={textCenterX}
              y={h / 2 + 4}
              textAnchor='middle'
              fill='#ffffff'
              fontSize={size === 'lg' ? '12' : size === 'md' ? '11.5' : '11'}
              fontWeight='700'
              fontFamily="'Plus Jakarta Sans', sans-serif"
              letterSpacing='0.01em'
            >
              {displayLabel.toLowerCase()}
            </text>
          </g>
        </svg>
      </div>
    );
  }

  // Standard gradient pill badge (Gradient Pill, Gradient Font, Gradient Dot)
  const sizeClasses = {
    sm: 'text-[10.5px] px-2 py-0.5 gap-1',
    md: 'text-[11px] sm:text-[11.5px] px-2.5 py-1 gap-1.5',
    lg: 'text-xs sm:text-[13px] px-3.5 py-1.5 gap-2',
    full: 'text-[11.5px] px-2.5 py-1 gap-1.5'
  };

  const dotSizes = {
    sm: 'size-1.5',
    md: 'size-2',
    lg: 'size-2.5',
    full: 'size-2'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-bold border backdrop-blur-xs select-none tracking-tight transition-colors',
        sizeClasses[size] || sizeClasses.md,
        config.pillBg,
        config.pillBorder,
        config.pillShadow,
        className
      )}
    >
      <span
        className={cn(
          'rounded-full shrink-0 ring-1 ring-white/60 dark:ring-white/20',
          dotSizes[size] || dotSizes.md,
          config.dotGradient
        )}
      />
      <span
        className={cn('bg-clip-text text-transparent font-bold font-sans', config.textGradient)}
      >
        {displayLabel}
      </span>
    </span>
  );
}
