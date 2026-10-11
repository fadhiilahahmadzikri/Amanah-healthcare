'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { ConfigurationCategory } from '../../model/useDoctorScheduleSettingsModal';

export interface DoctorScheduleSettingsButtonProps {
  onSelectCategory: (category: ConfigurationCategory, subView?: 'defs' | 'operating_days') => void;
  activeCategory?: ConfigurationCategory;
  activeSubView?: 'defs' | 'operating_days';
  disabled?: boolean;
  className?: string;
  variant?: 'outline' | 'ghost' | 'secondary' | 'default';
}

export function DoctorScheduleSettingsButton({
  onSelectCategory,
  activeCategory,
  activeSubView = 'defs',
  disabled = false,
  className,
  variant = 'outline'
}: DoctorScheduleSettingsButtonProps) {
  const isShiftActive = activeCategory === 'session_defs' && activeSubView === 'defs';
  const isOperatingDaysActive =
    activeCategory === 'session_defs' && activeSubView === 'operating_days';
  const isWeeklyTemplatesActive = activeCategory === 'weekly_templates';
  const isClinicSettingsActive = activeCategory === 'clinic_settings';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size='icon'
          disabled={disabled}
          aria-label='Buka Pengaturan Operasional & Template Jadwal'
          className={cn(
            'h-8 w-8 text-muted-foreground hover:text-foreground border-border/80 shrink-0 transition-colors',
            className
          )}
        >
          <Icons.settings className='size-3.5' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-50 font-sans p-1'>
        <DropdownMenuItem
          onClick={() => onSelectCategory('session_defs', 'defs')}
          className={cn(
            'cursor-pointer text-xs py-2 flex items-center justify-between',
            isShiftActive && 'bg-primary/10 text-primary font-semibold'
          )}
        >
          <div className='flex items-center gap-2'>
            <Icons.clock className='size-3.5 text-muted-foreground shrink-0' />
            <span>Shift Operasional</span>
          </div>
          {isShiftActive && <Icons.check className='size-3 text-primary shrink-0' />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onSelectCategory('session_defs', 'operating_days')}
          className={cn(
            'cursor-pointer text-xs py-2 flex items-center justify-between',
            isOperatingDaysActive && 'bg-primary/10 text-primary font-semibold'
          )}
        >
          <div className='flex items-center gap-2'>
            <Icons.calendar className='size-3.5 text-muted-foreground shrink-0' />
            <span>Hari Operasional</span>
          </div>
          {isOperatingDaysActive && <Icons.check className='size-3 text-primary shrink-0' />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onSelectCategory('weekly_templates', 'defs')}
          className={cn(
            'cursor-pointer text-xs py-2 flex items-center justify-between',
            isWeeklyTemplatesActive && 'bg-primary/10 text-primary font-semibold'
          )}
        >
          <div className='flex items-center gap-2'>
            <Icons.calendar className='size-3.5 text-muted-foreground shrink-0' />
            <span>Template Mingguan</span>
          </div>
          {isWeeklyTemplatesActive && <Icons.check className='size-3 text-primary shrink-0' />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onSelectCategory('clinic_settings', 'defs')}
          className={cn(
            'cursor-pointer text-xs py-2 flex items-center justify-between',
            isClinicSettingsActive && 'bg-primary/10 text-primary font-semibold'
          )}
        >
          <div className='flex items-center gap-2'>
            <Icons.settings className='size-3.5 text-muted-foreground shrink-0' />
            <span>Parameter Klinik</span>
          </div>
          {isClinicSettingsActive && <Icons.check className='size-3 text-primary shrink-0' />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
