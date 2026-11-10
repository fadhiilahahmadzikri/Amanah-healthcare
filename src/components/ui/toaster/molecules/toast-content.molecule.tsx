'use client';

import React from 'react';

export interface ToastContentProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  textColor?: string;
  descriptionColor?: string;
  className?: string;
}

export const ToastContent: React.FC<ToastContentProps> = ({
  title,
  description,
  textColor,
  descriptionColor,
  className = ''
}) => {
  return (
    <div className={`flex-1 min-w-0 flex flex-col gap-0.5 break-words ${className}`}>
      {title && (
        <div
          className='text-[13.5px] font-semibold leading-snug break-words whitespace-normal tracking-tight'
          style={textColor ? { color: textColor } : undefined}
        >
          {title}
        </div>
      )}
      {description && (
        <div
          className='text-[12.5px] font-normal leading-relaxed break-words whitespace-normal opacity-90'
          style={descriptionColor ? { color: descriptionColor } : undefined}
        >
          {description}
        </div>
      )}
    </div>
  );
};
