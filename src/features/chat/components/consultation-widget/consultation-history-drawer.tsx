'use client';

import React from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import { cn } from '@/lib/utils';
import { ChatUnreadBadge } from '../atoms/chat-unread-badge';
import type { Conversation } from '../../utils/types';

interface ConsultationHistoryDrawerProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectSession: (conversationId: string) => void;
  onClose?: () => void;
  isLoading?: boolean;
  isAdmin?: boolean;
  className?: string;
}

function formatSessionDate(isoString?: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short'
    });
  } catch {
    return '';
  }
}

export function ConsultationHistoryDrawer({
  conversations,
  activeConversationId,
  onSelectSession,
  onClose,
  isLoading,
  isAdmin,
  className
}: ConsultationHistoryDrawerProps) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={cn(
        'w-64 sm:w-72 bg-card/95 border-r border-border/70 flex flex-col shrink-0 select-none overflow-hidden h-full z-30',
        className
      )}
    >
      {/* Sidebar Header (Hidden for admin to keep UI compact) */}
      {!isAdmin && (
        <div className='p-3 sm:p-3.5 border-b border-border/50 flex items-center justify-between shrink-0 bg-card/90'>
          <div className='flex items-center gap-2 min-w-0'>
            <Icons.history className='size-4 text-primary shrink-0' />
            <h4 className='text-xs font-bold text-foreground truncate'>
              Riwayat Percakapan
            </h4>
          </div>
          {onClose && (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={onClose}
              className='size-7 rounded-lg text-muted-foreground hover:text-foreground sm:hidden'
              aria-label='Tutup'
            >
              <Icons.close className='size-3.5' />
            </Button>
          )}
        </div>
      )}

      {/* Conversations List */}
      <div className='flex-1 overflow-y-auto p-2 space-y-1.5 text-xs'>
        {isLoading ? (
          <div className='flex items-center justify-center h-40 text-muted-foreground gap-2'>
            <Icons.spinner className='size-4 animate-spin text-primary' />
            <span>Memuat...</span>
          </div>
        ) : conversations.length === 0 ? (
          <EmptyState
            icon={Icons.history}
            title='Belum ada percakapan'
            description='Daftar percakapan akan muncul di sini.'
            className='min-h-[180px] border-0 bg-transparent p-3'
          />
        ) : (
          conversations.map((session) => {
            const isSelected = session.id === activeConversationId;
            const displayName = session.customerName || session.guestName || 'Tamu';

            return (
              <button
                key={session.id}
                type='button'
                onClick={() => onSelectSession(session.id)}
                className={cn(
                  'w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 relative group',
                  isSelected
                    ? 'border-primary/50 bg-primary/10 shadow-2xs font-semibold'
                    : 'border-border/40 bg-card/50 hover:bg-muted/60'
                )}
              >
                <div className='relative shrink-0 mt-0.5'>
                  <Avatar className='size-8 rounded-full ring-1 ring-border/40 overflow-hidden'>
                    <AvatarImage
                      src={
                        session.userId
                          ? `/api/v1/users/${session.userId}/avatar`
                          : DEFAULT_AVATAR_PATH
                      }
                      alt={displayName}
                      className='size-full object-cover aspect-square rounded-full'
                    />
                    <AvatarFallback className='p-0 bg-transparent overflow-hidden'>
                      <Image
                        src={DEFAULT_AVATAR_PATH}
                        alt={displayName}
                        width={32}
                        height={32}
                        unoptimized
                        className='size-full object-cover rounded-full aspect-square'
                      />
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={cn(
                      'absolute bottom-0 right-0 size-2 rounded-full ring-1.5 ring-background',
                      session.isOnline ? 'bg-emerald-500' : 'bg-zinc-400'
                    )}
                  />
                </div>

                <div className='flex-1 min-w-0 flex flex-col gap-0.5'>
                  <div className='flex items-center justify-between'>
                    <span className='text-[11.5px] font-bold text-foreground truncate'>
                      {displayName}
                    </span>
                    <span className='text-[9.5px] text-muted-foreground/70 tabular-nums shrink-0 ml-1'>
                      {formatSessionDate(session.lastMessageAt || session.createdAt)}
                    </span>
                  </div>
                  <div className='flex items-center justify-between gap-1'>
                    <p className='text-[11px] text-muted-foreground line-clamp-1 break-all flex-1 font-normal'>
                      {session.lastMessagePreview || 'Belum ada pesan'}
                    </p>
                    <ChatUnreadBadge count={session.unreadCount} size='sm' />
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
