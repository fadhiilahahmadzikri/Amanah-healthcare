'use client';

import React from 'react';
import { DEFAULT_AVATAR_PATH } from '@/constants/avatar.constants';

export interface ToastAvatarProps {
  avatar: string | React.ReactNode;
  alt?: string;
  size?: number;
  className?: string;
}

export const ToastAvatar: React.FC<ToastAvatarProps> = ({
  avatar,
  alt = 'Avatar',
  size = 38,
  className = ''
}) => {
  if (typeof avatar === 'string') {
    return (
      <div
        className={`relative shrink-0 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 shadow-xs bg-muted/40 ${className}`}
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatar || DEFAULT_AVATAR_PATH}
          alt={alt}
          loading='eager'
          decoding='sync'
          className='size-full object-cover object-center'
          onError={(e) => {
            const target = e.currentTarget;
            if (target.src !== DEFAULT_AVATAR_PATH) {
              target.src = DEFAULT_AVATAR_PATH;
            }
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`shrink-0 flex items-center justify-center rounded-xl overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      {avatar}
    </div>
  );
};
