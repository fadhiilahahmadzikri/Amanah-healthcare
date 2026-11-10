import React from 'react';
import { SidebarTrigger } from '../ui/sidebar';
import { Separator } from '../ui/separator';
import { Breadcrumbs } from '../breadcrumbs';
import SearchInput from '../search-input';
import { ThemeSelector } from '../themes/theme-selector';
import { ThemeModeToggle } from '../themes/theme-mode-toggle';
import { NotificationCenter } from '@/features/notifications/components/notification-center';
import { PregnancyCalculatorDialog } from '@/features/pregnancy-calculator';

export default function Header() {
  return (
    <header className='bg-background/95 supports-[backdrop-filter]:bg-background/85 sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-2 backdrop-blur-md border-b border-border/40 md:h-14'>
      <div className='flex items-center gap-2 px-4'>
        <SidebarTrigger className='-ml-1 size-8 sm:size-7 cursor-pointer touch-manipulation' />
        <Separator orientation='vertical' className='mr-2 h-4' />
        <Breadcrumbs />
      </div>

      <div className='flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4'>
        <SearchInput />
        <PregnancyCalculatorDialog />
        <NotificationCenter />
        <ThemeModeToggle />
        <div className='hidden sm:flex items-center'>
          <ThemeSelector />
        </div>
      </div>
    </header>
  );
}
