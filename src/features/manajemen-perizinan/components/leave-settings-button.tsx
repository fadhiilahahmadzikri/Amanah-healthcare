'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

export type LeaveConfigurationCategory = 'policy';

export interface LeaveSettingsButtonProps {
  onOpenSettings?: () => void;
  onSelectCategory?: (category: LeaveConfigurationCategory) => void;
  activeCategory?: LeaveConfigurationCategory;
  disabled?: boolean;
  className?: string;
  variant?: 'outline' | 'ghost' | 'secondary' | 'default';
  forceMode?: 'dropdown' | 'drawer';
}

export function LeaveSettingsButton({
  onOpenSettings,
  onSelectCategory,
  disabled = false,
  className,
  variant = 'outline'
}: LeaveSettingsButtonProps) {
  const handleClick = () => {
    if (onOpenSettings) {
      onOpenSettings();
    } else if (onSelectCategory) {
      onSelectCategory('policy');
    }
  };

  return (
    <Button
      type='button'
      variant={variant}
      size='icon'
      disabled={disabled}
      aria-label='Buka Pengaturan Kebijakan Cuti'
      title='Pengaturan Kebijakan & Persetujuan Cuti'
      onClick={handleClick}
      className={cn(
        'h-8 w-8 text-muted-foreground hover:text-foreground border-border/80 shrink-0 transition-colors cursor-pointer',
        className
      )}
    >
      <Icons.settings className='size-3.5' />
    </Button>
  );
}
