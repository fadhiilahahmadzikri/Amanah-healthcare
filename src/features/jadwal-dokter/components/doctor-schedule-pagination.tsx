'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';

export interface DoctorSchedulePaginationProps extends React.ComponentProps<'div'> {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export function DoctorSchedulePagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [6, 12, 18, 24, 30],
  className,
  ...props
}: DoctorSchedulePaginationProps) {
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
  const canPrevious = currentPage > 1;
  const canNext = currentPage < pageCount;

  return (
    <div
      className={cn(
        'sticky bottom-0 z-20 flex w-[calc(100%+2rem)] md:w-[calc(100%+3rem)] -mx-4 md:-mx-6 -mb-4 flex-wrap items-center justify-between gap-2 overflow-auto bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 py-3 px-4 md:px-6 border-t border-border shadow-[0_-4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.3)] select-none sm:gap-8 mt-auto',
        className
      )}
      {...props}
    >
      {/* Total Items Info */}
      <div className='text-muted-foreground text-xs sm:text-sm whitespace-nowrap'>
        <span className='font-bold text-foreground'>{totalItems}</span> dokter terdaftar
      </div>

      {/* Pagination Controls */}
      <div className='flex items-center gap-3 sm:gap-6 lg:gap-8'>
        {/* Page Size Selector */}
        <div className='hidden items-center space-x-2 sm:flex'>
          <p className='text-xs sm:text-sm font-medium whitespace-nowrap text-foreground'>
            Kartu per halaman
          </p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              onPageSizeChange(Number(value));
              onPageChange(1);
            }}
          >
            <SelectTrigger className='h-8 w-[4.5rem] text-xs bg-background shadow-2xs border-border/70 [&[data-size]]:h-8'>
              <SelectValue placeholder={`${pageSize}`} />
            </SelectTrigger>
            <SelectContent side='top'>
              {pageSizeOptions.map((opt) => (
                <SelectItem key={opt} value={`${opt}`} className='text-xs'>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Current Page of Total */}
        <div className='flex items-center justify-center text-xs sm:text-sm font-medium whitespace-nowrap text-foreground'>
          Halaman <span className='font-bold text-foreground mx-1'>{currentPage}</span> dari{' '}
          {pageCount}
        </div>

        {/* Page Navigation Buttons */}
        <div className='flex items-center space-x-1.5'>
          {/* First Page */}
          <Button
            aria-label='Ke halaman pertama'
            variant='outline'
            size='icon'
            className='hidden size-8 lg:flex shadow-2xs border-border/70'
            onClick={() => onPageChange(1)}
            disabled={!canPrevious}
          >
            <Icons.chevronsLeft className='size-3.5' />
          </Button>

          {/* Previous Page */}
          <Button
            aria-label='Ke halaman sebelumnya'
            variant='outline'
            size='icon'
            className='size-8 shadow-2xs border-border/70'
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canPrevious}
          >
            <ChevronLeftIcon className='size-3.5' />
          </Button>

          {/* Next Page */}
          <Button
            aria-label='Ke halaman berikutnya'
            variant='outline'
            size='icon'
            className='size-8 shadow-2xs border-border/70'
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canNext}
          >
            <ChevronRightIcon className='size-3.5' />
          </Button>

          {/* Last Page */}
          <Button
            aria-label='Ke halaman terakhir'
            variant='outline'
            size='icon'
            className='hidden size-8 lg:flex shadow-2xs border-border/70'
            onClick={() => onPageChange(pageCount)}
            disabled={!canNext}
          >
            <Icons.chevronsRight className='size-3.5' />
          </Button>
        </div>
      </div>
    </div>
  );
}
