'use client';

import React from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';
import type { ModalIdentityDto } from '../types';

export interface ModalIdentityCardProps {
  identity?: ModalIdentityDto;
  className?: string;
}

/**
 * Molecule: ModalIdentityCard
 * Agnostic identity presentation block for doctors, clinical staff, or users.
 * Displays avatar on the left, full name, profession/specialty, and optional meta badge.
 */
export function ModalIdentityCard({ identity, className }: ModalIdentityCardProps) {
  if (!identity || !identity.name) return null;

  return (
    <div
      className={`stagger-item stagger-3 w-full mt-4 p-3 rounded-2xl bg-muted/40 dark:bg-muted/20 border border-border/60 flex items-center gap-3 text-left shadow-2xs ${
        className || ''
      }`}
    >
      <Avatar className='size-11 rounded-full ring-2 ring-primary/20 shrink-0 shadow-2xs overflow-hidden'>
        <AvatarImage
          src={identity.avatarUrl || DEFAULT_AVATAR_PATH}
          alt={identity.name}
          className='size-full object-cover aspect-square rounded-full'
        />
        <AvatarFallback className='rounded-full p-0 bg-transparent'>
          <Image
            src={DEFAULT_AVATAR_PATH}
            alt={identity.name}
            width={44}
            height={44}
            unoptimized
            className='size-full object-cover aspect-square rounded-full'
          />
        </AvatarFallback>
      </Avatar>

      <div className='flex flex-col min-w-0 flex-1 justify-center'>
        <div className='flex items-center justify-between gap-1.5'>
          <h4
            className='text-[13.5px] font-bold text-foreground truncate'
            title={identity.name}
          >
            {identity.name}
          </h4>
          {identity.badgeText && (
            <span className='px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 shrink-0'>
              {identity.badgeText}
            </span>
          )}
        </div>
        {identity.role && (
          <p
            className='text-[11.5px] text-muted-foreground font-medium truncate mt-0.5'
            title={identity.role}
          >
            {identity.role}
          </p>
        )}
      </div>
    </div>
  );
}
