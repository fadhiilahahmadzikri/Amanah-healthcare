'use client';

import React, { useMemo, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Icons } from '@/components/icons';
import { getStatusConfig } from '@/styles/clinical-tokens';
import { cn } from '@/lib/utils';
import type { Conversation } from '../utils/types';

interface ChatInboxSidebarProps {
  conversations: Conversation[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ChatInboxSidebar({ conversations, selectedId, onSelect }: ChatInboxSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'todo' | 'unread'>('all');

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id_pasien.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.messages.some((m) => m.text.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;

      if (activeTab === 'unread') return c.unread > 0;
      if (activeTab === 'todo') return c.status === 'SUDAH DATANG' || c.status === 'MENUNGGU';

      return true;
    });
  }, [conversations, searchQuery, activeTab]);

  const totalCount = conversations.length;

  return (
    <aside className='w-[270px] border-r border-border/60 bg-card flex flex-col min-w-0 shrink-0 select-none'>
      {/* 1. Header */}
      <div className='p-3 pb-2 border-b border-border/40'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xs font-bold text-foreground'>Inbox Pasien</h2>
          <span className='text-[10px] font-medium text-muted-foreground'>
            {filteredConversations.length} percakapan
          </span>
        </div>
        <p className='text-[10px] text-muted-foreground mt-0.5'>
          Pusat komunikasi & konsultasi pasien
        </p>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className='p-2.5 pb-2 flex items-center gap-1.5'>
        <div className='relative flex-1 flex items-center'>
          <span className='absolute left-2 flex items-center pointer-events-none text-muted-foreground'>
            <Icons.search className='size-3.5' />
          </span>
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Cari pesan atau pasien...'
            className='w-full h-[28px] pl-7 pr-2 bg-background border border-border/80 rounded-[6px] text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors shadow-2xs'
          />
        </div>
        <Button
          variant='outline'
          size='sm'
          className='h-[28px] px-2 text-[10px] text-muted-foreground font-medium flex items-center gap-1 bg-background shadow-2xs'
        >
          <Icons.horizontalSliders className='size-3 text-muted-foreground' />
          <span>Filter</span>
        </Button>
      </div>

      {/* 3. Category Filter Tabs */}
      <div className='px-3 flex items-center border-b border-border/40 text-[11px] font-medium'>
        <button
          onClick={() => setActiveTab('all')}
          className={cn(
            'pb-1.5 transition-colors border-b-2 font-medium',
            activeTab === 'all'
              ? 'text-foreground border-primary'
              : 'text-muted-foreground border-transparent hover:text-foreground'
          )}
        >
          Semua{' '}
          <span className='text-[10px] text-muted-foreground font-normal'>[{totalCount}]</span>
        </button>
        <button
          onClick={() => setActiveTab('todo')}
          className={cn(
            'ml-4 pb-1.5 transition-colors border-b-2 font-medium',
            activeTab === 'todo'
              ? 'text-foreground border-primary'
              : 'text-muted-foreground border-transparent hover:text-foreground'
          )}
        >
          Tindakan
        </button>
        <button
          onClick={() => setActiveTab('unread')}
          className={cn(
            'ml-4 pb-1.5 transition-colors border-b-2 font-medium',
            activeTab === 'unread'
              ? 'text-foreground border-primary'
              : 'text-muted-foreground border-transparent hover:text-foreground'
          )}
        >
          Belum Dibaca
        </button>
      </div>

      {/* 4. Conversation Threads List */}
      <div className='flex-1 overflow-y-auto divide-y divide-border/30'>
        {filteredConversations.length === 0 ? (
          <EmptyState
            icon={Icons.chat}
            title='Belum ada percakapan'
            description='Percakapan pasien akan ditampilkan di sini setelah tersedia.'
            className='min-h-[280px] border-0 bg-transparent px-4'
          />
        ) : (
          filteredConversations.map((c) => {
            const isSelected = selectedId === c.id;
            const lastMessage = c.messages[c.messages.length - 1];
            const statusConfig = getStatusConfig(c.status);

            const initials =
              c.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || '-';

            return (
              <div
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={cn(
                  'p-2.5 px-3 cursor-pointer flex items-start gap-2.5 transition-colors',
                  isSelected ? 'bg-muted/70' : 'hover:bg-muted/30'
                )}
              >
                <div className='relative shrink-0 mt-0.5'>
                  <Avatar className='size-7 rounded-full ring-1 ring-border/40'>
                    <AvatarImage src={c.avatar} alt={c.name} />
                    <AvatarFallback className='text-[9px] bg-primary/10 text-primary font-bold'>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {c.unread > 0 && (
                    <span className='absolute -top-1 -right-1 size-3.5 bg-primary text-primary-foreground rounded-full text-[8.5px] font-bold flex items-center justify-center border border-background shadow-xs'>
                      {c.unread}
                    </span>
                  )}
                </div>

                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between'>
                    <span className='text-[11.5px] font-semibold text-foreground truncate'>
                      {c.name}
                    </span>
                    <span className='text-[10px] text-muted-foreground tabular-nums'>{c.time}</span>
                  </div>

                  <p className='text-[10.5px] text-muted-foreground truncate mt-0.5'>
                    {lastMessage ? lastMessage.text : 'Belum ada pesan'}
                  </p>

                  {/* Status Pill Badge with Clinical Tokens */}
                  <div className='mt-1.5 flex items-center'>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold border backdrop-blur-xs select-none',
                        statusConfig.pillBg,
                        statusConfig.pillBorder
                      )}
                    >
                      <span
                        className={cn(
                          'size-1.5 rounded-full shrink-0 ring-1 ring-white/60 dark:ring-white/20',
                          statusConfig.dotGradient
                        )}
                      />
                      <span
                        className={cn(
                          'bg-clip-text text-transparent font-bold tracking-tight',
                          statusConfig.textGradient
                        )}
                      >
                        {statusConfig.label}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
