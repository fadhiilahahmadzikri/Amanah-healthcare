'use client';

import React, { useId, useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface PixelTextureProps {
  /**
   * Color mode for generating the pixel palette:
   * - 'theme': Computes mathematically from CSS variables (`var(--primary)`, `var(--primary-bright)` etc.)
   * - 'primary': Direct primary theme color shades
   * - 'monochrome': Clean slate / neutral white shades
   * - 'custom': Uses custom colors array passed in `customColors`
   */
  colorMode?: 'theme' | 'primary' | 'monochrome' | 'custom';

  /**
   * Custom colors if colorMode === 'custom'
   */
  customColors?: string[];

  /**
   * Primary color override (defaults to 'var(--primary)')
   */
  primaryColor?: string;

  /**
   * Secondary accent color override (defaults to 'var(--primary-bright, var(--primary))')
   */
  secondaryColor?: string;

  /**
   * Overall opacity of the pixel texture
   * Default: 0.35
   */
  opacity?: number;

  /**
   * Masking variant for the texture:
   * - 'curved-convex': Organic arch dome curve (higher in middle, slopes to edges)
   * - 'curved-concave': Inward valley curve (lower in middle, higher at sides)
   * - 'curved-bottom': Convex arch fading towards bottom
   * - 'curved-top': Convex arch fading towards top
   * - 'fade-bottom': Linear gradient fade to bottom
   * - 'fade-top': Linear gradient fade to top
   * - 'none': Full unmasked
   */
  maskVariant?:
    | 'curved-convex'
    | 'curved-concave'
    | 'curved-bottom'
    | 'curved-top'
    | 'fade-bottom'
    | 'fade-top'
    | 'none';

  /**
   * Invert the masking gradient
   */
  invertMask?: boolean;

  /**
   * Custom CSS mask-image override
   */
  maskGradient?: string;

  /**
   * Enable an organic curved white / card-surface background plate behind the content
   */
  curvedWhiteMask?: boolean;

  /**
   * Pixel cell size in pixels (default: 4.5)
   */
  pixelSize?: number;

  /**
   * Grid gap size in pixels (default: 1.5)
   */
  gap?: number;

  /**
   * Density / vibrance of pixel distribution
   */
  density?: 'subtle' | 'medium' | 'dense';

  /**
   * Blend mode for the texture layer
   */
  blendMode?: React.CSSProperties['mixBlendMode'];

  /**
   * Custom height (e.g. '100%', '160px', 240)
   */
  height?: number | string;

  /**
   * Custom width (e.g. '100%')
   */
  width?: number | string;

  /**
   * Position mode (e.g. 'absolute' or 'relative')
   */
  position?: 'absolute' | 'relative';

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Inline style object
   */
  style?: React.CSSProperties;
}

export function PixelTexture({
  colorMode = 'theme',
  customColors,
  primaryColor = 'var(--primary)',
  secondaryColor = 'var(--primary-bright, var(--primary))',
  opacity = 0.35,
  maskVariant = 'curved-convex',
  invertMask = false,
  maskGradient,
  curvedWhiteMask = false,
  pixelSize = 4.5,
  gap = 1.5,
  density = 'medium',
  blendMode = 'normal',
  height = '100%',
  width = '100%',
  position = 'absolute',
  className,
  style
}: PixelTextureProps) {
  const patternId = useId().replace(/:/g, '-');

  // Compute the 6x4 pixel matrix
  const patternCells = useMemo(() => {
    const cols = 6;
    const rows = 4;
    const step = pixelSize + gap;
    const patternW = cols * step;
    const patternH = rows * step;

    // Relative opacities matrix for organic distribution
    const opacities = [
      [0.9, 0.4, 0.75, 0.2, 0.85, 0.5],
      [0.3, 0.8, 0.15, 0.95, 0.35, 0.7],
      [0.85, 0.25, 0.9, 0.4, 0.8, 0.15],
      [0.4, 0.9, 0.3, 0.75, 0.2, 0.85]
    ];

    const cells: Array<{
      x: number;
      y: number;
      fill: string;
      fillOpacity: number;
    }> = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let fill = 'currentColor';
        const baseOpacity = opacities[r][c];
        const densityMultiplier = density === 'dense' ? 1.2 : density === 'subtle' ? 0.65 : 0.9;
        const cellOpacity = Math.min(1, Math.max(0.08, baseOpacity * densityMultiplier));

        if (colorMode === 'theme') {
          const idx = (r * cols + c) % 4;
          if (idx === 0) {
            fill = `color-mix(in oklab, ${primaryColor} 70%, white)`;
          } else if (idx === 1) {
            fill = `color-mix(in oklab, ${secondaryColor} 50%, white)`;
          } else if (idx === 2) {
            fill = `color-mix(in oklab, ${primaryColor} 25%, white)`;
          } else {
            fill = '#ffffff';
          }
        } else if (colorMode === 'primary') {
          fill = primaryColor;
        } else if (colorMode === 'monochrome') {
          const idx = (r * cols + c) % 3;
          fill = idx === 0 ? '#cbd5e1' : idx === 1 ? '#94a3b8' : '#ffffff';
        } else if (colorMode === 'custom' && customColors && customColors.length > 0) {
          fill = customColors[(r * cols + c) % customColors.length];
        }

        cells.push({
          x: c * step,
          y: r * step,
          fill,
          fillOpacity: cellOpacity
        });
      }
    }

    return { patternW, patternH, cells };
  }, [colorMode, customColors, primaryColor, secondaryColor, pixelSize, gap, density]);

  // Determine CSS mask gradient
  const maskStyle = useMemo((): React.CSSProperties => {
    if (maskGradient) {
      return {
        maskImage: maskGradient,
        WebkitMaskImage: maskGradient
      };
    }

    if (maskVariant === 'none') {
      return {};
    }

    let gradientStr = '';

    if (maskVariant === 'curved-convex' || maskVariant === 'curved-bottom') {
      // Dramatic Pronounced Arch Dome: High arched dome in the center swooping down to corners
      gradientStr = invertMask
        ? 'radial-gradient(88% 62% at 50% 102%, rgba(0,0,0,1) 28%, rgba(0,0,0,0.55) 62%, rgba(0,0,0,0) 95%)'
        : 'radial-gradient(88% 62% at 50% -2%, rgba(0,0,0,1) 28%, rgba(0,0,0,0.55) 62%, rgba(0,0,0,0) 95%)';
    } else if (maskVariant === 'curved-concave' || maskVariant === 'curved-top') {
      gradientStr = invertMask
        ? 'radial-gradient(90% 65% at 50% -2%, rgba(0,0,0,0) 20%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,1) 100%)'
        : 'radial-gradient(90% 65% at 50% 102%, rgba(0,0,0,0) 20%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,1) 100%)';
    } else if (maskVariant === 'fade-bottom') {
      gradientStr = invertMask
        ? 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,1) 100%)'
        : 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0) 100%)';
    } else if (maskVariant === 'fade-top') {
      gradientStr = invertMask
        ? 'linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,1) 100%)'
        : 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0) 100%)';
    }

    return {
      maskImage: gradientStr,
      WebkitMaskImage: gradientStr
    };
  }, [maskVariant, invertMask, maskGradient]);

  return (
    <div
      style={{
        position,
        height,
        width,
        opacity,
        mixBlendMode: blendMode,
        ...maskStyle,
        ...style
      }}
      className={cn(
        'top-0 left-0 right-0 pointer-events-none select-none overflow-hidden z-0',
        position === 'absolute' && 'inset-0',
        className
      )}
      aria-hidden='true'
    >
      <svg className='w-full h-full' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'>
        <defs>
          <pattern
            id={patternId}
            width={patternCells.patternW}
            height={patternCells.patternH}
            patternUnits='userSpaceOnUse'
          >
            {patternCells.cells.map((cell, idx) => (
              <rect
                key={idx}
                x={cell.x}
                y={cell.y}
                width={pixelSize}
                height={pixelSize}
                rx={0.75}
                fill={cell.fill}
                fillOpacity={cell.fillOpacity}
              />
            ))}
          </pattern>
        </defs>

        <rect width='100%' height='100%' fill={`url(#${patternId})`} />
      </svg>

      {/* Optional Organic Curved White Mask Plate */}
      {curvedWhiteMask && (
        <div
          className='absolute inset-0 pointer-events-none'
          style={{
            background:
              'radial-gradient(150% 120% at 50% -20%, transparent 55%, var(--card) 85%, var(--card) 100%)'
          }}
        />
      )}
    </div>
  );
}
