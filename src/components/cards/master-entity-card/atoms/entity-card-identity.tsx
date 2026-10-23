'use client';

import React from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import type { EntityCardIdentityProps } from '../types';

export function EntityCardIdentity({
  name,
  subtitle,
  avatarUrl,
  initials: _initials,
  onNameClick,
  isPending,
  className
}: EntityCardIdentityProps) {
  return (
    <div className={cn('flex items-center gap-3 sm:gap-2.5 relative z-20 min-w-0', className)}>
      <Avatar className='size-11 sm:size-10 xl:size-9 rounded-full ring-2 ring-primary/20 shrink-0 shadow-2xs overflow-hidden'>
        <AvatarImage
          src={avatarUrl || DEFAULT_AVATAR_PATH}
          alt={name}
          className='size-full object-cover aspect-square rounded-full'
        />
        <AvatarFallback className='p-0 bg-transparent'>
          <Image
            src={DEFAULT_AVATAR_PATH}
            alt={name}
            width={64}
            height={64}
            unoptimized
            className='size-full object-cover aspect-square rounded-full'
          />
        </AvatarFallback>
      </Avatar>

      <div className='flex flex-col min-w-0 flex-1 justify-center'>
        <h3
          title={name}
          className='text-[14.5px] sm:text-[13.5px] xl:text-[13px] font-bold text-card-foreground tracking-tight leading-snug truncate'
        >
          <button
            type='button'
            onClick={onNameClick}
            className={cn(
              'text-left transition-colors focus-visible:outline-none cursor-pointer truncate w-full block',
              isPending
                ? 'opacity-90 hover:text-primary'
                : 'hover:text-primary focus-visible:underline'
            )}
          >
            {name}
          </button>
        </h3>

        {typeof subtitle === 'string' ? (
          <p className='text-[12px] sm:text-[11.5px] xl:text-[11px] font-medium text-muted-foreground tracking-tight line-clamp-1 mt-0.5 truncate'>
            {subtitle}
          </p>
        ) : (
          subtitle
        )}
      </div>
    </div>
  );
}
