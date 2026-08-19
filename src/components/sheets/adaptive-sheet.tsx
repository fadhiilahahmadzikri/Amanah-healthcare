'use client';

import type { CSSProperties, ReactNode } from 'react';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

type SheetSide = 'left' | 'right' | 'top' | 'bottom';

export interface AdaptiveSheetProps {
  mode?: 'overlay' | 'push';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;
  supportingText?: ReactNode;
  media?: ReactNode;
  width?: number | string;
  side?: SheetSide;
  children?: ReactNode;
  sheetContent?: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
  bodyClassName?: string;
}

const DEFAULT_WIDTH = 520;

export function AdaptiveSheet({
  mode = 'overlay',
  open,
  onOpenChange,
  title,
  subtitle,
  description,
  supportingText,
  media,
  width = DEFAULT_WIDTH,
  side = 'right',
  children,
  sheetContent,
  footer,
  className,
  contentClassName,
  bodyClassName
}: AdaptiveSheetProps) {
  if (mode === 'push') {
    return (
      <div
        className={cn(
          'flex min-h-0 flex-1 transition-[gap] duration-300',
          isHorizontalSide(side) ? 'flex-row' : 'flex-col',
          open && (isHorizontalSide(side) ? 'gap-4 xl:gap-6' : 'gap-4'),
          className
        )}
      >
        {side === 'left' && (
          <PushPanel
            open={open}
            onOpenChange={onOpenChange}
            side={side}
            width={width}
            title={title}
            subtitle={subtitle}
            description={description}
            supportingText={supportingText}
            media={media}
            footer={footer}
            className={contentClassName}
            bodyClassName={bodyClassName}
          >
            {sheetContent}
          </PushPanel>
        )}
        <div className='min-w-0 flex-1'>{children}</div>
        {side !== 'left' && (
          <PushPanel
            open={open}
            onOpenChange={onOpenChange}
            side={side}
            width={width}
            title={title}
            subtitle={subtitle}
            description={description}
            supportingText={supportingText}
            media={media}
            footer={footer}
            className={contentClassName}
            bodyClassName={bodyClassName}
          >
            {sheetContent}
          </PushPanel>
        )}
      </div>
    );
  }

  return (
    <>
      {children}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side={side}
          className={cn('gap-0 p-0 sm:max-w-none', contentClassName)}
          style={getSheetSizeStyle(width, side)}
        >
          <AdaptiveSheetHeader
            title={title}
            subtitle={subtitle}
            description={description}
            supportingText={supportingText}
            media={media}
            variant='dialog'
          />
          <div className={cn('min-h-0 flex-1 overflow-y-auto px-6 py-4', bodyClassName)}>
            {sheetContent}
          </div>
          {footer && <SheetFooter className='border-t px-6 py-4'>{footer}</SheetFooter>}
        </SheetContent>
      </Sheet>
    </>
  );
}

type PushPanelProps = Omit<
  AdaptiveSheetProps,
  'mode' | 'children' | 'sheetContent' | 'width' | 'side'
> & {
  children: ReactNode;
  width: number | string;
  side: SheetSide;
};

function PushPanel({
  open,
  onOpenChange,
  side,
  width,
  title,
  subtitle,
  description,
  supportingText,
  media,
  footer,
  children,
  className,
  bodyClassName
}: PushPanelProps) {
  const sizeStyle = getPushSizeStyle(open, width, side);

  return (
    <aside
      aria-hidden={!open}
      className={cn(
        'min-h-0 overflow-hidden border-border bg-background shadow-xl transition-[width,height,opacity,transform] duration-300 ease-out',
        isHorizontalSide(side) ? 'h-full border-l' : 'w-full border-t',
        side === 'left' && 'border-l-0 border-r',
        side === 'right' && 'rounded-l-lg',
        side === 'left' && 'rounded-r-lg',
        side === 'top' && 'rounded-b-lg',
        side === 'bottom' && 'rounded-t-lg',
        open ? 'translate-x-0 translate-y-0 opacity-100' : getClosedPushTransform(side),
        !open && 'pointer-events-none',
        className
      )}
      style={sizeStyle}
    >
      <div className='flex h-full min-h-0 flex-col'>
        <AdaptiveSheetHeader
          title={title}
          subtitle={subtitle}
          description={description}
          supportingText={supportingText}
          media={media}
          onClose={() => onOpenChange(false)}
          variant='static'
        />
        <div className={cn('min-h-0 flex-1 overflow-y-auto px-6 py-4', bodyClassName)}>
          {children}
        </div>
        {footer && <div className='border-t px-6 py-4'>{footer}</div>}
      </div>
    </aside>
  );
}

function AdaptiveSheetHeader({
  title,
  subtitle,
  description,
  supportingText,
  media,
  onClose,
  variant
}: Pick<AdaptiveSheetProps, 'title' | 'subtitle' | 'description' | 'supportingText' | 'media'> & {
  onClose?: () => void;
  variant: 'dialog' | 'static';
}) {
  const Title = variant === 'dialog' ? SheetTitle : 'h2';
  const Description = variant === 'dialog' ? SheetDescription : 'p';

  return (
    <SheetHeader className='relative border-b px-6 py-5 pr-14'>
      <div className='flex items-start gap-3'>
        {media && <div className='shrink-0'>{media}</div>}
        <div className='min-w-0 flex-1'>
          {subtitle && (
            <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
              {subtitle}
            </p>
          )}
          <Title className='text-lg font-semibold'>{title}</Title>
          {description && (
            <Description className='text-sm text-muted-foreground'>{description}</Description>
          )}
          {supportingText && (
            <div className='mt-2 text-xs text-muted-foreground'>{supportingText}</div>
          )}
        </div>
      </div>
      {onClose && (
        <button
          type='button'
          onClick={onClose}
          className='absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
        >
          <span className='sr-only'>Close</span>
          <Icons.close className='size-4' />
        </button>
      )}
    </SheetHeader>
  );
}

function getSheetSizeStyle(width: number | string, side: SheetSide): CSSProperties {
  if (isHorizontalSide(side)) {
    return { width: normalizeSize(width), maxWidth: 'min(100vw, 760px)' };
  }

  return { height: normalizeSize(width), maxHeight: 'min(100vh, 760px)' };
}

function getPushSizeStyle(open: boolean, width: number | string, side: SheetSide): CSSProperties {
  const size = open ? normalizeSize(width) : 0;

  if (isHorizontalSide(side)) {
    return { width: size, flexBasis: size, maxWidth: open ? 'min(100vw, 760px)' : 0 };
  }

  return { height: size, flexBasis: size, maxHeight: open ? 'min(100vh, 760px)' : 0 };
}

function normalizeSize(value: number | string): string | number {
  return typeof value === 'number' ? `${value}px` : value;
}

function isHorizontalSide(side: SheetSide): boolean {
  return side === 'left' || side === 'right';
}

function getClosedPushTransform(side: SheetSide): string {
  switch (side) {
    case 'left':
      return '-translate-x-4 opacity-0';
    case 'right':
      return 'translate-x-4 opacity-0';
    case 'top':
      return '-translate-y-4 opacity-0';
    case 'bottom':
      return 'translate-y-4 opacity-0';
  }
}
