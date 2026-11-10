'use client';

import React from 'react';
import type { ToastActionItem } from '../types';

export interface ToastActionButtonProps {
  action?: ToastActionItem;
  variant?: 'primary' | 'secondary';
  textColor?: string;
  className?: string;
}

export const ToastActionButton: React.FC<ToastActionButtonProps> = ({
  action,
  variant = 'primary',
  textColor,
  className = ''
}) => {
  if (!action) return null;

  const baseStyles =
    'px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150 shrink-0 select-none';
  const variantStyles =
    variant === 'primary'
      ? 'bg-foreground/10 hover:bg-foreground/15 text-foreground active:scale-95'
      : 'bg-transparent hover:bg-foreground/5 text-muted-foreground hover:text-foreground active:scale-95';

  return (
    <button
      type='button'
      onClick={action.onClick}
      className={`${baseStyles} ${variantStyles} ${className}`}
      style={textColor ? { color: textColor } : undefined}
    >
      {action.label}
    </button>
  );
};
