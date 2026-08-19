import * as React from 'react';
import { InfoButton } from '@/components/ui/info-button';
import type { InfobarContent } from '@/components/ui/infobar';
import { cn } from '@/lib/utils';

export interface HeadingProps {
  title: string;
  description?: string;
  subtitle?: string;
  infoContent?: InfobarContent;
  avatar?: string | React.ReactNode;
  badge?: React.ReactNode;
  trailing?: React.ReactNode;
  actions?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Heading({
  title,
  description,
  subtitle,
  infoContent,
  avatar,
  badge,
  trailing,
  actions,
  size = 'lg',
  className
}: HeadingProps) {
  const descText = description || subtitle;
  const trailingActions = trailing || actions;

  const sizeClasses = {
    sm: 'text-lg tracking-tight',
    md: 'text-xl tracking-tight',
    lg: 'text-2xl font-bold tracking-tight',
    xl: 'text-3xl font-bold tracking-tight'
  };

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none',
        className
      )}
    >
      <div className='flex items-center gap-3.5 min-w-0'>
        {avatar && (
          <div className='shrink-0'>
            {typeof avatar === 'string' ? (
              <img
                src={avatar}
                alt={title}
                className='size-11 rounded-full object-cover ring-1 ring-border'
              />
            ) : (
              avatar
            )}
          </div>
        )}

        <div className='min-w-0 space-y-0.5'>
          <div className='flex items-center gap-2 flex-wrap'>
            <h2 className={cn('font-bold text-foreground truncate', sizeClasses[size])}>{title}</h2>

            {badge && <div className='shrink-0'>{badge}</div>}

            {infoContent && (
              <div className='pt-0.5 shrink-0'>
                <InfoButton content={infoContent} />
              </div>
            )}
          </div>

          {descText && (
            <p className='text-muted-foreground text-xs font-normal leading-relaxed truncate'>
              {descText}
            </p>
          )}
        </div>
      </div>

      {trailingActions && (
        <div className='flex items-center gap-2 shrink-0 self-start sm:self-center'>
          {trailingActions}
        </div>
      )}
    </div>
  );
}
