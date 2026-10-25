'use client';

import React, { useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/shared/ui/search-input';
import { DateFilter } from '@/shared/ui/date-filter';
import { FacetedFilter } from '@/shared/ui/faceted-filter';
import { cn } from '@/lib/utils';
import { FacetTriggerButton } from './atoms/facet-trigger-button';
import { FacetSidebarSheet } from './molecules/facet-sidebar-sheet';
import type { ResponsiveFacetToolboxProps } from './types';

export function ResponsiveFacetToolbox({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Cari...',
  onOpenSearchDialog,
  dateFilter,
  facets,
  isFiltered = false,
  onResetAll,
  activeFilterCount = 0,
  actionsSlot,
  extraRightSlot,
  isCompact = false,
  className
}: ResponsiveFacetToolboxProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery || '');

  React.useEffect(() => {
    setLocalSearch(searchQuery || '');
  }, [searchQuery]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (searchQuery || '')) {
        onSearchChange?.(localSearch);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, searchQuery]);

  // 1. Compact View (<= 50% viewport or mobile)
  if (isCompact) {
    return (
      <>
        <div
          className={cn(
            'flex items-center justify-between gap-2 w-full font-sans select-none shrink-0',
            className
          )}
        >
          {/* Left: Compact Triggers */}
          <div className='flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto scrollbar-none py-0.5'>
            {/* Search Trigger */}
            {onOpenSearchDialog ? (
              <Button
                type='button'
                variant={searchQuery ? 'primary' : 'outline'}
                size='icon'
                onClick={onOpenSearchDialog}
                aria-label='Pencarian data'
                title={searchQuery ? `Pencarian aktif: "${searchQuery}"` : 'Buka dialog pencarian'}
                className={cn(
                  'size-8 rounded-md relative cursor-pointer shrink-0',
                  searchQuery && 'shadow-2xs font-bold'
                )}
              >
                <Icons.search className='size-3.5' />
                {searchQuery && (
                  <span className='absolute -top-1 -right-1 size-2 rounded-full bg-primary-foreground ring-2 ring-primary animate-pulse' />
                )}
              </Button>
            ) : onSearchChange ? (
              <div className='relative w-36 sm:w-44 shrink-0'>
                <SearchInput
                  value={localSearch}
                  onChange={setLocalSearch}
                  placeholder={searchPlaceholder}
                  className='h-8 text-xs'
                />
              </div>
            ) : null}

            {/* Facet Trigger Button (opens right-side sheet) */}
            <FacetTriggerButton
              activeCount={activeFilterCount}
              onClick={() => setIsSidebarOpen(true)}
            />

            {/* Optional Reset Button when filtered */}
            {isFiltered && onResetAll && (
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={onResetAll}
                title='Reset semua filter'
                aria-label='Reset semua filter'
                className='size-8 rounded-md text-muted-foreground hover:text-foreground shrink-0'
              >
                <Icons.refresh className='size-3.5' />
              </Button>
            )}

            {/* Action buttons slot (e.g. Export Icon) */}
            {actionsSlot}
          </div>

          {/* Right Slot (Clock or extra) */}
          {extraRightSlot && (
            <div className='flex items-center gap-1.5 shrink-0'>{extraRightSlot}</div>
          )}
        </div>

        {/* Right-Side Facet Sidebar Sheet */}
        <FacetSidebarSheet
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          dateFilter={dateFilter}
          facets={facets}
          isFiltered={isFiltered}
          onResetAll={onResetAll}
          activeCount={activeFilterCount}
        />
      </>
    );
  }

  // 2. Desktop Inline View (> 50% viewport)
  return (
    <>
      <div
        className={cn(
          'flex flex-wrap items-center justify-between gap-2.5 w-full font-sans select-none shrink-0',
          className
        )}
      >
        {/* Left: Search + Date + Inline Facets */}
        <div className='flex flex-1 flex-wrap items-center gap-2 min-w-0'>
          {/* Search Input */}
          {onSearchChange && (
            <div className='relative min-w-[160px] max-w-[220px]'>
              <SearchInput
                value={localSearch}
                onChange={setLocalSearch}
                placeholder={searchPlaceholder}
                className='h-8 text-xs'
              />
            </div>
          )}

          {/* Date Picker (Calendar Popover) */}
          {dateFilter && (
            <DateFilter
              label={dateFilter.label || 'Tanggal'}
              selectedDate={dateFilter.selectedDate}
              onSelectDate={dateFilter.onSelectDate}
              defaultDate={dateFilter.defaultDate}
              resetLabel={dateFilter.resetLabel || 'Hari Ini'}
            />
          )}

          {/* Inline Dynamic Facet Filters */}
          {facets.map((facet) => (
            <FacetedFilter<string>
              key={facet.id}
              title={facet.title}
              icon={facet.icon}
              mode={facet.mode || 'single'}
              options={facet.options}
              selectedValues={facet.selectedValues}
              onSelect={facet.onSelect}
              onReset={facet.onReset}
              resetLabel={facet.resetLabel}
              popoverWidth={facet.popoverWidth || 'w-52'}
            />
          ))}

          {/* Reset All Button (Identik dengan DoctorScheduleFilters) */}
          {isFiltered && onResetAll && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={onResetAll}
              className='h-8 px-2.5 text-xs border border-dashed border-border text-muted-foreground hover:text-foreground'
            >
              <Icons.close className='size-3.5 mr-1' />
              <span>Reset</span>
            </Button>
          )}

          {/* Actions slot (e.g. Export Data) */}
          {actionsSlot}
        </div>

        {/* Right: Extra actions / Digital Clock */}
        {extraRightSlot && (
          <div className='flex items-center gap-1.5 shrink-0'>{extraRightSlot}</div>
        )}
      </div>

      {/* Render sidebar sheet fallback if opened */}
      <FacetSidebarSheet
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        dateFilter={dateFilter}
        facets={facets}
        isFiltered={isFiltered}
        onResetAll={onResetAll}
        activeCount={activeFilterCount}
      />
    </>
  );
}
