import * as React from 'react';
import { Icons, type Icon } from '@/components/icons';
import { cn } from '@/lib/utils';

interface EmptyStateProps extends React.ComponentProps<'div'> {
  icon?: Icon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: IconComponent = Icons.inbox,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-[280px] flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border/70 bg-muted/10 p-8 text-center',
        className
      )}
      {...props}
    >
      <div className='mb-3 flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground'>
        <IconComponent className='size-5' />
      </div>
      <div className='space-y-1'>
        <h3 className='text-sm font-semibold text-foreground'>{title}</h3>
        {description ? (
          <p className='mx-auto max-w-sm text-xs leading-relaxed text-muted-foreground'>
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className='mt-4'>{action}</div> : null}
    </div>
  );
}
