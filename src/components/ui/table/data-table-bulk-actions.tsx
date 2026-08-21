'use client';

import { useState, useEffect, useRef } from 'react';
import { type Table } from '@tanstack/react-table';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Icons } from '@/components/icons';

export interface DataTableBulkActionsProps<TData = any> {
  table?: Table<TData>;
  selectedCount?: number;
  onClearSelection?: () => void;
  entityName?: string;
  children: React.ReactNode;
  className?: string;
}

export function DataTableBulkActions<TData>({
  table,
  selectedCount: customSelectedCount,
  onClearSelection,
  entityName = 'baris',
  children,
  className
}: DataTableBulkActionsProps<TData>): React.ReactNode | null {
  const selectedCount =
    customSelectedCount !== undefined
      ? customSelectedCount
      : table?.getFilteredSelectedRowModel().rows.length || 0;

  const toolbarRef = useRef<HTMLDivElement>(null);
  const [announcement, setAnnouncement] = useState('');

  // Announce selection changes to screen readers
  useEffect(() => {
    if (selectedCount > 0) {
      const message = `${selectedCount} ${entityName}${selectedCount > 1 ? 's' : ''} dipilih. Bilah tindakan massal tersedia.`;

      queueMicrotask(() => {
        setAnnouncement(message);
      });

      const timer = setTimeout(() => setAnnouncement(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [selectedCount, entityName]);

  const handleClearSelection = () => {
    if (onClearSelection) {
      onClearSelection();
    } else if (table) {
      table.resetRowSelection();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const buttons = toolbarRef.current?.querySelectorAll('button');
    if (!buttons) return;

    const currentIndex = Array.from(buttons).findIndex(
      (button) => button === document.activeElement
    );

    switch (event.key) {
      case 'ArrowRight': {
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % buttons.length;
        buttons[nextIndex]?.focus();
        break;
      }
      case 'ArrowLeft': {
        event.preventDefault();
        const prevIndex = currentIndex === 0 ? buttons.length - 1 : currentIndex - 1;
        buttons[prevIndex]?.focus();
        break;
      }
      case 'Home':
        event.preventDefault();
        buttons[0]?.focus();
        break;
      case 'End':
        event.preventDefault();
        buttons[buttons.length - 1]?.focus();
        break;
      case 'Escape': {
        const target = event.target as HTMLElement;
        const activeElement = document.activeElement as HTMLElement;

        const isFromDropdownTrigger =
          target?.getAttribute('data-slot') === 'dropdown-menu-trigger' ||
          activeElement?.getAttribute('data-slot') === 'dropdown-menu-trigger' ||
          target?.closest('[data-slot="dropdown-menu-trigger"]') ||
          activeElement?.closest('[data-slot="dropdown-menu-trigger"]');

        const isFromDropdownContent =
          activeElement?.closest('[data-slot="dropdown-menu-content"]') ||
          target?.closest('[data-slot="dropdown-menu-content"]');

        if (isFromDropdownTrigger || isFromDropdownContent) {
          return;
        }

        event.preventDefault();
        handleClearSelection();
        break;
      }
    }
  };

  return (
    <TooltipProvider delayDuration={250}>
      <div aria-live='polite' aria-atomic='true' className='sr-only' role='status'>
        {announcement}
      </div>

      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            ref={toolbarRef}
            role='toolbar'
            aria-label={`Aksi massal untuk ${selectedCount} ${entityName} terpilih`}
            aria-describedby='bulk-actions-description'
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            initial={{ opacity: 0, y: 35, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 440, damping: 24, mass: 0.8 }}
            className={cn(
              'fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl select-none',
              'focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:outline-none',
              className
            )}
          >
            <div
              className={cn(
                'p-2 rounded-2xl border',
                'border-border/80 dark:border-primary/50',
                'bg-background/95 supports-[backdrop-filter]:bg-background/85 backdrop-blur-xl',
                'shadow-[0_16px_50px_-10px_rgba(0,0,0,0.18)] dark:shadow-[0_0_0_1px_rgba(56,189,248,0.35),0_20px_50px_-10px_rgba(0,0,0,0.95),0_0_35px_rgba(56,189,248,0.25)]',
                'ring-1 ring-black/5 dark:ring-primary/20',
                'flex items-center gap-x-2'
              )}
            >
              {/* Clear Selection Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='outline'
                    size='icon'
                    onClick={handleClearSelection}
                    className='size-7 rounded-full text-muted-foreground hover:text-foreground cursor-pointer transition-transform hover:scale-105 active:scale-95'
                    aria-label='Batalkan pilihan'
                    title='Batalkan pilihan (Escape)'
                  >
                    <Icons.close className='size-3.5' />
                    <span className='sr-only'>Batalkan pilihan</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side='top' className='text-xs'>
                  <p>Batalkan pilihan (Escape)</p>
                </TooltipContent>
              </Tooltip>

              <Separator className='h-4' orientation='vertical' aria-hidden='true' />

              {/* Selected Count Badge & Description */}
              <div
                className='flex items-center gap-x-1.5 text-xs font-semibold text-foreground px-1'
                id='bulk-actions-description'
              >
                <Badge
                  variant='default'
                  className='min-w-5 h-5 px-1.5 rounded-md font-bold text-[11px] bg-primary text-primary-foreground shadow-xs dark:shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                  aria-label={`${selectedCount} dipilih`}
                >
                  {selectedCount}
                </Badge>{' '}
                <span className='hidden sm:inline text-muted-foreground font-medium'>
                  {entityName}
                </span>{' '}
                <span className='text-muted-foreground font-medium'>dipilih</span>
              </div>

              <Separator className='h-4' orientation='vertical' aria-hidden='true' />

              {/* Injected Action Buttons */}
              <div className='flex items-center gap-1.5'>{children}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
}
