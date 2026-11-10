'use client';

import React from 'react';
import { X } from 'lucide-react';

export interface ToastCloseButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  color?: string;
  className?: string;
}

export const ToastCloseButton: React.FC<ToastCloseButtonProps> = ({
  onClick,
  color,
  className = ''
}) => {
  return (
    <button
      type='button'
      onClick={onClick}
      aria-label='Tutup Notifikasi'
      className={`shrink-0 -mr-1 p-1 rounded-md transition-all duration-150 opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring ${className}`}
      style={{ color: color || 'inherit' }}
    >
      <X size={15} />
    </button>
  );
};
