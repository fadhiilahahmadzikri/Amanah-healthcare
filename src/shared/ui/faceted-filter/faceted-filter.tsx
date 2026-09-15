'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import type { FacetedFilterProps } from './types';

export function FacetedFilter<T = string>({
  title,
  icon: TriggerIcon = Icons.plusCircle,
  options,
  selectedValues,
  onSelect,
  onReset,
  mode = 'multi',
  placeholder = `Cari ${title.toLowerCase()}...`,
  emptyText = `${title} tidak ditemukan.`,
  resetLabel = `Reset ${title}`,
  align = 'start',
  popoverWidth = 'w-52',
  showBadgesInTrigger = true,
  maxTriggerBadges = 2,
  className
}: FacetedFilterProps<T>) {
  const [open, setOpen] = React.useState(false);

  const selectedCount = selectedValues.length;
  const isSelected = (value: T) => selectedValues.includes(value);

  // For single-select mode, get label of selected option if any (excluding 'ALL')
  const singleSelectedLabel = React.useMemo(() => {
    if (mode !== 'single' || selectedCount === 0) return null;
    const current = selectedValues[0];
    if (current === 'ALL' || current === '') return null;
    const option = options.find((opt) => opt.value === current);
    return option ? option.label : String(current);
  }, [mode, options, selectedCount, selectedValues]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className={cn('h-8 border-dashed gap-1.5 text-xs font-sans select-none', className)}
        >
          <TriggerIcon className='size-3.5 text-muted-foreground shrink-0' />
          <span>{title}</span>

          {/* Single-select badge */}
          {mode === 'single' && singleSelectedLabel && (
            <>
              <Separator orientation='vertical' className='mx-0.5 h-3.5' />
              <Badge variant='secondary' className='rounded-sm px-1 font-normal text-[11px]'>
                {singleSelectedLabel}
              </Badge>
            </>
          )}

          {/* Multi-select badges */}
          {mode === 'multi' && selectedCount > 0 && (
            <>
              <Separator orientation='vertical' className='mx-0.5 h-3.5' />
              <Badge variant='secondary' className='rounded-sm px-1 font-normal text-[11px]'>
                {selectedCount}
              </Badge>
              {showBadgesInTrigger && (
                <div className='hidden items-center gap-1 xl:flex'>
                  {selectedCount <= maxTriggerBadges ? (
                    options
                      .filter((opt) => isSelected(opt.value))
                      .map((opt) => (
                        <Badge
                          key={String(opt.value)}
                          variant='secondary'
                          className='rounded-sm px-1 font-normal text-[11px]'
                        >
                          {opt.label}
                        </Badge>
                      ))
                  ) : (
                    <Badge variant='secondary' className='rounded-sm px-1 font-normal text-[11px]'>
                      {selectedCount} dipilih
                    </Badge>
                  )}
                </div>
              )}
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className={cn('p-0', popoverWidth)} align={align}>
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup className='max-h-64 overflow-y-auto'>
              {options.map((option) => {
                const selected = isSelected(option.value);
                return (
                  <CommandItem
                    key={String(option.value)}
                    onSelect={() => {
                      onSelect(option.value);
                      if (mode === 'single') {
                        setOpen(false);
                      }
                    }}
                    className='text-xs cursor-pointer'
                  >
                    <div
                      className={cn(
                        'mr-2 flex size-4 items-center justify-center rounded-[4px] border transition-colors',
                        selected
                          ? 'border-primary bg-primary text-white'
                          : 'border-muted-foreground/40 opacity-60 [&_svg]:invisible'
                      )}
                    >
                      <Icons.check className='size-3 text-white stroke-[3]' />
                    </div>

                    {option.dotColor && (
                      <span
                        className={cn('size-2 rounded-full mr-1.5 shrink-0', option.dotColor)}
                      />
                    )}

                    <span className='truncate'>{option.label}</span>

                    {option.count !== undefined && (
                      <span className='ml-auto font-mono text-[10px] text-muted-foreground'>
                        {option.count}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>

            {onReset && selectedCount > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      onReset();
                      if (mode === 'single') {
                        setOpen(false);
                      }
                    }}
                    className='justify-center text-center text-xs cursor-pointer'
                  >
                    {resetLabel}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
