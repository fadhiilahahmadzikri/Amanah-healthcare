'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SideTrayItem } from '../side-tray.types';

export interface TrayItemProps<T extends string = string> {
  item: SideTrayItem<T>;
  isActive: boolean;
  onSelect: (key: T) => void;
  className?: string;
}

export function TrayItem<T extends string = string>({
  item,
  isActive,
  onSelect,
  className
}: TrayItemProps<T>) {
  const handleClick = React.useCallback(() => {
    if (item.disabled) return;
    item.onClick?.();
    onSelect(item.key);
  }, [item, onSelect]);

  const renderIcon = () => {
    if (!item.icon) return null;

    if (React.isValidElement(item.icon)) {
      return <div className='shrink-0 flex items-center justify-center'>{item.icon}</div>;
    }

    if (typeof item.icon === 'function') {
      const IconComponent = item.icon as React.ComponentType<{ className?: string }>;
      return <IconComponent className='size-4 shrink-0' />;
    }

    return null;
  };

  return (
    <button
      type='button'
      role='tab'
      aria-selected={isActive}
      disabled={item.disabled}
      onClick={handleClick}
      className={cn(
        'group relative w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all duration-180 outline-none select-none cursor-pointer',
        'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
        isActive
          ? 'bg-primary/10 border-primary/40 text-primary font-semibold shadow-2xs ring-1 ring-primary/20'
          : 'bg-card/40 border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:border-border',
        item.disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
        className
      )}
      title={item.description || item.label}
    >
      <div className='flex items-center gap-2.5 min-w-0 flex-1'>
        {item.icon && (
          <div
            className={cn(
              'size-7 flex items-center justify-center shrink-0 transition-colors text-base leading-none select-none',
              isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
            )}
          >
            {renderIcon()}
          </div>
        )}
        <div className='min-w-0 flex-1'>
          <p
            className={cn(
              'truncate text-xs leading-tight',
              isActive ? 'text-primary font-semibold' : 'text-foreground font-medium'
            )}
          >
            {item.label}
          </p>
          {item.description && (
            <p className='truncate text-[10px] text-muted-foreground pt-0.5'>{item.description}</p>
          )}
        </div>
      </div>

      <div className='flex items-center gap-1 shrink-0'>
        {item.badge}
        {typeof item.count === 'number' && (
          <Badge
            variant={isActive ? 'default' : 'secondary'}
            className={cn(
              'h-5 px-1.5 text-[10px] font-mono font-medium rounded-full',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground group-hover:bg-muted/90 group-hover:text-foreground'
            )}
          >
            {item.count}
          </Badge>
        )}
      </div>
    </button>
  );
}
