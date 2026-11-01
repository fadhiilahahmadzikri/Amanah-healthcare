'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ShiftIconPickerPopover } from '@/features/jadwal-dokter/components/settings/atoms/shift-icon-picker-popover';
import {
  AccordionSelectionField,
  type AccordionSelectionOption
} from '../atoms/accordion-selection-field';
import { cn } from '@/lib/utils';
import type { FacilityUnitType } from '../../types/clinic-essentials.types';

export interface UnitIdentityStepProps {
  name: string;
  code?: string;
  iconName: string;
  onNameChange: (val: string) => void;
  onCodeChange?: (val: string) => void;
  onIconNameChange: (val: string) => void;
  error?: string;
  disabled?: boolean;
}

export function UnitIdentityStep({
  name,
  iconName,
  onNameChange,
  onIconNameChange,
  error,
  disabled
}: UnitIdentityStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Apa nama poliklinik atau departemen yang ingin didaftarkan?
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Tuliskan nama unit pelayanan klinis dan pilih ikon visual penanda yang mudah dikenali
          dokter maupun pasien.
        </p>
      </div>

      <div className='space-y-3.5 pt-1'>
        <div className='flex items-start gap-3'>
          <div className='space-y-1.5 flex-1 min-w-0'>
            <Label htmlFor='unit-name' className='text-xs font-semibold'>
              Nama Poliklinik / Departemen <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='unit-name'
              placeholder='Contoh: Poliklinik Umum'
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              disabled={disabled}
              className={cn(
                'h-10 text-sm transition-colors',
                error && 'border-destructive focus-visible:ring-destructive'
              )}
              required
            />
            {error && (
              <p className='text-[11px] font-medium text-destructive mt-1 animate-in fade-in duration-200'>
                {error}
              </p>
            )}
          </div>

          <div className='space-y-1.5 shrink-0'>
            <Label className='text-xs font-semibold'>Visual</Label>
            <div className='h-10 flex items-center'>
              <ShiftIconPickerPopover
                value={iconName}
                onChange={onIconNameChange}
                fallback={name.charAt(0) || 'U'}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface UnitClassificationStepProps {
  unitTypeId: string;
  unitTypes?: FacilityUnitType[];
  queuePrefix?: string;
  onUnitTypeIdChange: (val: string) => void;
  onQueuePrefixChange?: (val: string) => void;
  error?: string;
  disabled?: boolean;
}

export function UnitClassificationStep({
  unitTypeId,
  unitTypes = [],
  onUnitTypeIdChange,
  error,
  disabled
}: UnitClassificationStepProps) {
  const typeOptions = React.useMemo<AccordionSelectionOption[]>(() => {
    return unitTypes.map((ut) => ({
      id: ut.id,
      name: ut.name,
      subtitle: ut.description || undefined,
      iconName: ut.iconName || 'layers'
    }));
  }, [unitTypes]);

  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Termasuk ke dalam kelompok fasilitas apa poliklinik ini?
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Pilih klasifikasi jenis fasilitas untuk poliklinik atau departemen ini.
        </p>
      </div>

      <div className='space-y-3.5 pt-1'>
        <AccordionSelectionField
          label='Klasifikasi Tipe Unit'
          placeholder='Pilih klasifikasi jenis fasilitas...'
          actionText='Ganti Klasifikasi'
          selectedId={unitTypeId}
          options={typeOptions}
          onSelect={onUnitTypeIdChange}
          disabled={disabled || unitTypes.length === 0}
          emptyMessage='Belum ada klasifikasi fasilitas terdaftar.'
          required
        />
        {error && (
          <p className='text-[11px] font-medium text-destructive mt-1 animate-in fade-in duration-200'>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export interface UnitLocationStepProps {
  floor: string;
  location: string;
  onFloorChange: (val: string) => void;
  onLocationChange: (val: string) => void;
  isActive?: boolean;
  onIsActiveChange?: (val: boolean) => void;
  isEditing?: boolean;
  disabled?: boolean;
}

export function UnitLocationStep({
  floor,
  location,
  onFloorChange,
  onLocationChange,
  isActive = true,
  onIsActiveChange,
  isEditing = false,
  disabled = false
}: UnitLocationStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Di mana letak ruangan atau sayap gedung poliklinik ini?
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Tentukan lantai dan petunjuk arah agar pasien serta dokter mudah menemukan tempatnya.
        </p>
      </div>

      <div className='space-y-3.5 pt-1'>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
          <div className='space-y-1.5 sm:col-span-1'>
            <Label htmlFor='unit-floor' className='text-xs font-semibold'>
              Lantai
            </Label>
            <Input
              id='unit-floor'
              placeholder='Contoh: 1'
              value={floor}
              onChange={(e) => onFloorChange(e.target.value)}
              disabled={disabled}
              className='h-10 text-sm'
            />
          </div>

          <div className='space-y-1.5 sm:col-span-2'>
            <Label htmlFor='unit-location' className='text-xs font-semibold'>
              Petunjuk Arah / Sayap Gedung
            </Label>
            <Input
              id='unit-location'
              placeholder='Contoh: Gedung A Sayap Barat'
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              disabled={disabled}
              className='h-10 text-sm'
            />
          </div>
        </div>

        {isEditing && onIsActiveChange && (
          <div className='flex items-center justify-between p-3 rounded-xl border border-border/70 bg-muted/20'>
            <div className='space-y-0.5'>
              <Label htmlFor='unit-active' className='text-xs font-semibold cursor-pointer'>
                Status Operasional Aktif
              </Label>
              <p className='text-[11px] text-muted-foreground'>
                Nonaktifkan jika poliklinik ini sedang tutup atau tidak menerima antrean.
              </p>
            </div>
            <Switch
              id='unit-active'
              checked={isActive}
              onCheckedChange={onIsActiveChange}
              disabled={disabled}
            />
          </div>
        )}
      </div>
    </div>
  );
}
