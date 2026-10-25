import * as React from 'react';
import { Icons, type Icon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EmptyBoxAnimation } from './empty-box-animation';

export interface EmptyStateResetAction {
  label?: string;
  onReset: () => void;
  icon?: Icon;
}

export interface EmptyStateProps extends React.ComponentProps<'div'> {
  icon?: Icon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  resetAction?: EmptyStateResetAction;
  /**
   * Whether to display the animated 3D empty box (default: true).
   * If false, falls back to the static icon.
   */
  animated?: boolean;
  /**
   * Optional custom animation container class name.
   */
  animationClassName?: string;
}

export function EmptyState({
  icon: IconComponent = Icons.inbox,
  title,
  description,
  action,
  resetAction,
  animated = true,
  animationClassName,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex h-full min-h-[280px] w-full flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border/70 bg-muted/10 p-6 sm:p-8 text-center',
        className
      )}
      {...props}
    >
      {animated ? (
        <EmptyBoxAnimation
          className={cn(
            'w-48 h-48 sm:w-60 sm:h-60 md:w-64 md:h-64 max-w-full aspect-square shrink-0 -mt-2 -mb-1',
            animationClassName
          )}
        />
      ) : (
        <div className='mb-3 flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground'>
          <IconComponent className='size-5' />
        </div>
      )}
      <div className='space-y-1.5 max-w-sm'>
        <h3 className='text-sm font-semibold text-foreground tracking-tight'>{title}</h3>
        {description ? (
          <p className='mx-auto text-xs leading-relaxed text-muted-foreground'>{description}</p>
        ) : null}
      </div>
      {action || resetAction ? (
        <div className='mt-4 flex flex-wrap items-center justify-center gap-2'>
          {action}
          {resetAction && (
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={resetAction.onReset}
              className='h-8 px-4 text-xs font-medium border-border/70 bg-card hover:bg-muted text-foreground gap-1.5 shadow-2xs cursor-pointer rounded-lg'
            >
              {resetAction.icon ? (
                <resetAction.icon className='size-3.5' />
              ) : (
                <Icons.refresh className='size-3.5' />
              )}
              <span>{resetAction.label || 'Reset'}</span>
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
