'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface DoctorAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: number;
  className?: string;
  roundedClassName?: string;
}

export function DoctorAvatar({
  name,
  avatarUrl,
  size = 64,
  className,
  roundedClassName
}: DoctorAvatarProps) {
  const [hasError, setHasError] = useState(false);

  const radiusClass = roundedClassName !== undefined ? roundedClassName : 'rounded-full';

  // Extract initials (e.g. "dr. Maya Indah, Sp.OG" -> "MI" or "SP")
  const cleanName = name
    .replace(/^drg?\.?\s*/i, '')
    .split(',')[0]
    .trim();
  const nameParts = cleanName.split(' ').filter(Boolean);
  const initials =
    nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
      : cleanName.slice(0, 2).toUpperCase() || 'DR';

  if (!avatarUrl || hasError) {
    return (
      <div
        className={cn(
          'w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold select-none text-xs sm:text-sm tracking-wider ring-1 ring-border/40',
          radiusClass,
          className
        )}
      >
        <span>{initials}</span>
      </div>
    );
  }

  return (
    <Image
      src={avatarUrl}
      alt={name}
      width={size}
      height={size}
      unoptimized
      onError={() => setHasError(true)}
      className={cn('w-full h-full object-cover object-center', radiusClass, className)}
    />
  );
}
