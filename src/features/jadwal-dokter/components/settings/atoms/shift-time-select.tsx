'use client';

import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import {
  formatTimeToHHmm,
  getEffectiveTimeOptions,
  isValidTimeString
} from '../../../utils/shift-time-validator';

export interface ShiftTimeSelectProps {
  value: string;
  onChange: (newValue: string) => void;
  disabled?: boolean;
  className?: string;
  portalContainerRef?: React.RefObject<HTMLElement | null>;
  ariaLabel?: string;
}

export function ShiftTimeSelect({
  value,
  onChange,
  disabled = false,
  className,
  portalContainerRef,
  ariaLabel
}: ShiftTimeSelectProps) {
  const formattedValue = formatTimeToHHmm(value, '00:00');
  const [open, setOpen] = useState(false);
  const [manualInput, setManualInput] = useState(formattedValue);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setManualInput(formattedValue);
    setErrorMsg(null);
  }, [formattedValue, open]);

  const options = getEffectiveTimeOptions(formattedValue);

  const handleApplyManual = () => {
    const trimmed = manualInput.trim();
    if (!isValidTimeString(trimmed)) {
      setErrorMsg('Format harus HH:mm (00:00 - 24:00)');
      return;
    }
    onChange(trimmed);
    setOpen(false);
  };

  const handleSelectPreset = (preset: string) => {
    onChange(preset);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type='button'
          disabled={disabled}
          aria-label={ariaLabel}
          className={cn(
            'flex h-9 w-full items-center justify-between rounded-lg border border-border/80 bg-background px-2.5 py-1 text-xs font-mono shadow-2xs transition-colors hover:bg-muted/40 focus:outline-hidden focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer',
            className
          )}
        >
          <span>{formattedValue}</span>
          <Icons.chevronDown className='size-3.5 text-muted-foreground opacity-60' />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        portalContainerRef={portalContainerRef}
        className='w-56 p-2 space-y-2 font-sans z-[110]'
      >
        {/* Custom Input Header */}
        <div className='space-y-1.5'>
          <div className='flex items-center gap-1.5'>
            <Input
              value={manualInput}
              onChange={(e) => {
                setManualInput(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyManual();
                }
              }}
              placeholder='Contoh: 07:15'
              className='h-7 text-xs font-mono px-2'
              maxLength={5}
            />
            <Button
              type='button'
              size='sm'
              variant='secondary'
              onClick={handleApplyManual}
              className='h-7 px-2 text-[11px] font-semibold cursor-pointer'
            >
              Set
            </Button>
          </div>
          {errorMsg && <p className='text-[10px] text-destructive leading-tight'>{errorMsg}</p>}
        </div>

        {/* Presets List */}
        <div className='space-y-1 pt-1 border-t border-border/50'>
          <span className='text-[10px] font-medium text-muted-foreground'>Pilihan Standar</span>
          <div className='max-h-40 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin'>
            {options.map((time) => {
              const isSelected = time === formattedValue;
              return (
                <button
                  key={time}
                  type='button'
                  onClick={() => handleSelectPreset(time)}
                  className={cn(
                    'flex w-full items-center justify-between px-2 py-1.5 rounded text-xs font-mono cursor-pointer transition-colors text-left',
                    isSelected
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'hover:bg-muted text-foreground'
                  )}
                >
                  <span>{time}</span>
                  {isSelected && <Icons.check className='size-3 stroke-[3]' />}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
