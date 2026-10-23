'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';

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

  if (!avatarUrl || hasError) {
    return (
      <Image
        src={DEFAULT_AVATAR_PATH}
        alt={name || 'Avatar'}
        width={size}
        height={size}
        unoptimized
        className={cn('w-full h-full object-cover object-center', radiusClass, className)}
      />
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
