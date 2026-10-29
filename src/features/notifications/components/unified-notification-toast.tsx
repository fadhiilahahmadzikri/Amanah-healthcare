'use client';

import React from 'react';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import type { NotificationToastModel } from '../presentation/notification-toast-mapper';
import { cn } from '@/lib/utils';

export interface UnifiedNotificationToastProps {
  toastId: string | number;
  model: NotificationToastModel;
}

/**
 * Renders appropriate contextual icon when event is clinic/system-wide.
 */
function renderSystemIcon(iconType?: string | null): React.ReactNode {
  switch (iconType) {
    case 'calendar':
    case 'calendar-check':
      return <Icons.calendar className='size-5 text-primary' />;
    case 'stethoscope':
      return <Icons.stethoscope className='size-5 text-primary' />;
    case 'clock':
      return <Icons.clock className='size-5 text-primary' />;
    case 'alert-circle':
      return <Icons.alertCircle className='size-5 text-destructive' />;
    case 'check':
    case 'check-circle':
      return <Icons.check className='size-5 text-primary' />;
    case 'gift':
      return <Icons.gift className='size-5 text-primary' />;
    case 'flask':
      return <Icons.flask className='size-5 text-primary' />;
    case 'activity':
      return <Icons.activity className='size-5 text-primary' />;
    case 'pill':
      return <Icons.pill className='size-5 text-primary' />;
    case 'video':
      return <Icons.video className='size-5 text-primary' />;
    case 'message-square':
      return <Icons.chat className='size-5 text-primary' />;
    case 'user':
    case 'user-plus':
      return <Icons.user className='size-5 text-primary' />;
    default:
      return <Icons.notification className='size-5 text-primary' />;
  }
}

/**
 * Unified Friendly Notification Toast Component.
 * Faithfully mirrors the reference layout:
 * - Left: Squircle avatar container (frame-0 synchronous paint, no Radix status delay)
 * - Middle: Friendly announcement + contextual emoji on line 1, person name on line 2
 * - Right: Compact trailing action button with diagonal arrow (↗)
 */
export function UnifiedNotificationToast({ toastId, model }: UnifiedNotificationToastProps) {
  const hasAction = Boolean(model.action);

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (model.action) {
      model.action.onClick();
      toast.dismiss(toastId);
    }
  };

  const handleContainerClick = () => {
    if (model.action) {
      model.action.onClick();
      toast.dismiss(toastId);
    }
  };

  return (
    <div
      role='alert'
      onClick={handleContainerClick}
      className={cn(
        'group/toast flex items-center gap-3.5 w-full min-w-[320px] max-w-[420px]',
        'rounded-2xl border border-border/80 bg-popover text-popover-foreground',
        'p-3.5 shadow-xl select-none transition-all duration-200',
        hasAction ? 'cursor-pointer hover:border-border hover:shadow-2xl' : ''
      )}
    >
      {/* 1. Leading Squircle Avatar (Zero-Flicker Synchronous Image) */}
      <div className='relative size-11 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted/40 flex items-center justify-center'>
        {model.isPerson ? (
          <img
            src={model.avatarUrl || DEFAULT_AVATAR_PATH}
            alt={model.entityName || 'Avatar'}
            className='size-full object-cover object-center'
            loading='eager'
            decoding='sync'
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== DEFAULT_AVATAR_PATH) {
                target.src = DEFAULT_AVATAR_PATH;
              }
            }}
          />
        ) : (
          renderSystemIcon(model.systemIconType)
        )}
      </div>

      {/* 2. Middle Content Stack */}
      <div className='flex flex-col flex-1 min-w-0 justify-center'>
        {/* Line 1: Friendly Announcement + Emoji */}
        <div className='flex items-center gap-1.5 text-[13px] font-semibold text-foreground truncate leading-tight'>
          <span className='truncate'>{model.headline}</span>
          <span className='text-sm shrink-0 leading-none select-none'>{model.emoji}</span>
        </div>

        {/* Line 2: Entity / Person Name */}
        {model.entityName && (
          <div className='text-xs text-muted-foreground truncate font-normal mt-0.5 leading-snug'>
            {model.entityName}
          </div>
        )}
      </div>

      {/* 3. Trailing Action Button with Diagonal Arrow (↗) */}
      {hasAction && (
        <button
          type='button'
          onClick={handleActionClick}
          aria-label='Buka detail'
          className='flex items-center justify-center size-8.5 shrink-0 rounded-xl border border-border/70 bg-muted/40 hover:bg-muted text-foreground/80 hover:text-foreground hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-2xs'
        >
          <Icons.arrowUpRight className='size-4 stroke-[2.2]' />
        </button>
      )}
    </div>
  );
}
