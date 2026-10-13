'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import type { ConfigurationCategory } from '../../model/useDoctorScheduleSettingsModal';

export interface DoctorScheduleSettingsButtonProps {
  onSelectCategory: (category: ConfigurationCategory, subView?: 'defs' | 'operating_days') => void;
  activeCategory?: ConfigurationCategory;
  activeSubView?: 'defs' | 'operating_days';
  disabled?: boolean;
  className?: string;
  variant?: 'outline' | 'ghost' | 'secondary' | 'default';
  forceMode?: 'dropdown' | 'drawer';
}

const SETTINGS_ITEMS = [
  {
    category: 'session_defs' as const,
    subView: 'defs' as const,
    title: 'Shift Operasional',
    description: 'Definisi jam kerja dan kuota pasien per sesi',
    icon: Icons.clock
  },
  {
    category: 'session_defs' as const,
    subView: 'operating_days' as const,
    title: 'Hari Operasional',
    description: 'Jadwal buka dan tutup layanan per hari kerja',
    icon: Icons.calendar
  },
  {
    category: 'weekly_templates' as const,
    subView: 'defs' as const,
    title: 'Template Mingguan',
    description: 'Roster default dokter dan alokasi ruangan mingguan',
    icon: Icons.calendar
  },
  {
    category: 'clinic_settings' as const,
    subView: 'defs' as const,
    title: 'Parameter Klinik',
    description: 'Pengaturan booking window, kuota, dan toleransi',
    icon: Icons.settings
  }
];

export function DoctorScheduleSettingsButton({
  onSelectCategory,
  activeCategory,
  activeSubView = 'defs',
  disabled = false,
  className,
  variant = 'outline',
  forceMode
}: DoctorScheduleSettingsButtonProps) {
  const { isOpen: isMobile } = useMediaQuery();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const shouldUseDrawer = forceMode === 'drawer' || (forceMode !== 'dropdown' && isMobile);

  const isItemActive = (cat: ConfigurationCategory, sub?: 'defs' | 'operating_days') => {
    return activeCategory === cat && (!sub || activeSubView === sub);
  };

  const handleSelect = (category: ConfigurationCategory, subView?: 'defs' | 'operating_days') => {
    onSelectCategory(category, subView);
    setIsDrawerOpen(false);
  };

  const triggerButton = (
    <Button
      variant={variant}
      size='icon'
      disabled={disabled}
      aria-label='Buka Pengaturan Operasional & Template Jadwal'
      onClick={shouldUseDrawer ? () => setIsDrawerOpen(true) : undefined}
      className={cn(
        'h-8 w-8 text-muted-foreground hover:text-foreground border-border/80 shrink-0 transition-colors',
        className
      )}
    >
      <Icons.settings className='size-3.5' />
    </Button>
  );

  if (shouldUseDrawer) {
    return (
      <>
        {triggerButton}

        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent className='max-h-[85vh] font-sans'>
            <DrawerHeader className='text-left pb-2'>
              <DrawerTitle className='text-base font-bold text-foreground'>
                Pengaturan & Konfigurasi Jadwal
              </DrawerTitle>
              <DrawerDescription className='text-xs text-muted-foreground'>
                Pilih parameter operasional atau template yang ingin disesuaikan
              </DrawerDescription>
            </DrawerHeader>

            <div className='flex flex-col gap-2 p-4 pt-1'>
              {SETTINGS_ITEMS.map((item) => {
                const isActive = isItemActive(item.category, item.subView);
                const IconComponent = item.icon;

                return (
                  <button
                    key={`${item.category}-${item.subView}`}
                    type='button'
                    onClick={() => handleSelect(item.category, item.subView)}
                    className={cn(
                      'w-full text-left p-3 rounded-xl border transition-colors flex items-center justify-between cursor-pointer select-none group',
                      isActive
                        ? 'bg-primary/10 border-primary/40 text-primary'
                        : 'border-border/60 hover:bg-muted/50 text-foreground'
                    )}
                  >
                    <div className='flex items-center gap-3'>
                      <div
                        className={cn(
                          'size-9 rounded-lg flex items-center justify-center shrink-0',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-primary/10 text-primary'
                        )}
                      >
                        <IconComponent className='size-4' />
                      </div>
                      <div>
                        <p className='text-xs font-semibold group-hover:text-primary transition-colors'>
                          {item.title}
                        </p>
                        <p className='text-[11px] text-muted-foreground'>
                          {item.description}
                        </p>
                      </div>
                    </div>
                    {isActive ? (
                      <Icons.check className='size-4 text-primary shrink-0' />
                    ) : (
                      <Icons.chevronRight className='size-4 text-muted-foreground shrink-0' />
                    )}
                  </button>
                );
              })}
            </div>

            <DrawerFooter className='pt-2.5 pb-4 px-4 border-t border-border/40'>
              <Button
                type='button'
                variant='outline'
                size='card-action'
                shape='pill'
                onClick={() => setIsDrawerOpen(false)}
                className='w-full font-semibold text-xs cursor-pointer'
              >
                Tutup
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  // Desktop DropdownMenu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {triggerButton}
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-52 font-sans p-1'>
        {SETTINGS_ITEMS.map((item) => {
          const isActive = isItemActive(item.category, item.subView);
          const IconComponent = item.icon;

          return (
            <DropdownMenuItem
              key={`${item.category}-${item.subView}`}
              onClick={() => handleSelect(item.category, item.subView)}
              className={cn(
                'cursor-pointer text-xs py-2 flex items-center justify-between',
                isActive && 'bg-primary/10 text-primary font-semibold'
              )}
            >
              <div className='flex items-center gap-2'>
                <IconComponent className='size-3.5 text-muted-foreground shrink-0' />
                <span>{item.title}</span>
              </div>
              {isActive && <Icons.check className='size-3 text-primary shrink-0' />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
