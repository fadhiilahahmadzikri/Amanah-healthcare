'use client';

import * as React from 'react';
import Image from 'next/image';
import * as AvatarPrimitive from '@radix-ui/react-avatar';

import { cn } from '@/lib/utils';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';

function Avatar({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot='avatar'
      className={cn(
        'relative flex size-8 shrink-0 overflow-hidden rounded-full aspect-square',
        className
      )}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot='avatar-image'
      referrerPolicy='no-referrer'
      className={cn(
        'aspect-square size-full object-cover object-top shrink-0 rounded-[inherit]',
        className
      )}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  // If children is empty or is a text string (e.g. initials 'JD', 'AS'), use disk asset SSOT
  const shouldRenderDefaultAsset = !children || typeof children === 'string';

  return (
    <AvatarPrimitive.Fallback
      data-slot='avatar-fallback'
      className={cn(
        'bg-muted flex size-full items-center justify-center aspect-square shrink-0 overflow-hidden rounded-[inherit]',
        className
      )}
      {...props}
    >
      {shouldRenderDefaultAsset ? (
        <Image
          src={DEFAULT_AVATAR_PATH}
          alt='Avatar'
          width={64}
          height={64}
          unoptimized
          className='size-full object-cover object-top aspect-square rounded-[inherit]'
        />
      ) : (
        children
      )}
    </AvatarPrimitive.Fallback>
  );
}

export { Avatar, AvatarImage, AvatarFallback };
