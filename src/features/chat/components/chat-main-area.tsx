'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import type { ChatMessage, Conversation } from '../utils/types';

interface ChatMainAreaProps {
  conversation?: Conversation;
  messages?: ChatMessage[];
  isClientTyping?: boolean;
  onSendMessage: (text: string) => void;
  onTyping?: (isTyping: boolean) => void;
  onToggleProfile?: () => void;
  onBackToInbox?: () => void;
  className?: string;
}

function formatMessageTime(isoString: string): string {
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

export function ChatMainArea({
  conversation,
  messages = [],
  isClientTyping = false,
  onSendMessage,
  onTyping,
  onToggleProfile,
  onBackToInbox,
  className
}: ChatMainAreaProps) {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, isClientTyping]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onTyping?.(false);
    onSendMessage(inputText);
    setInputText('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    onTyping?.(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!conversation) {
    return (
      <main
        className={cn(
          'flex-1 flex flex-col bg-background/50 border-r border-border/60 p-6',
          className
        )}
      >
        <EmptyState
          icon={Icons.chat}
          title='Belum ada percakapan dipilih'
          description='Pilih percakapan pasien untuk melihat riwayat pesan.'
          className='h-full min-h-[360px] border-0 bg-transparent'
        />
      </main>
    );
  }

  const subtitle = conversation.medicalRecordNumber
    ? `No. RM: ${conversation.medicalRecordNumber}`
    : conversation.guestEmail
      ? `Tamu • ${conversation.guestEmail}`
      : conversation.customerEmail || 'Pasien';

  return (
    <main
      className={cn(
        'flex-1 flex flex-col bg-background/50 min-w-0 border-r border-border/60 select-none',
        className
      )}
    >
      {/* 1. Header with WhatsApp-like Back Button on Mobile */}
      <header className='h-[52px] px-3 sm:px-4 border-b border-border/60 bg-card/60 flex items-center justify-between shrink-0'>
        <div className='flex items-center gap-2 sm:gap-2.5 min-w-0'>
          {/* Back button for mobile navigation */}
          {onBackToInbox && (
            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={onBackToInbox}
              className='size-8.5 p-0 rounded-lg text-muted-foreground hover:text-foreground md:hidden shrink-0 -ml-1 mr-0.5 cursor-pointer'
              title='Kembali ke Inbox'
              aria-label='Kembali ke Inbox'
            >
              <Icons.chevronLeft className='size-4.5' />
            </Button>
          )}

          <div className='relative shrink-0'>
            <Avatar className='size-8 rounded-full ring-1 ring-border/40 overflow-hidden'>
              <AvatarImage
                src={
                  conversation.userId
                    ? `/api/v1/users/${conversation.userId}/avatar`
                    : DEFAULT_AVATAR_PATH
                }
                alt={conversation.customerName || 'Pasien'}
                className='size-full object-cover aspect-square rounded-full'
              />
              <AvatarFallback className='p-0 bg-transparent overflow-hidden'>
                <Image
                  src={DEFAULT_AVATAR_PATH}
                  alt={conversation.customerName || 'Pasien'}
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
                conversation.status === 'open' ? 'bg-emerald-500' : 'bg-zinc-400'
              )}
            />
          </div>

          <div className='flex flex-col min-w-0'>
            <div className='text-xs font-bold text-foreground truncate'>
              {conversation.customerName || 'Pasien'}
            </div>
            <div className='text-[10px] text-muted-foreground leading-tight truncate'>
              {subtitle}
            </div>
          </div>
        </div>

        <div className='flex items-center gap-1.5 shrink-0'>
          {conversation.status === 'closed' && (
            <span className='text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full'>
              Percakapan Selesai
            </span>
          )}
          {onToggleProfile && (
            <Button
              variant='outline'
              size='sm'
              onClick={onToggleProfile}
              className='size-8.5 p-0 rounded-lg text-muted-foreground hover:text-foreground shadow-2xs lg:hidden cursor-pointer'
              title='Lihat Profil Pasien'
              aria-label='Lihat Profil Pasien'
            >
              <Icons.user className='size-4' />
            </Button>
          )}
        </div>
      </header>

      {/* 2. Messages Stream */}
      <div ref={scrollRef} className='flex-1 overflow-y-auto p-4 space-y-3'>
        {messages.length > 0 ? (
          messages.map((m) => {
            const isAdmin = m.senderRole === 'admin';
            return (
              <div
                key={m.id}
                className={cn(
                  'flex flex-col max-w-[85%] sm:max-w-[78%]',
                  isAdmin ? 'items-end self-end ml-auto' : 'items-start mr-auto'
                )}
              >
                <div
                  className={cn(
                    'rounded-[8px] p-2.5 text-[11px] leading-[1.45] shadow-2xs break-words',
                    isAdmin
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border/70 text-foreground'
                  )}
                >
                  {m.body}
                </div>
                <span
                  className={cn(
                    'text-[9px] text-muted-foreground mt-0.5 tabular-nums',
                    isAdmin ? 'pr-1' : 'pl-1'
                  )}
                >
                  {formatMessageTime(m.createdAt)}
                </span>
              </div>
            );
          })
        ) : (
          <EmptyState
            icon={Icons.chat}
            title='Belum ada pesan'
            description='Pesan pasien akan ditampilkan di sini setelah dikirim.'
            className='h-full min-h-[320px] border-0 bg-transparent'
          />
        )}
      </div>

      {/* Typing Indicator */}
      {isClientTyping && (
        <div className='px-4 py-1.5 flex items-center gap-1.5 animate-in fade-in duration-200'>
          <div className='flex items-center gap-1.5 bg-muted/70 px-2.5 py-1 rounded-full border border-border/50 text-[11px] text-muted-foreground'>
            <span>Pasien sedang mengetik</span>
            <span className='flex gap-0.5 items-center ml-0.5'>
              <span className='size-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]' />
              <span className='size-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]' />
              <span className='size-1 rounded-full bg-primary animate-bounce' />
            </span>
          </div>
        </div>
      )}

      {/* 3. Text Composer (Standardized height & touch targets) */}
      <div className='p-3 border-t border-border/60 bg-card/40'>
        {conversation.status === 'open' ? (
          <div className='min-h-[44px] border border-border/80 rounded-xl flex items-center px-3 bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-2xs transition-all gap-2'>
            <input
              type='text'
              aria-label='Tulis pesan balasan untuk pasien'
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder='Tulis pesan balasan untuk pasien...'
              className='flex-1 h-9 text-xs sm:text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none bg-transparent'
            />

            <Button
              type='button'
              size='sm'
              onClick={handleSend}
              disabled={!inputText.trim()}
              className='h-8 px-3 rounded-lg text-xs font-semibold gap-1.5 shadow-2xs shrink-0 cursor-pointer'
            >
              <span>Kirim</span>
              <Icons.arrowRight className='size-3.5' />
            </Button>
          </div>
        ) : (
          <div className='text-center py-2'>
            <span className='text-xs text-muted-foreground'>
              Percakapan ini telah ditutup. Buka percakapan baru untuk mengirim pesan.
            </span>
          </div>
        )}
      </div>
    </main>
  );
}
