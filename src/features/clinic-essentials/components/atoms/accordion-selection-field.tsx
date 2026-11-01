'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ShiftIconDisplay } from '@/features/jadwal-dokter/components/settings/atoms/shift-icon-display';
import { cn } from '@/lib/utils';

export interface AccordionSelectionOption {
  id: string;
  name: string;
  subtitle?: string;
  iconName?: string | null;
  badge?: string;
}

export interface AccordionSelectionFieldProps {
  label: string;
  placeholder?: string;
  actionText?: string;
  selectedId: string;
  options: AccordionSelectionOption[];
  onSelect: (id: string) => void;
  disabled?: boolean;
  emptyMessage?: string;
  maxHeight?: string;
  className?: string;
  required?: boolean;
}

export function AccordionSelectionField({
  label,
  placeholder = 'Pilih opsi...',
  actionText = 'Ubah',
  selectedId,
  options,
  onSelect,
  disabled = false,
  emptyMessage = 'Belum ada pilihan data yang tersedia.',
  maxHeight = 'max-h-56',
  className = '',
  required = false
}: AccordionSelectionFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  const selectedOption = options.find((opt) => opt.id === selectedId) || null;

  // Animate accordion drawer open/close with in-flow push down (identical to invite-staff-modal)
  useEffect(() => {
    const el = dropdownRef.current;
    if (!el) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (isOpen) {
        gsap.set(el, { height: 'auto', opacity: 1 });
      } else {
        gsap.set(el, { height: 0, opacity: 0 });
      }
      return;
    }

    if (isOpen) {
      gsap.fromTo(
        el,
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.24, ease: 'power2.out' }
      );
    } else {
      gsap.to(el, {
        height: 0,
        opacity: 0,
        duration: 0.16,
        ease: 'power2.in'
      });
    }
  }, [isOpen]);

  const handleSelect = (id: string) => {
    if (disabled) return;
    onSelect(id);
    setIsOpen(false);
  };

  return (
    <div className={cn('space-y-1.5 font-sans', className)}>
      <span className='block text-xs font-semibold text-foreground'>
        {label} {required && <span className='text-destructive'>*</span>}
      </span>

      {/* Trigger Accordion Button */}
      <button
        type='button'
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={cn(
          'w-full flex items-center justify-between p-3 sm:p-3.5 rounded-xl border border-border bg-background hover:border-primary/50 text-left transition-colors cursor-pointer select-none',
          disabled && 'opacity-60 cursor-not-allowed hover:border-border',
          isOpen && 'border-primary/60 ring-2 ring-primary/10'
        )}
      >
        <div className='flex items-center gap-2.5 min-w-0 flex-1'>
          {selectedOption ? (
            <>
              {selectedOption.iconName && (
                <div className='size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0'>
                  <ShiftIconDisplay icon={selectedOption.iconName} size='sm' bare />
                </div>
              )}
              <div className='min-w-0 flex-1'>
                <span className='text-xs sm:text-sm font-bold text-foreground truncate block'>
                  {selectedOption.name}
                </span>
                {selectedOption.subtitle && (
                  <span className='text-[11px] text-muted-foreground truncate block'>
                    {selectedOption.subtitle}
                  </span>
                )}
              </div>
            </>
          ) : (
            <span className='text-xs sm:text-sm font-medium text-muted-foreground'>
              {placeholder}
            </span>
          )}
        </div>

        <span className='text-xs font-semibold text-primary ml-2 shrink-0'>
          {isOpen ? 'Tutup' : selectedOption ? `${actionText}` : 'Pilih'}
        </span>
      </button>

      {/* GSAP In-Flow Push Down Drawer */}
      <div
        ref={dropdownRef}
        className='overflow-hidden rounded-xl border border-border bg-card'
        style={{
          height: 0,
          opacity: 0
        }}
      >
        {options.length === 0 ? (
          <div className='p-3 text-xs text-muted-foreground text-center'>{emptyMessage}</div>
        ) : (
          <div
            className={cn('overflow-y-auto p-1.5 space-y-1 divide-y divide-border/30', maxHeight)}
          >
            {options.map((option) => {
              const isSelected = option.id === selectedId;
              return (
                <button
                  key={option.id}
                  type='button'
                  onClick={() => handleSelect(option.id)}
                  className={cn(
                    'w-full flex items-center justify-between p-2.5 rounded-lg text-left text-xs transition-colors cursor-pointer select-none',
                    isSelected
                      ? 'bg-primary/10 font-bold text-primary'
                      : 'text-foreground hover:bg-muted/50 font-medium'
                  )}
                >
                  <div className='flex items-center gap-2.5 min-w-0 pr-2 flex-1'>
                    {option.iconName && (
                      <div className='size-7 rounded-md bg-muted flex items-center justify-center shrink-0'>
                        <ShiftIconDisplay icon={option.iconName} size='sm' bare />
                      </div>
                    )}
                    <div className='flex flex-col min-w-0 flex-1'>
                      <span className='truncate font-semibold text-foreground'>{option.name}</span>
                      {option.subtitle && (
                        <span className='text-[10px] text-muted-foreground truncate'>
                          {option.subtitle}
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <span className='text-[11px] font-semibold text-primary shrink-0'>
                      Terpilih
                    </span>
                  )}
                  {!isSelected && option.badge && (
                    <span className='text-[10px] text-muted-foreground font-normal shrink-0'>
                      {option.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
