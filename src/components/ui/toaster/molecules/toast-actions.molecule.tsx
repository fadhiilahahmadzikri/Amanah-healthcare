'use client';

import React from 'react';
import { ToastActionButton } from '../atoms/toast-action-button.atom';
import type { ToastActionItem } from '../types';

export interface ToastActionsProps {
  action?: ToastActionItem;
  cancel?: ToastActionItem;
  textColor?: string;
  className?: string;
}

export const ToastActions: React.FC<ToastActionsProps> = ({
  action,
  cancel,
  textColor,
  className = ''
}) => {
  if (!action && !cancel) return null;

  return (
    <div className={`shrink-0 flex items-center gap-1.5 self-center ${className}`}>
      {cancel && (
        <ToastActionButton
          action={cancel}
          variant='secondary'
          textColor={textColor}
        />
      )}
      {action && (
        <ToastActionButton
          action={action}
          variant='primary'
          textColor={textColor}
        />
      )}
    </div>
  );
};
