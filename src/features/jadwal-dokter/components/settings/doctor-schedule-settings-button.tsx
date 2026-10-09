'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ConfigurationCategory } from '../../model/useDoctorScheduleSettingsModal';

export interface DoctorScheduleSettingsButtonProps {
  onSelectCategory: (category: ConfigurationCategory) => void;
  disabled?: boolean;
}

export function DoctorScheduleSettingsButton({
  onSelectCategory,
  disabled = false
}: DoctorScheduleSettingsButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='icon'
          disabled={disabled}
          aria-label='Buka Pengaturan Operasional & Template Jadwal'
          className='h-8 w-8 text-muted-foreground hover:text-foreground border-border/80 shrink-0 transition-colors'
        >
          <Icons.settings className='size-3.5' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48 font-sans p-1'>
        <DropdownMenuItem
          onClick={() => onSelectCategory('session_defs')}
          className='cursor-pointer text-xs py-2 flex items-center gap-2'
        >
          <Icons.clock className='size-3.5 text-muted-foreground shrink-0' />
          <span>Shift Operasional</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onSelectCategory('weekly_templates')}
          className='cursor-pointer text-xs py-2 flex items-center gap-2'
        >
          <Icons.calendar className='size-3.5 text-muted-foreground shrink-0' />
          <span>Template Mingguan</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onSelectCategory('clinic_settings')}
          className='cursor-pointer text-xs py-2 flex items-center gap-2'
        >
          <Icons.settings className='size-3.5 text-muted-foreground shrink-0' />
          <span>Parameter Klinik</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
