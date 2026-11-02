'use client';

import * as React from 'react';
import gsap from 'gsap';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { ReferenceOptionItem } from '@/features/data-pasien/api/patient-reference-service';
import { usePatientFormReferences } from '@/features/data-pasien/model/usePatientFormReferences';
import { ShiftIconDisplay } from '@/features/jadwal-dokter/components/settings/atoms/shift-icon-display';

export interface PatientRelationshipSelectorProps {
  id?: string;
  label?: React.ReactNode;
  value?: string;
  onChange: (value: string, selectedOption?: ReferenceOptionItem) => void;
  options?: ReferenceOptionItem[];
  placeholder?: string;
  error?: string;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  popupClassName?: string;
  required?: boolean;
  excludeSystem?: boolean;
}

export function PatientRelationshipSelector({
  id = 'relationshipSelector',
  label,
  value = '',
  onChange,
  options,
  placeholder = 'Pilih hubungan dengan pasien...',
  error,
  invalid,
  disabled = false,
  className,
  triggerClassName,
  popupClassName,
  required = false,
  excludeSystem = false
}: PatientRelationshipSelectorProps) {
  const references = usePatientFormReferences();
  const availableOptions: ReferenceOptionItem[] = React.useMemo(() => {
    let opts = options && options.length > 0 ? options : references.relationships;
    if (excludeSystem) {
      opts = opts.filter((o) => !(o as any).isSystem);
    }
    return opts;
  }, [options, references.relationships, excludeSystem]);

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
          (opt as any).id === value
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
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        animateOpen();
      } else {
        animateClose();
      }
      return next;
    });
  };

  const handleSelect = (opt: ReferenceOptionItem) => {
    onChange(opt.value, opt);
    setIsOpen(false);
    animateClose();
  };

  // Close on outside click
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (isOpen) {
          setIsOpen(false);
          animateClose();
        }
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, animateClose]);

  return (
    <div ref={containerRef} className={cn('relative w-full space-y-1.5', className)}>
      {label && (
        <label htmlFor={id} className='text-xs font-semibold text-foreground/90 block'>
          {label}
          {required && <span className='text-destructive ml-0.5'>*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        id={id}
        type='button'
        onClick={toggleOpen}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup='listbox'
        className={cn(
          'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all text-left outline-none',
          'bg-background hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-primary/20',
          invalid || error ? 'border-destructive/60' : 'border-border/80',
          disabled && 'opacity-50 cursor-not-allowed',
          triggerClassName
        )}
      >
        <span
          className={cn(
            'truncate flex items-center gap-1.5',
            !displayLabel && 'text-muted-foreground'
          )}
        >
          {displayLabel ? (
            <>
              <ShiftIconDisplay
                icon={selectedOption?.icon || selectedOption?.iconName || 'user'}
                size='sm'
                bare
                className='size-4 text-primary shrink-0'
              />
              <span>{displayLabel}</span>
            </>
          ) : (
            placeholder
          )}
        </span>
        <Icons.chevronDown
          className={cn(
            'w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0 ml-2',
            isOpen && 'transform rotate-180'
          )}
        />
      </button>

      {/* Dropdown Card */}
      <div
        ref={popupRef}
        style={{ display: 'none' }}
        className={cn(
          'overflow-hidden z-20 w-full rounded-2xl border border-border/80 bg-card p-2.5 shadow-xl space-y-2 mt-1.5',
          popupClassName
        )}
      >
        <div className='grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1'>
          {availableOptions.map((opt) => {
            const isSelected =
              String(value).trim().toLowerCase() === opt.value.toLowerCase() ||
              String(value).trim().toLowerCase() === opt.label.toLowerCase() ||
              (opt as any).id === value;

            return (
              <button
                key={opt.value}
                type='button'
                onClick={() => handleSelect(opt)}
                className={cn(
                  'flex flex-col items-start px-3 py-2 rounded-xl border text-left transition-all',
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                    : 'border-border/60 bg-muted/20 hover:border-border hover:bg-muted/40 text-foreground'
                )}
              >
                <div className='flex items-center justify-between w-full'>
                  <div className='flex items-center gap-1.5 min-w-0'>
                    <ShiftIconDisplay
                      icon={opt.icon || opt.iconName || 'user'}
                      size='sm'
                      bare
                      className='size-4 text-primary shrink-0'
                    />
                    <span className='text-xs font-semibold truncate'>{opt.label}</span>
                  </div>
                  {isSelected && <Icons.check className='w-3.5 h-3.5 text-primary shrink-0' />}
                </div>
                {opt.description && (
                  <span className='text-[10px] text-muted-foreground line-clamp-1 mt-0.5'>
                    {opt.description}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className='text-xs text-destructive font-medium mt-1'>{error}</p>}
    </div>
  );
}
