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

export type LeaveConfigurationCategory = 'policy' | 'rates';

export interface LeaveSettingsButtonProps {
  onSelectCategory: (category: LeaveConfigurationCategory) => void;
  activeCategory?: LeaveConfigurationCategory;
  disabled?: boolean;
  className?: string;
  variant?: 'outline' | 'ghost' | 'secondary' | 'default';
  forceMode?: 'dropdown' | 'drawer';
}

const SETTINGS_ITEMS: Array<{
  category: LeaveConfigurationCategory;
  title: string;
  description: string;
}> = [
  {
    category: 'policy',
    title: 'Kebijakan & Persetujuan Cuti',
    description: 'Alur persetujuan, batas kuota, dan minimal pengajuan'
  },
  {
    category: 'rates',
    title: 'Standar Tarif Kompensasi',
    description: 'Tarif dasar per jam dan lembur pengganti dinas'
  }
];

export function LeaveSettingsButton({
  onSelectCategory,
  activeCategory,
  disabled = false,
  className,
  variant = 'outline',
  forceMode
}: LeaveSettingsButtonProps) {
  const { isOpen: isMobile } = useMediaQuery();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const shouldUseDrawer = forceMode === 'drawer' || (forceMode !== 'dropdown' && isMobile);

  const handleSelect = (category: LeaveConfigurationCategory) => {
    onSelectCategory(category);
    setIsDrawerOpen(false);
  };

  const triggerButton = (
    <Button
      variant={variant}
      size='icon'
      disabled={disabled}
      aria-label='Buka Pengaturan Kebijakan & Tarif Kompensasi'
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
                Pengaturan Kebijakan & Tarif
              </DrawerTitle>
              <DrawerDescription className='text-xs text-muted-foreground'>
                Pilih parameter kebijakan cuti atau standar kompensasi yang ingin disesuaikan
              </DrawerDescription>
            </DrawerHeader>

            <div className='flex flex-col gap-2 p-4 pt-1'>
              {SETTINGS_ITEMS.map((item) => {
                const isActive = activeCategory === item.category;

                return (
                  <button
                    key={item.category}
                    type='button'
                    onClick={() => handleSelect(item.category)}
                    className={cn(
                      'w-full text-left p-3.5 rounded-xl border transition-colors flex items-center justify-between cursor-pointer select-none group',
                      isActive
                        ? 'bg-muted border-border text-foreground font-semibold'
                        : 'border-border/60 hover:bg-muted/50 text-foreground'
                    )}
                  >
                    <div>
                      <p className='text-xs font-semibold text-foreground'>{item.title}</p>
                      <p className='text-[11px] text-muted-foreground'>{item.description}</p>
                    </div>
                    {isActive ? (
                      <Icons.check className='size-4 text-foreground shrink-0' />
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
      <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56 font-sans p-1'>
        {SETTINGS_ITEMS.map((item) => {
          const isActive = activeCategory === item.category;

          return (
            <DropdownMenuItem
              key={item.category}
              onClick={() => handleSelect(item.category)}
              className={cn(
                'cursor-pointer text-xs py-2 flex items-center justify-between',
                isActive && 'bg-muted text-foreground font-semibold'
              )}
            >
              <span>{item.title}</span>
              {isActive && <Icons.check className='size-3 text-foreground shrink-0' />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
