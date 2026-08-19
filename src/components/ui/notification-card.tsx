'use client';

import type { FC, ReactNode } from 'react';
import { Icons } from '@/components/icons';
import { cn, formatTimeAgo, formatFullDate } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Button } from './button';

export type NotificationStatus = 'unread' | 'read' | 'archived';
export type ActionType = 'redirect' | 'api_call' | 'workflow' | 'modal';
export type ActionStyle = 'primary' | 'danger' | 'default';

export interface NotificationAction {
  id: string;
  label: string;
  type: ActionType;
  style?: ActionStyle;
  executed?: boolean;
}

export interface NotificationCardProps {
  id: string;
  title: string | ReactNode;
  body?: string;
  user?: { name: string; handle?: string; avatar?: string; badge?: string };
  category?: string;
  status?: NotificationStatus;
  createdAt?: string | Date;
  actions?: NotificationAction[];
  onMarkAsRead?: (id: string) => void;
  onAction?: (notificationId: string, actionId: string, actionType: ActionType) => void;
  loadingActionId?: string;
  className?: string;
}

export const NotificationCard: FC<NotificationCardProps> = ({
  id,
  title,
  body,
  user,
  status = 'unread',
  createdAt,
  actions = [],
  onAction,
  loadingActionId,
  className
}) => {
  const isUnread = status === 'unread';

  return (
    <div
      className={cn(
        'group relative w-full p-4 transition-all hover:bg-muted/50 border-b border-transparent last:border-b-0 hover:border-border',
        className
      )}
    >
      <div className='flex items-start gap-4'>
        {user && (
          <div className='relative mt-1'>
            <Avatar className='h-10 w-10 border border-border/50 shadow-sm'>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {user.badge === 'heart' && (
              <div className='absolute -bottom-1 -right-1 bg-background rounded-full p-[2px]'>
                <div className='bg-primary rounded-full p-[2px]'>
                  <Icons.heart className='h-3 w-3 text-primary-foreground fill-primary-foreground' />
                </div>
              </div>
            )}
          </div>
        )}

        <div className='min-w-0 flex-1 space-y-1.5'>
          <div className='flex items-start justify-between gap-2'>
            <div className='text-[14px] leading-tight pr-6'>
              {user?.handle ? (
                <span>
                  <span className='font-semibold text-foreground'>{user.handle}</span>{' '}
                  <span className='text-muted-foreground'>{title}</span>
                </span>
              ) : (
                <span className='font-medium text-foreground'>{title}</span>
              )}
            </div>
            {isUnread && (
              <div className='absolute right-4 top-5 h-2 w-2 flex-shrink-0 rounded-full bg-primary' />
            )}
          </div>

          {createdAt && (
            <div className='flex items-center justify-between text-[12.5px] text-muted-foreground/80 font-medium pr-4'>
              <span>{formatFullDate(createdAt)}</span>
              <span>{formatTimeAgo(createdAt)}</span>
            </div>
          )}

          {body && (
            <div className='mt-3 mr-4 rounded-xl rounded-tl-none bg-muted/60 p-3.5 text-[14px] leading-relaxed text-foreground/90 border border-border/40'>
              {body}
            </div>
          )}

          {actions.length > 0 && (
            <div className='mt-4 flex items-center gap-3'>
              {actions.map((action) => {
                const isLoading = loadingActionId === action.id;
                return (
                  <Button
                    key={action.id}
                    variant={
                      action.style === 'primary'
                        ? 'default'
                        : action.style === 'danger'
                          ? 'destructive'
                          : 'outline'
                    }
                    size='sm'
                    className={cn(
                      action.style === 'primary'
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm'
                        : action.style === 'danger'
                          ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm'
                          : 'border-border/60 hover:bg-muted/60 text-foreground/80 font-semibold',
                      'h-9 px-6 text-[13px] rounded-lg'
                    )}
                    disabled={isLoading || action.executed}
                    onClick={() => onAction?.(id, action.id, action.type)}
                  >
                    {isLoading ? (
                      <Icons.spinner size={14} className='animate-spin' />
                    ) : (
                      action.label
                    )}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
