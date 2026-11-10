'use client';

import React from 'react';
import { ToastAvatar } from '../atoms/toast-avatar.atom';
import { ToastIcon } from '../atoms/toast-icon.atom';
import type { ToastType } from '../types';

export interface ToastMediaProps {
  avatar?: string | React.ReactNode;
  icon?: React.ReactNode;
  type?: ToastType;
  iconColor?: string;
}

export const ToastMedia: React.FC<ToastMediaProps> = ({
  avatar,
  icon,
  type = 'default',
  iconColor
}) => {
  if (avatar) {
    return <ToastAvatar avatar={avatar} />;
  }

  if (icon) {
    return (
      <div className='shrink-0 flex items-center justify-center' style={{ color: iconColor }}>
        {icon}
      </div>
    );
  }

  return (
    <div className='shrink-0 flex items-center justify-center self-start mt-0.5'>
      <ToastIcon type={type} color={iconColor} size={18} />
    </div>
  );
};
