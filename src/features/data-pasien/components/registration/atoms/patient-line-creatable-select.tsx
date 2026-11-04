'use client';

import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

export interface PatientLineCreatableSelectProps {
  id: string;
  label: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[] | string[];
  placeholder?: string;
  customInputPlaceholder?: string;
  error?: string;
  invalid?: boolean;
  disabled?: boolean;
  containerClassName?: string;
  className?: string;
}

export function PatientLineCreatableSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = 'Pilih atau ketik sendiri...',
  customInputPlaceholder = 'Ketik pilihan sendiri...',
  error,
  invalid,
  disabled,
  containerClassName,
  className
}: PatientLineCreatableSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [manualInput, setManualInput] = React.useState(value || '');

  React.useEffect(() => {
    setManualInput(value || '');
  }, [value, isOpen]);

  const isInvalid = Boolean(invalid || error);
  const hasValue = Boolean(value && String(value).trim().length > 0);
  const isFloating = isOpen || hasValue;

  const handleApplyManual = () => {
    const trimmed = manualInput.trim();
    if (trimmed) {
      onChange(trimmed);
      setIsOpen(false);
    }
  };

  const handleSelectPreset = (preset: string) => {
    onChange(preset);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative pt-3', containerClassName)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <div
          data-slot='line-creatable-group'
          data-invalid={isInvalid}
          className={cn(
            'relative flex items-center justify-between border-b-[1.5px] border-border pb-1.5 transition-colors duration-200',
            isOpen ? 'border-primary' : 'focus-within:border-primary',
            isInvalid && '!border-destructive',
            disabled && 'opacity-60 pointer-events-none'
          )}
        >
          <PopoverTrigger asChild>
            <button
              id={id}
              type='button'
              disabled={disabled}
              className={cn(
                'w-full cursor-pointer rounded-none border-0 bg-transparent px-0 py-1 text-left text-sm font-medium shadow-none outline-none select-none',
                isFloating ? 'text-foreground' : 'text-transparent',
                className
              )}
            >
              <span>{hasValue ? value : placeholder}</span>
            </button>
          </PopoverTrigger>

          <label
            htmlFor={id}
            className={cn(
              'absolute left-0 pointer-events-none origin-left select-none transition-all duration-200 ease-out',
              isFloating
                ? '-top-3 text-[11px] font-semibold text-primary'
                : 'top-1 text-sm font-normal text-muted-foreground/70',
              isFloating && !isOpen && 'text-muted-foreground',
              isInvalid && '!text-destructive'
            )}
          >
            {label}
          </label>

          <div className='pointer-events-none flex shrink-0 items-center justify-center pl-2 text-muted-foreground transition-transform duration-200'>
            <Icons.chevronDown
              className={cn(
                'size-4 transition-transform duration-200',
                isOpen && 'rotate-180 text-primary'
              )}
            />
          </div>
        </div>

        <PopoverContent
          align='start'
          className='w-72 p-2.5 space-y-2.5 font-sans z-[110] shadow-xl rounded-xl border border-border bg-card'
        >
          {/* Custom Input Header */}
          <div className='space-y-1.5'>
            <span className='text-[11px] font-medium text-muted-foreground'>
              Ketik Pilihan Sendiri
            </span>
            <div className='flex items-center gap-1.5'>
              <Input
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyManual();
                  }
                }}
                placeholder={customInputPlaceholder}
                className='h-8 text-xs px-2.5'
              />
              <Button
                type='button'
                size='sm'
                variant='secondary'
                onClick={handleApplyManual}
                className='h-8 px-2.5 text-xs font-semibold cursor-pointer'
              >
                Set
              </Button>
            </div>
          </div>

          {/* Presets List */}
          {options && options.length > 0 ? (
            <div className='space-y-1 pt-1.5 border-t border-border/50'>
              <span className='text-[10px] font-medium text-muted-foreground uppercase tracking-wider'>
                Pilihan Standar
              </span>
              <div className='max-h-44 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin'>
                {options.map((opt) => {
                  const isSelected = opt === value;
                  return (
                    <button
                      key={opt}
                      type='button'
                      onClick={() => handleSelectPreset(opt)}
                      className={cn(
                        'flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors text-left',
                        isSelected
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'hover:bg-muted text-foreground'
                      )}
                    >
                      <span>{opt}</span>
                      {isSelected && <Icons.check className='size-3.5 text-primary stroke-[2.5]' />}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
      {error ? <p className='pt-0.5 text-[11px] font-normal text-destructive'>{error}</p> : null}
    </div>
  );
}
