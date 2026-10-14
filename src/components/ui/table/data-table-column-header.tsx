'use client';

import * as React from 'react';
import type { Column } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Option } from '@/types/data-table';

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.ComponentProps<typeof DropdownMenuTrigger> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  ...props
}: DataTableColumnHeaderProps<TData, TValue>) {
  const canSort = column.getCanSort();
  const canHide = column.getCanHide();
  const canFilter = column.getCanFilter();

  if (!canSort && !canHide && !canFilter) {
    return (
      <div className={cn('text-foreground font-semibold text-[13px]', className)}>
        {title}
      </div>
    );
  }

  const columnMeta = column.columnDef.meta as
    | { options?: Option[]; label?: string; placeholder?: string }
    | undefined;
  const options = columnMeta?.options;
  const rawFilterValue = column.getFilterValue();
  const isFiltered = rawFilterValue !== undefined && rawFilterValue !== null && rawFilterValue !== '';
  const isSorted = column.getIsSorted();

  const [optionSearch, setOptionSearch] = React.useState('');

  const filteredOptions = React.useMemo(() => {
    if (!options || options.length === 0) return [];
    if (!optionSearch.trim()) return options;
    const q = optionSearch.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(q) || opt.value.toLowerCase().includes(q));
  }, [options, optionSearch]);

  const handleTextFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    column.setFilterValue(val.trim() ? val : undefined);
  };

  const handleToggleOption = (val: string) => {
    const current = Array.isArray(rawFilterValue)
      ? [...(rawFilterValue as string[])]
      : typeof rawFilterValue === 'string'
        ? [rawFilterValue]
        : [];
    const idx = current.indexOf(val);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(val);
    }
    column.setFilterValue(current.length > 0 ? current : undefined);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'text-foreground font-semibold text-[13px] hover:text-primary focus:ring-0 data-[state=open]:text-primary -ml-1.5 flex h-8 items-center gap-1.5 rounded-md px-1.5 py-1 focus:outline-none cursor-pointer select-none transition-colors group',
          className
        )}
        {...props}
      >
        <span>{title}</span>
        {isFiltered && (
          <span className='size-1.5 rounded-full bg-primary animate-pulse' title='Filter aktif' />
        )}
        {canSort &&
          (isSorted === 'desc' ? (
            <Icons.chevronDown className='size-3.5 text-primary shrink-0' />
          ) : isSorted === 'asc' ? (
            <Icons.chevronUp className='size-3.5 text-primary shrink-0' />
          ) : (
            <Icons.arrowsSort className='size-3.5 text-muted-foreground/70 group-hover:text-foreground shrink-0 transition-colors' />
          ))}
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-52 p-1.5 shadow-lg border-border/80'>
        {/* In-Table Column Search / Filter (Window Level) */}
        {canFilter && (
          <div
            className='p-1 space-y-1.5'
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {options && options.length > 0 ? (
              <div className='space-y-1.5'>
                <div className='relative flex items-center'>
                  <Icons.search className='size-3 text-muted-foreground absolute left-2 pointer-events-none' />
                  <input
                    type='text'
                    value={optionSearch}
                    onChange={(e) => setOptionSearch(e.target.value)}
                    placeholder={`Cari opsi ${title.toLowerCase()}...`}
                    className='h-7 w-full rounded-md border border-input bg-transparent pl-7 pr-6 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring'
                  />
                  {optionSearch && (
                    <button
                      type='button'
                      onClick={() => setOptionSearch('')}
                      className='absolute right-1.5 text-muted-foreground hover:text-foreground cursor-pointer'
                    >
                      <Icons.close className='size-3' />
                    </button>
                  )}
                </div>
                <div className='max-h-36 overflow-y-auto space-y-0.5 scrollbar-thin'>
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((opt) => {
                      const selectedArr = Array.isArray(rawFilterValue)
                        ? (rawFilterValue as string[])
                        : typeof rawFilterValue === 'string'
                          ? [rawFilterValue]
                          : [];
                      const checked = selectedArr.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type='button'
                          onClick={() => handleToggleOption(opt.value)}
                          className={cn(
                            'w-full flex items-center justify-between px-2 py-1 text-xs rounded-sm hover:bg-muted transition-colors cursor-pointer text-left',
                            checked ? 'font-medium text-primary' : 'text-foreground'
                          )}
                        >
                          <div className='flex items-center gap-1.5 min-w-0'>
                            <div
                              className={cn(
                                'size-3.5 rounded border flex items-center justify-center shrink-0',
                                checked
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-muted-foreground/40'
                              )}
                            >
                              {checked && <Icons.check className='size-2.5 stroke-[3]' />}
                            </div>
                            <span className='truncate'>{opt.label}</span>
                          </div>
                          {opt.count !== undefined && (
                            <span className='text-[10px] text-muted-foreground font-mono'>
                              {opt.count}
                            </span>
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className='py-2 text-center text-xs text-muted-foreground'>
                      Tidak ada opsi cocok
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className='relative flex items-center'>
                <Icons.search className='size-3 text-muted-foreground absolute left-2 pointer-events-none' />
                <input
                  type='text'
                  value={(rawFilterValue as string) ?? ''}
                  onChange={handleTextFilterChange}
                  placeholder={`Cari ${title.toLowerCase()}...`}
                  className='h-7 w-full rounded-md border border-input bg-transparent pl-7 pr-6 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring'
                />
                {isFiltered && (
                  <button
                    type='button'
                    onClick={() => column.setFilterValue(undefined)}
                    className='absolute right-1.5 text-muted-foreground hover:text-foreground cursor-pointer'
                    title='Hapus pencarian kolom'
                  >
                    <Icons.close className='size-3' />
                  </button>
                )}
              </div>
            )}
            {isFiltered && (
              <button
                type='button'
                onClick={() => {
                  column.setFilterValue(undefined);
                  setOptionSearch('');
                }}
                className='w-full text-center text-[11px] text-destructive hover:underline py-0.5 cursor-pointer font-medium'
              >
                Hapus Filter Kolom
              </button>
            )}
            <DropdownMenuSeparator className='my-1' />
          </div>
        )}

        {/* Sort Controls */}
        {canSort && (
          <>
            <DropdownMenuCheckboxItem
              className='[&_svg]:text-muted-foreground relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto text-xs'
              checked={isSorted === 'asc'}
              onClick={() => column.toggleSorting(false)}
            >
              <Icons.chevronUp className='size-3.5' />
              Urutkan ASC
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              className='[&_svg]:text-muted-foreground relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto text-xs'
              checked={isSorted === 'desc'}
              onClick={() => column.toggleSorting(true)}
            >
              <Icons.chevronDown className='size-3.5' />
              Urutkan DESC
            </DropdownMenuCheckboxItem>
            {isSorted && (
              <DropdownMenuItem
                className='[&_svg]:text-muted-foreground pl-2 text-xs text-destructive focus:text-destructive'
                onClick={() => column.clearSorting()}
              >
                <Icons.close className='size-3.5' />
                Reset Urutan
              </DropdownMenuItem>
            )}
            {canHide && <DropdownMenuSeparator className='my-1' />}
          </>
        )}

        {/* Hide Column */}
        {canHide && (
          <DropdownMenuCheckboxItem
            className='[&_svg]:text-muted-foreground relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto text-xs'
            checked={!column.getIsVisible()}
            onClick={() => column.toggleVisibility(false)}
          >
            <Icons.eyeOff className='size-3.5' />
            Sembunyikan
          </DropdownMenuCheckboxItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
