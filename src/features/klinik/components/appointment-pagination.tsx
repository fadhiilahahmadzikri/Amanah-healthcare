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

export interface AppointmentPaginationProps extends React.ComponentProps<'div'> {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export function AppointmentPagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 30, 50],
  className,
  ...props
}: AppointmentPaginationProps) {
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
      <div className='text-muted-foreground text-xs sm:text-sm whitespace-nowrap'>
        {totalItems} row(s) total.
      </div>
      <div className='flex items-center gap-2 sm:gap-6 lg:gap-8'>
        <div className='hidden items-center space-x-2 sm:flex'>
          <p className='text-xs sm:text-sm font-medium whitespace-nowrap text-foreground'>
            Rows per page
          </p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              onPageSizeChange(Number(value));
              onPageChange(1);
            }}
          >
            <SelectTrigger className='h-8 w-[4.5rem] text-xs [&[data-size]]:h-8'>
              <SelectValue placeholder={`${pageSize}`} />
            </SelectTrigger>
            <SelectContent side='top'>
              {pageSizeOptions.map((pageSizeOpt) => (
                <SelectItem key={pageSizeOpt} value={`${pageSizeOpt}`} className='text-xs'>
                  {pageSizeOpt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex items-center justify-center text-xs sm:text-sm font-medium whitespace-nowrap text-foreground'>
          Page {currentPage} of {pageCount}
        </div>
        <div className='flex items-center space-x-1'>
          <Button
            aria-label='Go to first page'
            variant='outline'
            size='icon'
            className='hidden size-8 lg:flex'
            onClick={() => onPageChange(1)}
            disabled={!canPrevious}
          >
            <Icons.chevronsLeft className='size-3.5' />
          </Button>
          <Button
            aria-label='Go to previous page'
            variant='outline'
            size='icon'
            className='size-8'
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canPrevious}
          >
            <ChevronLeftIcon className='size-3.5' />
          </Button>
          <Button
            aria-label='Go to next page'
            variant='outline'
            size='icon'
            className='size-8'
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canNext}
          >
            <ChevronRightIcon className='size-3.5' />
          </Button>
          <Button
            aria-label='Go to last page'
            variant='outline'
            size='icon'
            className='hidden size-8 lg:flex'
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
