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
  onClose: () => void;
  isLoading?: boolean;
  isAdmin?: boolean;
}

function formatSessionDate(isoString?: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
  isAdmin
}: ConsultationHistoryDrawerProps) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className='absolute inset-0 w-full sm:w-80 bg-card/98 backdrop-blur-md border-r border-border/70 z-30 flex flex-col animate-in slide-in-from-left duration-200 shadow-2xl select-none'
    >
      {/* Full-bleed Header */}
      <div className='p-4 border-b border-border/50 flex items-center justify-between shrink-0 bg-card/90'>
        <div className='flex items-center gap-2'>
          <Icons.history className='size-4 text-primary' />
          <h4 className='text-xs font-bold text-foreground'>
            {isAdmin ? 'Kotak Masuk Pasien' : 'Riwayat Percakapan'}
          </h4>
        </div>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          onClick={onClose}
          className='size-7 rounded-lg text-muted-foreground hover:text-foreground'
          aria-label='Tutup'
        >
          <Icons.close className='size-4' />
        </Button>
      </div>

      {/* List */}
      <div className='flex-1 overflow-y-auto p-3 space-y-2 text-xs'>
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
            className='min-h-[220px] border-0 bg-transparent p-4'
          />
        ) : (
          conversations.map((session) => {
            const isSelected = session.id === activeConversationId;
            const displayName = isAdmin
              ? session.customerName || session.guestName || 'Tamu'
              : formatSessionDate(session.createdAt);

            return (
              <button
                key={session.id}
                type='button'
                onClick={() => {
                  onSelectSession(session.id);
                  onClose();
                }}
                className={cn(
                  'w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5',
                  isSelected
                    ? 'border-primary/50 bg-primary/10 shadow-2xs'
                    : 'border-border/60 bg-card/70 hover:bg-muted/50'
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
                  {session.status === 'open' && (
                    <span className='absolute bottom-0 right-0 size-2 rounded-full ring-1.5 ring-background bg-emerald-500' />
                  )}
                </div>

                <div className='flex-1 min-w-0 flex flex-col gap-0.5'>
                  <div className='flex items-center justify-between'>
                    <span className='text-[11.5px] font-bold text-foreground truncate'>
                      {displayName}
                    </span>
                    {isAdmin && (
                      <span className='text-[9.5px] text-muted-foreground/70 tabular-nums shrink-0 ml-1'>
                        {formatSessionDate(session.lastMessageAt || session.createdAt)}
                      </span>
                    )}
                  </div>
                  <div className='flex items-center justify-between gap-1'>
                    <p className='text-[11px] text-muted-foreground line-clamp-1 break-all flex-1'>
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
