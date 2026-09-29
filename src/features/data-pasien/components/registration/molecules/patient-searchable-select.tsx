'use client';

import * as React from 'react';
import gsap from 'gsap';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';

export interface PatientSearchableSelectOption {
  id: string;
  name: string;
  label?: string;
  value?: string;
  description?: string | null;
}

export interface PatientSearchableSelectProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  disabled?: boolean;
  options: PatientSearchableSelectOption[];
  onSelect: (item: PatientSearchableSelectOption) => void;
  error?: string;
  isLoading?: boolean;
  parentLabel?: string;
  searchPlaceholder?: string;
  className?: string;
  required?: boolean;
}

export function PatientSearchableSelect({
  id,
  label,
  value,
  placeholder,
  disabled = false,
  options,
  onSelect,
  error,
  isLoading = false,
  parentLabel,
  searchPlaceholder,
  className,
  required = false
}: PatientSearchableSelectProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const popupRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase();
    return options.filter((item) => {
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      return matchName || matchDesc;
    });
  }, [options, searchQuery]);

  const animateOpen = React.useCallback(() => {
    if (!popupRef.current) return;
    gsap.killTweensOf(popupRef.current);
    gsap.fromTo(
      popupRef.current,
      { height: 0, opacity: 0, display: 'block' },
      { height: 'auto', opacity: 1, duration: 0.25, ease: 'power2.out' }
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
      setSearchQuery('');
      requestAnimationFrame(() => {
        animateOpen();
        setTimeout(() => searchInputRef.current?.focus(), 50);
      });
    }
  };

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node) && isOpen) {
        animateClose(() => setIsOpen(false));
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, animateClose]);

  const handleSelectItem = (item: PatientSearchableSelectOption) => {
    onSelect(item);
    animateClose(() => setIsOpen(false));
  };

  const isInvalid = Boolean(error);
  const formattedDisplayValue = value
    ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    : '';

  return (
    <div ref={containerRef} className={cn('relative space-y-1', className)}>
      <label htmlFor={id} className='block text-xs font-normal text-muted-foreground'>
        {label}
        {required ? '*' : ''}
      </label>

      <div
        id={`trigger-${id}`}
        role='button'
        tabIndex={disabled ? -1 : 0}
        aria-haspopup='listbox'
        aria-expanded={isOpen}
        onClick={toggleOpen}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            toggleOpen();
          }
        }}
        className={cn(
          'flex cursor-pointer items-center justify-between border-b-[1.5px] border-border pb-1 transition-colors duration-200 select-none',
          disabled
            ? 'opacity-60 pointer-events-none cursor-not-allowed'
            : 'focus-within:border-primary hover:border-primary/60',
          isInvalid && '!border-destructive'
        )}
      >
        <input
          id={id}
          type='text'
          readOnly
          value={formattedDisplayValue}
          aria-label={label}
          placeholder={placeholder}
          className='w-full cursor-pointer border-0 bg-transparent px-0 py-1.5 text-sm font-medium text-primary outline-none placeholder:font-normal placeholder:text-muted-foreground/60 pointer-events-none'
        />
        <Icons.chevronDown
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180 text-primary'
          )}
        />
      </div>

      {error ? <p className='pt-0.5 text-[11px] font-normal text-destructive'>{error}</p> : null}

      {/* Embedded dropdown popup with search */}
      <div
        ref={popupRef}
        style={{ display: 'none' }}
        className='mt-2 overflow-hidden rounded-xl border border-border bg-card p-3 shadow-md z-30'
      >
        <div className='relative mb-2'>
          <input
            ref={searchInputRef}
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={searchPlaceholder || `Cari ${label.toLowerCase()}`}
            placeholder={searchPlaceholder || `Cari ${label.toLowerCase()}...`}
            className='w-full rounded-lg border border-border bg-muted/40 p-2 text-xs text-foreground outline-none transition-colors focus:border-primary placeholder:text-muted-foreground/60'
          />
        </div>

        <div
          role='listbox'
          aria-label={label}
          className='max-h-44 overflow-y-auto space-y-0.5 text-xs pr-0.5'
        >
          {isLoading ? (
            <div className='p-3.5 text-center text-xs text-muted-foreground flex items-center justify-center gap-2'>
              <Icons.spinner className='size-3.5 animate-spin text-primary' />
              <span>Memuat pilihan {label.toLowerCase()}...</span>
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className='p-3 text-center text-xs text-muted-foreground'>
              {searchQuery.trim()
                ? 'Data tidak ditemukan'
                : parentLabel
                ? `Pilih ${parentLabel.toLowerCase()} terlebih dahulu`
                : `Belum ada pilihan ${label.toLowerCase()}`}
            </div>
          ) : (
            filteredOptions.map((item) => {
              const itemFormatted =
                item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase();
              const isSelected = Boolean(
                value &&
                  (value.toLowerCase() === item.name.toLowerCase() ||
                    (item.id && value === item.id))
              );

              return (
                <button
                  key={item.id}
                  type='button'
                  role='option'
                  aria-selected={isSelected}
                  onClick={() => handleSelectItem(item)}
                  className={cn(
                    'w-full text-left cursor-pointer rounded-lg p-2 font-medium transition-colors select-none flex items-center justify-between gap-2',
                    isSelected
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-foreground hover:bg-accent'
                  )}
                >
                  <span className='truncate'>{itemFormatted}</span>
                  {isSelected && <Icons.check className='size-3.5 text-primary shrink-0' />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientSearchableSelect;
