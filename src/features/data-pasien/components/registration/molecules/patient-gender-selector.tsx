'use client';

import * as React from 'react';
import gsap from 'gsap';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { PatientOptionCard } from '../atoms/patient-option-card';

import type { ReferenceOptionItem } from '@/features/data-pasien/api/patient-reference-service';
import { usePatientFormReferences } from '@/features/data-pasien/model/usePatientFormReferences';

export interface PatientGenderSelectorProps {
  id?: string;
  label?: React.ReactNode;
  value: string;
  onChange: (value: 'Laki-laki' | 'Perempuan' | 'L' | 'P' | string) => void;
  error?: string;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  popupClassName?: string;
  required?: boolean;
  options?: ReferenceOptionItem[];
  placeholder?: string;
  variant?: 'dropdown' | 'cards';
}

export function PatientGenderSelector({
  id = 'genderSelector',
  label,
  value = '',
  onChange,
  error,
  invalid,
  disabled = false,
  className,
  triggerClassName,
  popupClassName,
  required = false,
  options,
  placeholder = 'Pilih jenis kelamin...',
  variant = 'cards'
}: PatientGenderSelectorProps) {
  const references = usePatientFormReferences();
  const availableOptions: ReferenceOptionItem[] = options ?? references.genders;

  // Dropdown state & refs
  const containerRef = React.useRef<HTMLDivElement>(null);
  const popupRef = React.useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  const selectedOption = React.useMemo(() => {
    if (!value) return null;
    const valLower = String(value).trim().toLowerCase();
    return (
      availableOptions.find(
        (opt) =>
          opt.value.toLowerCase() === valLower ||
          opt.label.toLowerCase() === valLower ||
          (valLower === 'l' && (opt.value === 'Laki-laki' || opt.label.includes('Laki'))) ||
          (valLower === 'p' && (opt.value === 'Perempuan' || opt.label.includes('Perempuan')))
      ) ?? null
    );
  }, [availableOptions, value]);

  const displayLabel = selectedOption ? selectedOption.label : value ? String(value) : '';

  const animateOpen = React.useCallback(() => {
    if (!popupRef.current) return;
    gsap.killTweensOf(popupRef.current);
    gsap.fromTo(
      popupRef.current,
      { height: 0, opacity: 0, display: 'block' },
      { height: 'auto', opacity: 1, duration: 0.28, ease: 'power2.out' }
    );
  }, []);

  const animateClose = React.useCallback((onComplete?: () => void) => {
    if (!popupRef.current) return;
    gsap.killTweensOf(popupRef.current);
    gsap.to(popupRef.current, {
      height: 0,
      opacity: 0,
      duration: 0.18,
      ease: 'power2.in',
      onComplete: () => {
        if (popupRef.current) {
          popupRef.current.style.display = 'none';
        }
        onComplete?.();
      }
    });
  }, []);

  const toggleOpen = () => {
    if (disabled) return;
    if (isOpen) {
      animateClose(() => setIsOpen(false));
    } else {
      setIsOpen(true);
      requestAnimationFrame(() => animateOpen());
    }
  };

  React.useEffect(() => {
    if (variant !== 'dropdown') return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (containerRef.current && containerRef.current.contains(target)) {
        return;
      }
      if (isOpen) {
        animateClose(() => setIsOpen(false));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, animateClose, variant]);

  const isInvalid = Boolean(invalid || error);
  const hasValue = Boolean(displayLabel && displayLabel.trim().length > 0);
  const isFloating = isOpen || hasValue;

  if (variant === 'dropdown') {
    return (
      <div ref={containerRef} className={cn('relative pt-3', className)}>
        {label ? (
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
            {required ? <span className='text-destructive'> *</span> : null}
          </label>
        ) : null}

        <div
          id={`trigger-${id}`}
          role='button'
          tabIndex={disabled ? -1 : 0}
          aria-haspopup='dialog'
          aria-expanded={isOpen}
          onClick={toggleOpen}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
              e.preventDefault();
              toggleOpen();
            }
          }}
          className={cn(
            'relative flex cursor-pointer items-center justify-between border-b-[1.5px] border-border pb-1.5 transition-colors duration-200 select-none',
            isOpen ? 'border-primary' : 'focus-within:border-primary hover:border-primary/60',
            isInvalid && '!border-destructive',
            disabled && 'opacity-60 pointer-events-none cursor-not-allowed',
            triggerClassName
          )}
        >
          <input
            id={id}
            type='text'
            readOnly
            value={displayLabel}
            aria-label='Jenis kelamin'
            placeholder={isFloating ? placeholder : ''}
            className='w-full min-w-0 cursor-pointer border-0 bg-transparent px-0 py-1 text-sm font-medium text-foreground outline-none pointer-events-none placeholder:font-normal placeholder:text-muted-foreground/50'
          />
          <Icons.chevronDown
            className={cn(
              'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
              isOpen && 'rotate-180 text-primary'
            )}
          />
        </div>

        {error ? <p className='pt-0.5 text-[11px] font-normal text-destructive'>{error}</p> : null}

        {/* Accordion dropdown wrapper */}
        <div
          ref={popupRef}
          style={{ display: 'none' }}
          className={cn(
            'mt-2 overflow-hidden rounded-2xl border border-border/80 bg-card p-3 sm:p-4 shadow-md transition-colors',
            popupClassName
          )}
        >
          <div className='grid grid-cols-2 gap-2 sm:gap-2.5'>
            {availableOptions.map((item) => {
              const isSelected =
                String(value).toLowerCase() === item.value.toLowerCase() ||
                String(value).toLowerCase() === item.label.toLowerCase() ||
                (String(value).toLowerCase() === 'l' && item.value === 'Laki-laki') ||
                (String(value).toLowerCase() === 'p' && item.value === 'Perempuan');
              const isLaki = item.label.toLowerCase().includes('laki') || item.value === 'L';

              return (
                <button
                  key={item.value}
                  type='button'
                  onClick={() => {
                    onChange(item.value);
                    animateClose(() => setIsOpen(false));
                  }}
                  className={cn(
                    'py-2.5 sm:py-3 px-3 rounded-xl border text-center transition-all cursor-pointer select-none flex items-center justify-center gap-2 font-semibold text-xs leading-none',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground shadow-xs'
                      : 'border-border/80 bg-card text-foreground hover:border-primary/50 hover:bg-muted/20'
                  )}
                >
                  {isLaki ? (
                    <Icons.user className='size-3.5 shrink-0' />
                  ) : (
                    <Icons.userCheck className='size-3.5 shrink-0' />
                  )}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-slot='patient-gender-selector' className={cn('space-y-3', className)}>
      <div className='grid grid-cols-2 gap-3'>
        {availableOptions.map((item) => {
          const isLaki = item.label.toLowerCase().includes('laki') || item.value === 'L';
          const isSelected = value === item.value || value === item.label;

          return (
            <PatientOptionCard
              key={item.value}
              isSelected={isSelected}
              onClick={() => onChange(item.value)}
              className='min-h-[80px] flex-col gap-2 p-4 text-xs font-medium'
            >
              {isLaki ? (
                <Icons.user className='size-5' />
              ) : (
                <Icons.userCheck className='size-5' />
              )}
              <span>{item.label.toLowerCase()}</span>
            </PatientOptionCard>
          );
        })}
      </div>

      {error ? (
        <p className='pt-0.5 text-center text-[11px] font-normal text-destructive'>{error}</p>
      ) : null}
    </div>
  );
}
