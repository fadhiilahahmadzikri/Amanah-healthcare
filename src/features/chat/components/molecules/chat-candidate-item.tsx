'use client';

import * as React from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import type { ChatCandidateUser } from '../../utils/types';

export interface ChatCandidateItemProps {
  candidate: ChatCandidateUser;
  onClick: () => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Chat Candidate Patient Item Molecule
 * Clean WhatsApp-style contact list tile for initiating new conversations.
 */
export function ChatCandidateItem({
  candidate,
  onClick,
  isLoading = false,
  className
}: ChatCandidateItemProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        'w-full text-left p-3 px-3.5 cursor-pointer flex items-center gap-3 transition-colors border-0 bg-transparent hover:bg-muted/40 active:bg-muted/60 disabled:opacity-50 disabled:cursor-not-allowed group',
        className
      )}
    >
      <div className='relative shrink-0'>
        <Avatar className='size-9 rounded-full ring-1 ring-border/40 overflow-hidden'>
          <AvatarImage
            src={candidate.avatarUrl || `/api/v1/users/${candidate.id}/avatar`}
            alt={candidate.name}
            className='size-full object-cover aspect-square rounded-full'
          />
          <AvatarFallback className='p-0 bg-transparent overflow-hidden'>
            <Image
              src={DEFAULT_AVATAR_PATH}
              alt={candidate.name}
              width={36}
              height={36}
              unoptimized
              className='size-full object-cover rounded-full aspect-square'
            />
          </AvatarFallback>
        </Avatar>
      </div>

      <div className='flex-1 min-w-0'>
        <span className='text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors block'>
          {candidate.name}
        </span>

        <p className='text-[11px] text-muted-foreground truncate mt-0.5'>
          {candidate.email}
        </p>

        {candidate.existingConversationId && (
          <div className='mt-1 flex items-center gap-1 text-[9.5px] text-primary/80 font-medium'>
            <Icons.chat className='size-3 shrink-0' />
            <span>Percakapan aktif</span>
          </div>
        )}
      </div>

      {isLoading && (
        <Icons.spinner className='size-4 animate-spin text-muted-foreground shrink-0 ml-1' />
      )}
    </button>
  );
}
