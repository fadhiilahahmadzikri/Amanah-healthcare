'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, Loader2 } from 'lucide-react';
import type { ToastType } from '../types';

export interface ToastIconProps {
  type?: ToastType;
  color?: string;
  size?: number;
  className?: string;
}

export const ToastIcon: React.FC<ToastIconProps> = ({
  type = 'default',
  color,
  size = 18,
  className = ''
}) => {
  const iconProps = {
    size,
    style: color ? { color } : undefined,
    className: `shrink-0 ${className}`
  };

  switch (type) {
    case 'success':
      return <CheckCircle2 {...iconProps} />;
    case 'error':
      return <AlertCircle {...iconProps} />;
    case 'warning':
      return <AlertTriangle {...iconProps} />;
    case 'loading':
      return <Loader2 {...iconProps} className={`${iconProps.className} animate-spin`} />;
    case 'info':
    case 'default':
    default:
      return <Info {...iconProps} />;
  }
};
