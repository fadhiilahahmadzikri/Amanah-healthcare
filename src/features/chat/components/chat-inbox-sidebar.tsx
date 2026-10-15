'use client';

import React, { useMemo, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { Conversation } from '../utils/types';

interface ChatInboxSidebarProps {
  conversations: Conversation[];
  selectedId: string;
  onSelect: (id: string) => void;
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

export function ChatInboxSidebar({ conversations, selectedId, onSelect }: ChatInboxSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'awaiting' | 'closed'>('all');

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (c.customerName && c.customerName.toLowerCase().includes(q)) ||
        (c.customerEmail && c.customerEmail.toLowerCase().includes(q)) ||
        (c.medicalRecordNumber && c.medicalRecordNumber.toLowerCase().includes(q)) ||
        (c.lastMessagePreview && c.lastMessagePreview.toLowerCase().includes(q));

      if (!matchSearch) return false;

      if (activeTab === 'awaiting') return c.status === 'open' && c.awaitingReply;
      if (activeTab === 'closed') return c.status === 'closed';
      return true;
    });
  }, [conversations, searchQuery, activeTab]);

  const totalCount = conversations.length;
  const awaitingCount = conversations.filter((c) => c.status === 'open' && c.awaitingReply).length;

  return (
    <aside className='w-[270px] border-r border-border/60 bg-card flex flex-col min-w-0 shrink-0 select-none'>
      {/* 1. Header */}
      <div className='p-3 pb-2 border-b border-border/40'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xs font-bold text-foreground'>Inbox Percakapan</h2>
          <span className='text-[10px] font-medium text-muted-foreground'>
            {filteredConversations.length} aktif
          </span>
        </div>
        <p className='text-[10px] text-muted-foreground mt-0.5'>
          Pusat komunikasi pasien & staf klinik
        </p>
      </div>

      {/* 2. Search Bar */}
      <div className='p-2.5 pb-2'>
        <div className='relative flex items-center'>
          <span className='absolute left-2 flex items-center pointer-events-none text-muted-foreground'>
            <Icons.search className='size-3.5' />
          </span>
          <input
            type='text'
            aria-label='Cari pasien atau pesan'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Cari pasien atau pesan...'
            className='w-full h-[28px] pl-7 pr-2 bg-background border border-border/80 rounded-[6px] text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors shadow-2xs'
          />
        </div>
      </div>

      {/* 3. Category Filter Tabs */}
      <div className='px-3 flex items-center border-b border-border/40 text-[11px] font-medium gap-3'>
        <button
          type='button'
          onClick={() => setActiveTab('all')}
          className={cn(
            'pb-1.5 transition-colors border-b-2 font-medium',
            activeTab === 'all'
              ? 'text-foreground border-primary'
              : 'text-muted-foreground border-transparent hover:text-foreground'
          )}
        >
          Semua <span className='text-[9.5px] opacity-70'>[{totalCount}]</span>
        </button>
        <button
          type='button'
          onClick={() => setActiveTab('awaiting')}
          className={cn(
            'pb-1.5 transition-colors border-b-2 font-medium',
            activeTab === 'awaiting'
              ? 'text-foreground border-primary'
              : 'text-muted-foreground border-transparent hover:text-foreground'
          )}
        >
          Perlu Dibalas{' '}
          {awaitingCount > 0 && (
            <span className='text-[9.5px] text-amber-600 font-bold'>[{awaitingCount}]</span>
          )}
        </button>
        <button
          type='button'
          onClick={() => setActiveTab('closed')}
          className={cn(
            'pb-1.5 transition-colors border-b-2 font-medium',
            activeTab === 'closed'
              ? 'text-foreground border-primary'
              : 'text-muted-foreground border-transparent hover:text-foreground'
          )}
        >
          Selesai
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
            const initials =
              c.customerName
                ?.split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || '-';

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
                  <Avatar className='size-7 rounded-full ring-1 ring-border/40'>
                    <AvatarFallback className='text-[9px] bg-primary/10 text-primary font-bold'>
                      {initials}
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
                    <span className='text-[11.5px] font-semibold text-foreground truncate'>
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
