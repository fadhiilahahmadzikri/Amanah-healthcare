'use client';

import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { Conversation } from '../utils/types';

interface ChatHeaderProps {
  conversation: Conversation;
}

export function ChatHeader({ conversation }: ChatHeaderProps) {
  const initials =
    conversation.name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '-';

  return (
    <header className='flex flex-wrap items-center justify-between gap-3 sm:gap-4'>
      <div className='flex items-center gap-2 sm:gap-3'>
        <div className='relative'>
          <Avatar className='border-border/40 bg-card/80 text-foreground h-10 w-10 rounded-2xl border sm:h-12 sm:w-12 sm:rounded-3xl'>
            <AvatarImage src={conversation.avatar} alt={conversation.name} />
            <AvatarFallback className='bg-primary/20 text-primary rounded-2xl text-sm font-semibold sm:rounded-3xl sm:text-base'>
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
        <div>
          <p className='text-foreground text-sm font-semibold sm:text-base'>
            {conversation.name || '-'}
          </p>
          <p className='text-muted-foreground text-xs sm:text-sm'>
            {conversation.id_pasien || '-'}
          </p>
        </div>
      </div>

      <div className='flex items-center gap-1.5 sm:gap-2'>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='border-border/40 bg-background/60 text-muted-foreground hover:bg-muted/60 size-8 rounded-full border transition sm:size-10'
          aria-label='Start audio call'
        >
          <Icons.phone className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='border-border/40 bg-background/60 text-muted-foreground hover:bg-muted/60 size-8 rounded-full border transition sm:size-10'
          aria-label='Start video call'
        >
          <Icons.video className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
        </Button>
      </div>
    </header>
  );
}
