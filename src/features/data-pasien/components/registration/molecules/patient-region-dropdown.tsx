'use client';

import * as React from 'react';
import gsap from 'gsap';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { PatientLineInput } from '../atoms/patient-line-input';
import { PATIENT_REGISTRATION_REGIONS } from '@/features/data-pasien/constants/registration-options';

export interface PatientRegionValues {
  provinsi: string;
  provinsiId: string;
  kabupaten: string;
  kabupatenId: string;
  kecamatan: string;
  kecamatanId: string;
  kelurahan: string;
  kelurahanId: string;
  alamatDetail: string;
}

export interface PatientRegionDropdownProps {
  values: PatientRegionValues;
  onChange: (updates: Partial<PatientRegionValues>) => void;
  errors?: Partial<Record<keyof PatientRegionValues, string>>;
  className?: string;
}

interface RegionItem {
  id: string;
  name: string;
}

// Single custom searchable dropdown matching POC .line-input-group + popup
function SingleRegionField({
  id,
  label,
  value,
  placeholder,
  disabled,
  options,
  onSelect,
  error
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  disabled?: boolean;
  options: RegionItem[];
  onSelect: (item: RegionItem) => void;
  error?: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const popupRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase();
    return options.filter((item) => item.name.toLowerCase().includes(q));
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
      duration: 0.2,
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

  const handleSelectItem = (item: RegionItem) => {
    onSelect(item);
    animateClose(() => setIsOpen(false));
  };

  const isInvalid = Boolean(error);

  return (
    <div ref={containerRef} className='relative space-y-1'>
      <label htmlFor={id} className='block text-xs font-normal text-muted-foreground'>
        {label}*
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
            : 'focus-within:border-primary',
          isInvalid && '!border-destructive'
        )}
      >
        <input
          id={id}
          type='text'
          readOnly
          value={value}
          aria-label={label}
          placeholder={placeholder}
          className='w-full cursor-pointer border-0 bg-transparent px-0 py-1.5 text-sm font-medium text-primary outline-none placeholder:font-normal placeholder:text-muted-foreground/60 pointer-events-none'
        />
        <Icons.chevronDown className='size-4 shrink-0 text-muted-foreground' />
      </div>

      {error ? <p className='pt-0.5 text-[11px] font-normal text-destructive'>{error}</p> : null}

      {/* Embedded dropdown popup with search */}
      <div
        ref={popupRef}
        style={{ display: 'none' }}
        className='mt-2 overflow-hidden rounded-xl border border-border bg-card p-3 shadow-sm'
      >
        <div className='relative mb-2'>
          <input
            ref={searchInputRef}
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={`cari ${label.toLowerCase()}`}
            placeholder={`cari ${label.toLowerCase()}...`}
            className='w-full rounded-lg border border-border bg-muted/40 p-2 text-xs text-foreground outline-none transition-colors focus:border-primary'
          />
        </div>

        <div
          role='listbox'
          aria-label={label}
          className='max-h-44 overflow-y-auto space-y-0.5 text-xs'
        >
          {filteredOptions.length === 0 ? (
            <div className='p-2 text-center text-xs text-muted-foreground'>
              data tidak ditemukan
            </div>
          ) : (
            filteredOptions.map((item) => (
              <button
                key={item.id}
                type='button'
                role='option'
                aria-selected={value.toLowerCase() === item.name.toLowerCase()}
                onClick={() => handleSelectItem(item)}
                className='w-full text-left cursor-pointer rounded-lg p-2 font-medium capitalize text-foreground transition-colors hover:bg-accent select-none'
              >
                {item.name.toLowerCase()}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function PatientRegionDropdown({
  values,
  onChange,
  errors,
  className
}: PatientRegionDropdownProps) {
  // Transform static hierarchical options
  const provinceOptions: RegionItem[] = React.useMemo(() => {
    return PATIENT_REGISTRATION_REGIONS.map((p) => ({
      id: p.value,
      name: p.label
    }));
  }, []);

  const regencyOptions: RegionItem[] = React.useMemo(() => {
    if (!values.provinsiId) return [];
    const prov = PATIENT_REGISTRATION_REGIONS.find((p) => p.value === values.provinsiId);
    return prov ? prov.regencies.map((r) => ({ id: r.value, name: r.label })) : [];
  }, [values.provinsiId]);

  const districtOptions: RegionItem[] = React.useMemo(() => {
    if (!values.provinsiId || !values.kabupatenId) return [];
    const prov = PATIENT_REGISTRATION_REGIONS.find((p) => p.value === values.provinsiId);
    const reg = prov?.regencies.find((r) => r.value === values.kabupatenId);
    return reg ? reg.districts.map((d) => ({ id: d.value, name: d.label })) : [];
  }, [values.provinsiId, values.kabupatenId]);

  const villageOptions: RegionItem[] = React.useMemo(() => {
    if (!values.provinsiId || !values.kabupatenId || !values.kecamatanId) return [];
    const prov = PATIENT_REGISTRATION_REGIONS.find((p) => p.value === values.provinsiId);
    const reg = prov?.regencies.find((r) => r.value === values.kabupatenId);
    const dist = reg?.districts.find((d) => d.value === values.kecamatanId);
    return dist ? dist.villages.map((v) => ({ id: v.value, name: v.label })) : [];
  }, [values.provinsiId, values.kabupatenId, values.kecamatanId]);

  return (
    <div data-slot='patient-region-dropdown' className={cn('space-y-4', className)}>
      {/* Country pill badge matching POC */}
      <div className='inline-flex items-center gap-2 rounded-lg border border-border bg-muted/60 px-3 py-1.5 text-xs font-medium text-primary'>
        <svg
          className='h-3 w-4 shrink-0 overflow-hidden rounded-[2px] border border-slate-300 shadow-xs'
          viewBox='0 0 3 2'
        >
          <rect width='3' height='1' fill='#E70011' />
          <rect y='1' width='3' height='1' fill='#FFFFFF' />
        </svg>
        <span>
          negara: <strong className='font-semibold'>indonesia</strong>
        </span>
        <span className='rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-normal text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'>
          terverifikasi
        </span>
      </div>

      {/* PROVINSI */}
      <SingleRegionField
        id='provinsi'
        label='provinsi'
        value={values.provinsi}
        placeholder='pilih provinsi...'
        options={provinceOptions}
        error={errors?.provinsi}
        onSelect={(item) => {
          onChange({
            provinsi: item.name,
            provinsiId: item.id,
            kabupaten: '',
            kabupatenId: '',
            kecamatan: '',
            kecamatanId: '',
            kelurahan: '',
            kelurahanId: ''
          });
        }}
      />

      {/* KOTA / KABUPATEN */}
      <SingleRegionField
        id='kabupaten'
        label='kota / kabupaten'
        value={values.kabupaten}
        placeholder={
          values.provinsiId ? 'pilih kota / kabupaten...' : 'pilih provinsi terlebih dahulu...'
        }
        disabled={!values.provinsiId}
        options={regencyOptions}
        error={errors?.kabupaten}
        onSelect={(item) => {
          onChange({
            kabupaten: item.name,
            kabupatenId: item.id,
            kecamatan: '',
            kecamatanId: '',
            kelurahan: '',
            kelurahanId: ''
          });
        }}
      />

      {/* KECAMATAN & KELURAHAN (2 columns) */}
      <div className='grid grid-cols-2 gap-3'>
        <SingleRegionField
          id='kecamatan'
          label='kecamatan'
          value={values.kecamatan}
          placeholder={values.kabupatenId ? 'pilih kecamatan...' : 'pilih kota...'}
          disabled={!values.kabupatenId}
          options={districtOptions}
          error={errors?.kecamatan}
          onSelect={(item) => {
            onChange({
              kecamatan: item.name,
              kecamatanId: item.id,
              kelurahan: '',
              kelurahanId: ''
            });
          }}
        />

        <SingleRegionField
          id='kelurahan'
          label='kelurahan / desa'
          value={values.kelurahan}
          placeholder={values.kecamatanId ? 'pilih kelurahan...' : 'pilih kecamatan...'}
          disabled={!values.kecamatanId}
          options={villageOptions}
          error={errors?.kelurahan}
          onSelect={(item) => {
            onChange({
              kelurahan: item.name,
              kelurahanId: item.id
            });
          }}
        />
      </div>

      {/* ALAMAT DETAIL */}
      <PatientLineInput
        id='alamatDetail'
        label='alamat detail (jalan, rt/rw, no. rumah)'
        value={values.alamatDetail}
        placeholder='contoh: jl. mawar no. 12 rt 04/rw 02'
        error={errors?.alamatDetail}
        autoComplete='street-address'
        onChange={(val) => onChange({ alamatDetail: val })}
      />
    </div>
  );
}
