'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import { ChatUnreadBadge } from './atoms/chat-unread-badge';
import { ChatNewConversationPanel } from './organisms/chat-new-conversation-panel';
import type { Conversation } from '../utils/types';

interface ChatInboxSidebarProps {
  conversations: Conversation[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
  onNewMessage?: () => void;
  onOpenSettings?: () => void;
}

function formatConversationTime(isoString?: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch {
    return '';
  }
}

export function ChatInboxSidebar({
  conversations,
  selectedId,
  onSelect,
  className,
  onNewMessage,
  onOpenSettings
}: ChatInboxSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'awaiting'>('all');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  const messagedConversations = useMemo(() => {
    return conversations.filter((c) => Boolean(c.lastMessageAt || c.lastMessagePreview));
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    return messagedConversations.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const searchableFields = [
          c.customerName,
          c.customerEmail,
          c.medicalRecordNumber,
          c.lastMessagePreview
        ];
        const matchSearch = searchableFields.some(
          (field) => typeof field === 'string' && field.toLowerCase().includes(q)
        );
        if (!matchSearch) return false;
      }

      if (activeTab === 'awaiting') return c.awaitingReply;
      return true;
    });
  }, [messagedConversations, searchQuery, activeTab]);

  const totalCount = messagedConversations.length;
  const awaitingCount = messagedConversations.filter((c) => c.awaitingReply).length;

  return (
    <aside
      className={cn(
        'w-full md:w-[270px] lg:w-[290px] border-r border-border/60 bg-card flex flex-col min-w-0 shrink-0 select-none relative overflow-hidden',
        className
      )}
    >
      {/* Master Slide-in New Conversation Panel */}
      <ChatNewConversationPanel
        open={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
      />

      {/* 1. Top Search Bar & Actions */}
      <div className='p-3 pb-2 flex items-center gap-1.5 shrink-0'>
        <div className='relative flex-1 min-w-0'>
          <span className='absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-muted-foreground'>
            <Icons.search className='size-4' />
          </span>
          <input
            type='text'
            aria-label='Cari pasien atau pesan'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Cari pasien atau pesan...'
            className='w-full h-9 pl-9 pr-8 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/70 rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-2xs'
          />
          {searchQuery && (
            <button
              type='button'
              onClick={() => setSearchQuery('')}
              className='absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded-md hover:bg-muted transition-colors'
              title='Hapus pencarian'
              aria-label='Hapus pencarian'
            >
              <Icons.close className='size-3.5' />
            </button>
          )}
        </div>

        {/* New Chat Button (Desktop & Mobile) */}
        <Button
          type='button'
          variant='outline'
          size='icon'
          onClick={() => setIsNewChatOpen(true)}
          className='size-9 rounded-lg shrink-0 text-foreground hover:bg-muted/70 cursor-pointer border-border/70'
          aria-label='Chat Baru'
          title='Chat Baru'
        >
          <Icons.add className='size-4' />
        </Button>

        {/* Mobile Context Menu */}
        <div className='block md:hidden shrink-0'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='size-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 cursor-pointer'
                aria-label='Menu Opsi Percakapan'
              >
                <Icons.ellipsis className='size-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-44'>
              <DropdownMenuItem
                onClick={() => {
                  setIsNewChatOpen(true);
                  onNewMessage?.();
                }}
                className='text-xs cursor-pointer gap-2'
              >
                <Icons.add className='size-3.5' />
                <span>Chat Baru</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onOpenSettings?.()}
                className='text-xs cursor-pointer gap-2'
              >
                <Icons.settings className='size-3.5' />
                <span>Pengaturan Chat</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 2. Category Filters: Native Filled, Borderless with unified rounded-lg radius */}
      <div className='px-3 pb-2.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0'>
        {/* Filter: Semua */}
        <button
          type='button'
          onClick={() => setActiveTab('all')}
          className={cn(
            'h-7.5 px-3 rounded-lg text-xs transition-all shrink-0 flex items-center gap-1.5 border-0 outline-none cursor-pointer',
            activeTab === 'all'
              ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
              : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground font-medium'
          )}
        >
          <span>Semua</span>
          {totalCount > 0 && (
            <span
              className={cn(
                'text-[10px] font-normal leading-none',
                activeTab === 'all' ? 'text-primary-foreground/90' : 'text-muted-foreground'
              )}
            >
              {totalCount}
            </span>
          )}
        </button>

        {/* Filter: Perlu Dibalas */}
        <button
          type='button'
          onClick={() => setActiveTab('awaiting')}
          className={cn(
            'h-7.5 px-3 rounded-lg text-xs transition-all shrink-0 flex items-center gap-1.5 border-0 outline-none cursor-pointer',
            activeTab === 'awaiting'
              ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
              : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground font-medium'
          )}
        >
          <span>Perlu Dibalas</span>
          {awaitingCount > 0 && (
            <span
              className={cn(
                'size-4 rounded-md text-[10px] font-bold flex items-center justify-center leading-none',
                activeTab === 'awaiting'
                  ? 'bg-primary-foreground/25 text-primary-foreground'
                  : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
              )}
            >
              {awaitingCount}
            </span>
          )}
        </button>
      </div>

      {/* 4. Conversation Threads List */}
      <div className='flex-1 overflow-y-auto divide-y divide-border/30'>
        {filteredConversations.length === 0 ? (
          <EmptyState
            icon={Icons.chat}
            title='Belum ada percakapan'
            description='Percakapan pasien akan ditampilkan di sini.'
            className='min-h-[240px] border-0 bg-transparent px-3'
          />
        ) : (
          filteredConversations.map((c) => {
            const isSelected = selectedId === c.id;
            const hasUnread = (c.unreadCount || 0) > 0;

            return (
              <button
                type='button'
                key={c.id}
                onClick={() => onSelect(c.id)}
                aria-label={`Percakapan dengan ${c.customerName || 'Pasien'}`}
                className={cn(
                  'w-full text-left p-2.5 px-3 cursor-pointer flex items-center gap-2.5 transition-colors border-0 bg-transparent',
                  isSelected ? 'bg-muted/70' : 'hover:bg-muted/30'
                )}
              >
                <div className='relative shrink-0'>
                  <Avatar className='size-9 rounded-full ring-1 ring-border/40 overflow-hidden'>
                    <AvatarImage
                      src={c.userId ? `/api/v1/users/${c.userId}/avatar` : DEFAULT_AVATAR_PATH}
                      alt={c.customerName || 'Pasien'}
                      className='size-full object-cover aspect-square rounded-full'
                    />
                    <AvatarFallback className='p-0 bg-transparent overflow-hidden'>
                      <Image
                        src={DEFAULT_AVATAR_PATH}
                        alt={c.customerName || 'Pasien'}
                        width={36}
                        height={36}
                        unoptimized
                        className='size-full object-cover rounded-full aspect-square'
                      />
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between gap-1'>
                    <span
                      className={cn(
                        'text-xs truncate',
                        hasUnread
                          ? 'font-bold text-foreground'
                          : 'font-semibold text-foreground/90'
                      )}
                    >
                      {c.customerName || 'Pasien'}
                    </span>
                    <span
                      className={cn(
                        'text-[9.5px] tabular-nums shrink-0',
                        hasUnread
                          ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                          : 'text-muted-foreground'
                      )}
                    >
                      {formatConversationTime(c.lastMessageAt)}
                    </span>
                  </div>

                  <div className='flex items-center justify-between gap-2 mt-0.5'>
                    <p
                      className={cn(
                        'text-[10.5px] truncate flex-1 min-w-0',
                        hasUnread
                          ? 'text-foreground font-medium'
                          : 'text-muted-foreground'
                      )}
                    >
                      {c.lastMessagePreview || ''}
                    </p>

                    <div className='shrink-0 flex items-center gap-1'>
                      <ChatUnreadBadge count={c.unreadCount} size='sm' />
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
