'use client';

import * as React from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatShortDate } from '@/shared/lib/date/format-short-date';
import { cn } from '@/lib/utils';

export interface DateFilterProps {
  label?: string;
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  resetLabel?: string;
  align?: 'start' | 'center' | 'end';
  className?: string;
}

export function DateFilter({
  label = 'Tanggal',
  selectedDate,
  onSelectDate,
  resetLabel = 'Reset Tanggal',
  align = 'start',
  className
}: DateFilterProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className={cn('h-8 border-dashed gap-1.5 text-xs font-sans', className)}
        >
          <Icons.calendar className='size-3.5 text-muted-foreground' />
          <span>{label}</span>
          {selectedDate ? (
            <>
              <Separator orientation='vertical' className='mx-0.5 h-3.5' />
              <Badge variant='secondary' className='rounded-sm px-1 font-normal text-[11px]'>
                {formatShortDate(selectedDate)}
              </Badge>
            </>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align={align}>
        <Calendar
          mode='single'
          selected={selectedDate}
          onSelect={(d) => {
            onSelectDate(d);
            setOpen(false);
          }}
          initialFocus
        />
        {selectedDate ? (
          <div className='p-2 border-t border-border'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                onSelectDate(undefined);
                setOpen(false);
              }}
              className='w-full text-xs h-7 justify-center'
            >
              {resetLabel}
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
