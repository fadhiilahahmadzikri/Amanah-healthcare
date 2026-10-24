'use client';

import React, { useMemo } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CustomCalendar } from '@/components/ui/custom-calendar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { DateFilterConfig, FacetGroupDefinition } from '../types';

export interface FacetSidebarSheetProps {
  isOpen: boolean;
  onClose: () => void;
  dateFilter?: DateFilterConfig;
  facets: FacetGroupDefinition[];
  isFiltered?: boolean;
  onResetAll?: () => void;
  activeCount?: number;
}

export function FacetSidebarSheet({
  isOpen,
  onClose,
  dateFilter,
  facets,
  isFiltered = false,
  onResetAll,
  activeCount: _activeCount = 0
}: FacetSidebarSheetProps) {
  // Convert selected Date to ISO 'YYYY-MM-DD' for CustomCalendar (animated model from reservasi janji temu)
  const isoDateStr = useMemo(() => {
    if (!dateFilter?.selectedDate) return '';
    const d = dateFilter.selectedDate;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, [dateFilter?.selectedDate]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side='right'
        className='w-full sm:max-w-md p-0 flex flex-col gap-0 border-l border-border/50 bg-card text-card-foreground shadow-2xl font-sans'
      >
        {/* Header Bersih: Tanpa Icon & Tanpa Trailing Badge */}
        <SheetHeader className='p-4 border-b border-border/40 shrink-0 text-left space-y-1'>
          <SheetTitle className='text-sm font-bold text-foreground'>Filter Data</SheetTitle>
          <SheetDescription className='text-xs text-muted-foreground'>
            Sesuaikan parameter filter untuk mempersempit data yang ditampilkan.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className='flex-1 p-4'>
          <div className='space-y-5 pb-6'>
            {/* 1. Date Filter Section (Komponen CustomCalendar Beranimasi dari Reservasi Janji Temu) */}
            {dateFilter && (
              <div className='space-y-2.5 pb-4 border-b border-border/40'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
                    <Icons.calendar className='size-3.5 text-muted-foreground' />
                    {dateFilter.label || 'Tanggal'}
                  </span>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      dateFilter.onSelectDate(dateFilter.defaultDate ?? new Date());
                      onClose();
                    }}
                    className='h-6 text-[11px] px-2 text-muted-foreground hover:text-foreground'
                  >
                    {dateFilter.resetLabel || 'Hari Ini'}
                  </Button>
                </div>
                <div className='rounded-xl border border-border/50 bg-muted/20 p-2.5'>
                  <CustomCalendar
                    value={isoDateStr}
                    onChange={(_isoStr, dateObj) => {
                      dateFilter.onSelectDate(dateObj);
                      onClose();
                    }}
                    selectedDateClassName='bg-primary font-bold text-primary-foreground shadow-2xs'
                  />
                </div>
              </div>
            )}

            {/* 2. Facet Groups */}
            {facets.map((group) => {
              const GroupIcon = group.icon || Icons.filter;
              const hasSelection = group.selectedValues.length > 0;

              return (
                <div
                  key={group.id}
                  className='space-y-2 pb-4 border-b border-border/40 last:border-b-0'
                >
                  <div className='flex items-center justify-between'>
                    <span className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
                      <GroupIcon className='size-3.5 text-muted-foreground' />
                      {group.title}
                    </span>
                    {hasSelection && group.onReset && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          group.onReset?.();
                          onClose();
                        }}
                        className='h-6 text-[11px] px-1.5 text-muted-foreground hover:text-foreground'
                      >
                        Reset
                      </Button>
                    )}
                  </div>

                  <div className='flex flex-wrap gap-1.5 pt-1'>
                    {group.options.map((opt) => {
                      const isSelected = group.selectedValues.includes(opt.value);

                      return (
                        <button
                          key={opt.value}
                          type='button'
                          onClick={() => {
                            group.onSelect(opt.value);
                            onClose();
                          }}
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer border',
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary shadow-2xs font-semibold'
                              : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border/60'
                          )}
                        >
                          {opt.dotColor && (
                            <span className={cn('size-1.5 rounded-full shrink-0', opt.dotColor)} />
                          )}
                          <span>{opt.label}</span>
                          {opt.count !== undefined && (
                            <span
                              className={cn(
                                'text-[10px] font-mono px-1 rounded',
                                isSelected
                                  ? 'bg-primary-foreground/20 text-primary-foreground'
                                  : 'text-muted-foreground'
                              )}
                            >
                              {opt.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <SheetFooter className='p-3 border-t border-border/40 shrink-0 flex flex-row items-center justify-between gap-2 bg-muted/20'>
          {isFiltered && onResetAll ? (
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => {
                onResetAll();
                onClose();
              }}
              className='h-8 text-xs border-dashed text-muted-foreground hover:text-foreground'
            >
              <Icons.refresh className='size-3 mr-1.5' />
              Reset Semua
            </Button>
          ) : (
            <div />
          )}

          <Button
            type='button'
            size='sm'
            onClick={onClose}
            className='h-8 text-xs font-medium px-4 ml-auto'
          >
            Tutup
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
