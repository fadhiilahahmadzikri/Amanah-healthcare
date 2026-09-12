import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/features/public-site/lib/helpers';
import { getPixelIcon, type PixelIconName } from './pixelIconData';

export type PixelIconWrapperVariant = 'badge' | 'card' | 'none' | 'outline' | 'soft';

export type PixelIconProps = Omit<ComponentPropsWithoutRef<'span'>, 'children'> & {
  /**
   * Name/ID of the pixel icon from the 132 available catalog icons.
   */
  name: PixelIconName;
  /**
   * Pixel dimensions for width and height (default: 32).
   */
  size?: number | string;
  /**
   * Whether to wrap the SVG inside a themed container/badge.
   * Default: false (raw crisp SVG).
   */
  withWrapper?: boolean;
  /**
   * Visual preset style when withWrapper is true.
   * Default: 'badge'.
   */
  wrapperVariant?: PixelIconWrapperVariant;
  /**
   * Additional className applied to the wrapper span.
   */
  wrapperClassName?: string;
  /**
   * Additional className applied directly to the inner SVG element.
   */
  svgClassName?: string;
  /**
   * Accessible label/title. Defaults to the catalog's Indonesian icon title.
   */
  title?: string;
  /**
   * Fallback node if icon name is not found.
   */
  fallback?: ReactNode;
};

const wrapperVariantClassNames: Record<PixelIconWrapperVariant, string> = {
  badge:
    'rounded-xl border border-line bg-surface/90 shadow-2xs transition-colors hover:border-primary/40 hover:bg-surface',
  card: 'rounded-2xl border border-line bg-card/95 shadow-xs transition-shadow hover:shadow-md',
  soft: 'rounded-xl bg-muted/60 transition-colors hover:bg-muted/80',
  outline: 'rounded-xl border border-line bg-transparent transition-colors hover:border-primary/50',
  none: ''
};

export const PixelIcon = forwardRef<HTMLSpanElement, PixelIconProps>(
  (
    {
      className,
      fallback = null,
      name,
      size = 32,
      svgClassName,
      title,
      withWrapper = false,
      wrapperClassName,
      wrapperVariant = 'badge',
      ...props
    },
    ref
  ) => {
    const icon = getPixelIcon(name);

    if (!icon) {
      return fallback ? <>{fallback}</> : null;
    }

    const accessibleTitle = title ?? icon.title;
    const isResponsive = size === 'responsive';
    const sizeNumber = typeof size === 'number' ? size : undefined;
    const sizeStyle =
      typeof size === 'string' && !isResponsive ? { width: size, height: size } : undefined;

    const svgElement = (
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 16 16'
        width={isResponsive ? undefined : sizeNumber}
        height={isResponsive ? undefined : sizeNumber}
        style={sizeStyle}
        shapeRendering='crispEdges'
        className={cn(
          'inline-block shrink-0 select-none [image-rendering:pixelated] [shape-rendering:crispEdges]',
          svgClassName
        )}
        aria-hidden={title ? undefined : true}
        role={title ? 'img' : undefined}
        aria-label={title ? accessibleTitle : undefined}
        dangerouslySetInnerHTML={{ __html: icon.rects }}
      />
    );

    if (!withWrapper) {
      return (
        <span
          ref={ref}
          className={cn('inline-flex shrink-0 items-center justify-center', className)}
          {...props}
        >
          {svgElement}
        </span>
      );
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex shrink-0 items-center justify-center p-2 select-none transition-all duration-300',
          wrapperVariantClassNames[wrapperVariant],
          wrapperClassName,
          className
        )}
        {...props}
      >
        {svgElement}
      </span>
    );
  }
);

PixelIcon.displayName = 'PixelIcon';
