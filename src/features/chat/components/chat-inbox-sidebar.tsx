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
  const [activeTab, setActiveTab] = useState<'all' | 'awaiting' | 'closed'>('all');

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
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

      if (activeTab === 'awaiting') return c.status === 'open' && c.awaitingReply;
      if (activeTab === 'closed') return c.status === 'closed';
      return true;
    });
  }, [conversations, searchQuery, activeTab]);

  const totalCount = conversations.length;
  const awaitingCount = conversations.filter((c) => c.status === 'open' && c.awaitingReply).length;

  return (
    <aside
      className={cn(
        'w-full md:w-[270px] lg:w-[290px] border-r border-border/60 bg-card flex flex-col min-w-0 shrink-0 select-none',
        className
      )}
    >
      {/* 1. Top Search Bar & Mobile Actions (Standardized rounded-lg radius) */}
      <div className='p-3 pb-2 flex items-center gap-2 shrink-0'>
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

        {/* Mobile Context Menu (Standardized size-9 rounded-lg button matching search bar) */}
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
                onClick={() => onNewMessage?.()}
                className='text-xs cursor-pointer gap-2'
              >
                <Icons.add className='size-3.5' />
                <span>Pesan Baru</span>
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

        {/* Filter: Selesai */}
        <button
          type='button'
          onClick={() => setActiveTab('closed')}
          className={cn(
            'h-7.5 px-3 rounded-lg text-xs transition-all shrink-0 flex items-center gap-1.5 border-0 outline-none cursor-pointer',
            activeTab === 'closed'
              ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
              : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground font-medium'
          )}
        >
          <span>Selesai</span>
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

            return (
              <button
                type='button'
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={cn(
                  'w-full text-left p-2.5 px-3 cursor-pointer flex items-start gap-2.5 transition-colors border-0 bg-transparent',
                  isSelected ? 'bg-muted/70' : 'hover:bg-muted/30'
                )}
              >
                <div className='relative shrink-0 mt-0.5'>
                  <Avatar className='size-8 rounded-full ring-1 ring-border/40 overflow-hidden'>
                    <AvatarImage
                      src={c.userId ? `/api/v1/users/${c.userId}/avatar` : DEFAULT_AVATAR_PATH}
                      alt={c.customerName || 'Pasien'}
                      className='size-full object-cover aspect-square rounded-full'
                    />
                    <AvatarFallback className='p-0 bg-transparent overflow-hidden'>
                      <Image
                        src={DEFAULT_AVATAR_PATH}
                        alt={c.customerName || 'Pasien'}
                        width={32}
                        height={32}
                        unoptimized
                        className='size-full object-cover rounded-full aspect-square'
                      />
                    </AvatarFallback>
                  </Avatar>
                  {(c.unreadCount || 0) > 0 && (
                    <span className='absolute -top-1 -right-1 size-3.5 bg-primary text-primary-foreground rounded-full text-[8.5px] font-bold flex items-center justify-center border border-background shadow-xs'>
                      {c.unreadCount}
                    </span>
                  )}
                </div>

                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between'>
                    <span className='text-xs font-semibold text-foreground truncate'>
                      {c.customerName || 'Pasien'}
                    </span>
                    <span className='text-[9.5px] text-muted-foreground tabular-nums'>
                      {formatConversationTime(c.lastMessageAt)}
                    </span>
                  </div>

                  <p className='text-[10.5px] text-muted-foreground truncate mt-0.5'>
                    {c.lastMessagePreview || 'Belum ada pesan'}
                  </p>

                  <div className='mt-1 flex items-center gap-1.5'>
                    {c.status === 'closed' ? (
                      <span className='inline-flex items-center px-1.5 py-0.2 rounded-full text-[8.5px] font-medium bg-zinc-500/10 text-zinc-500 border border-zinc-500/20'>
                        Selesai
                      </span>
                    ) : c.awaitingReply ? (
                      <span className='inline-flex items-center px-1.5 py-0.2 rounded-full text-[8.5px] font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20'>
                        Menunggu Balasan
                      </span>
                    ) : (
                      <span className='inline-flex items-center px-1.5 py-0.2 rounded-full text-[8.5px] font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'>
                        Terjawab
                      </span>
                    )}
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
