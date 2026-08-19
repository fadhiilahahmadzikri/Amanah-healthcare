'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { VoiceMemoBubble } from './voice-memo-bubble';
import { cn } from '@/lib/utils';
import type { Conversation } from '../utils/types';

interface ChatMainAreaProps {
  conversation?: Conversation;
  onSendMessage: (text: string) => void;
  onToggleProfile?: () => void;
}

export function ChatMainArea({ conversation, onSendMessage, onToggleProfile }: ChatMainAreaProps) {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!conversation) {
    return (
      <main className='flex-1 flex flex-col items-center justify-center bg-background/50 border-r border-border/60 text-muted-foreground p-6 text-xs'>
        <Icons.chat className='size-10 text-muted-foreground/40 mb-2' />
        <span>Pilih percakapan untuk memulai chat dengan pasien</span>
      </main>
    );
  }

  const initials = conversation.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <main className='flex-1 flex flex-col bg-background/50 min-w-0 border-r border-border/60 select-none'>
      {/* 1. Header */}
      <header className='h-[48px] px-4 border-b border-border/60 bg-card/60 flex items-center justify-between shrink-0'>
        <div className='flex items-center gap-2.5 min-w-0'>
          <div className='relative'>
            <Avatar className='size-7 rounded-full ring-1 ring-border/40'>
              <AvatarImage src={conversation.avatar} alt={conversation.name} />
              <AvatarFallback className='text-[9px] bg-primary/10 text-primary font-bold'>
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className='absolute bottom-0 right-0 size-2 bg-emerald-500 rounded-full ring-1.5 ring-background' />
          </div>

          <div className='flex flex-col min-w-0'>
            <div className='text-xs font-bold text-foreground truncate'>{conversation.name}</div>
            <div className='text-[10px] text-muted-foreground leading-tight'>
              Online • {conversation.id_pasien}
            </div>
          </div>
        </div>

        <div className='flex items-center gap-1.5'>
          <Button
            variant='outline'
            size='sm'
            className='size-7 p-0 rounded-[6px] text-muted-foreground hover:text-foreground shadow-2xs'
          >
            <Icons.search className='size-3.5' />
          </Button>

          {onToggleProfile && (
            <Button
              variant='outline'
              size='sm'
              onClick={onToggleProfile}
              className='size-7 p-0 rounded-[6px] text-muted-foreground hover:text-foreground shadow-2xs lg:hidden'
            >
              <Icons.user className='size-3.5' />
            </Button>
          )}
        </div>
      </header>

      {/* 2. Messages Stream */}
      <div ref={scrollRef} className='flex-1 overflow-y-auto p-4 space-y-3.5'>
        <div className='text-center my-1'>
          <span className='text-[10px] text-muted-foreground bg-muted/60 px-2.5 py-0.5 rounded-full font-medium'>
            Hari Ini • 14 Mei 2026
          </span>
        </div>

        {conversation.messages.map((m) => {
          if (m.type === 'status_update') {
            return (
              <div key={m.id} className='flex flex-col items-center justify-center my-3'>
                <div className='size-5 rounded-[6px] bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center text-[10px] mb-1 ring-1 ring-purple-500/20 shadow-2xs'>
                  <Icons.check className='size-3' />
                </div>
                <span className='text-[10.5px] font-semibold text-foreground'>{m.text}</span>
                <span className='text-[9.5px] text-muted-foreground'>{m.timestamp}</span>
              </div>
            );
          }

          if (m.type === 'audio') {
            const isOutbound = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={cn(
                  'flex flex-col max-w-[80%]',
                  isOutbound ? 'items-end self-end' : 'items-start'
                )}
              >
                <VoiceMemoBubble duration={m.audioDuration || '0:24'} isOutbound={isOutbound} />
                <span
                  className={cn(
                    'text-[9.5px] text-muted-foreground mt-1',
                    isOutbound ? 'pr-1' : 'pl-1'
                  )}
                >
                  {m.timestamp}
                </span>
              </div>
            );
          }

          const isOutbound = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={cn(
                'flex flex-col max-w-[78%]',
                isOutbound ? 'items-end self-end' : 'items-start'
              )}
            >
              <div
                className={cn(
                  'rounded-[8px] p-2.5 text-[11px] leading-[1.45] shadow-2xs break-words',
                  isOutbound
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border/70 text-foreground'
                )}
              >
                {m.text}
              </div>
              <span
                className={cn(
                  'text-[9.5px] text-muted-foreground mt-1 tabular-nums',
                  isOutbound ? 'pr-1' : 'pl-1'
                )}
              >
                {m.timestamp}
              </span>
            </div>
          );
        })}
      </div>

      {/* 3. Composer & Quick Replies */}
      <div className='p-3 pt-1 border-t border-border/60 bg-card/40'>
        {/* Quick Replies Chips */}
        {conversation.quickReplies && conversation.quickReplies.length > 0 && (
          <div className='flex items-center gap-1.5 mb-2 overflow-x-auto pb-1 no-scrollbar'>
            {conversation.quickReplies.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => setInputText(chip)}
                className='h-6 px-2.5 border border-border/80 rounded-full text-[10px] font-medium text-muted-foreground bg-background hover:bg-muted hover:text-foreground transition-colors shrink-0 shadow-2xs'
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className='h-[36px] border border-border/80 rounded-[8px] flex items-center px-2.5 bg-background focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 shadow-2xs transition-all'>
          <button
            type='button'
            className='text-muted-foreground hover:text-foreground mr-1.5 transition-colors'
            title='Kirim Berkas / Gambar'
          >
            <Icons.image className='size-3.5' />
          </button>
          <button
            type='button'
            className='text-muted-foreground hover:text-foreground mr-2 transition-colors'
            title='Jadwalkan Janji Temu'
          >
            <Icons.calendar className='size-3.5' />
          </button>

          <div className='w-[1px] h-3.5 bg-border/80 mr-2' />

          <input
            type='text'
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Tulis pesan untuk pasien...'
            className='flex-1 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none bg-transparent'
          />

          <Button
            size='sm'
            onClick={handleSend}
            disabled={!inputText.trim()}
            className='h-6 px-2.5 rounded-[5px] text-[10px] font-semibold gap-1 ml-1.5 shadow-2xs'
          >
            <span>Kirim</span>
            <Icons.arrowRight className='size-3' />
          </Button>
        </div>
      </div>
    </main>
  );
}
