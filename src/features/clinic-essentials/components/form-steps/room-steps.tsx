'use client';

import * as React from 'react';
import { Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  AccordionSelectionField,
  type AccordionSelectionOption
} from '../atoms/accordion-selection-field';
import { cn } from '@/lib/utils';
import type { FacilityUnit } from '../../types/clinic-essentials.types';

export interface RoomParentUnitStepProps {
  unitId: string;
  units: FacilityUnit[];
  onUnitIdChange: (val: string) => void;
  error?: string;
  disabled?: boolean;
}

export function RoomParentUnitStep({
  unitId,
  units,
  onUnitIdChange,
  error,
  disabled
}: RoomParentUnitStepProps) {
  const unitOptions = React.useMemo<AccordionSelectionOption[]>(() => {
    return units.map((u) => ({
      id: u.id,
      name: u.name,
      subtitle:
        u.floor || u.location
          ? `Lantai ${u.floor || '1'}${u.location ? ` • ${u.location}` : ''}`
          : undefined,
      iconName: u.iconName || 'building-2'
    }));
  }, [units]);

  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Di poliklinik atau departemen mana ruangan ini berada?
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Hubungkan ruangan ini dengan unit poliklinik induk tempat dokter dan praktisi akan membuka
          sesi pelayanan.
        </p>
      </div>

      <div className='space-y-3 pt-1'>
        <AccordionSelectionField
          label='Poliklinik Induk'
          placeholder='Pilih poliklinik induk ruangan ini...'
          actionText='Ganti Poliklinik'
          selectedId={unitId}
          options={unitOptions}
          onSelect={onUnitIdChange}
          disabled={disabled || units.length === 0}
          emptyMessage='Belum ada data poliklinik. Silakan buat unit poliklinik terlebih dahulu.'
          required
        />

        {error && (
          <p className='text-[11px] font-medium text-destructive mt-1 animate-in fade-in duration-200'>
            {error}
          </p>
        )}

        {units.length === 0 && (
          <p className='text-xs text-destructive flex items-center gap-1.5 pt-1'>
            <Building2 className='size-3.5' />
            Belum ada data poliklinik. Silakan buat unit poliklinik terlebih dahulu.
          </p>
        )}
      </div>
    </div>
  );
}

export interface RoomIdentityStepProps {
  name: string;
  code?: string;
  onNameChange: (val: string) => void;
  onCodeChange?: (val: string) => void;
  error?: string;
  disabled?: boolean;
}

export function RoomIdentityStep({ name, onNameChange, error, disabled }: RoomIdentityStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Apa nama ruang periksa yang ingin didaftarkan?
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Nama ini akan tertera di pintu periksa dan sistem pengumuman panggilan antrean pasien.
        </p>
      </div>

      <div className='space-y-3.5 pt-1'>
        <div className='space-y-1.5'>
          <Label htmlFor='room-name' className='text-xs font-semibold'>
            Nama Ruang Periksa <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='room-name'
            placeholder='Contoh: Ruang Periksa 1'
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
      </div>
    </div>
  );
}

export interface RoomLocationStepProps {
  floor: string;
  location: string;
  onFloorChange: (val: string) => void;
  onLocationChange: (val: string) => void;
  isActive?: boolean;
  onIsActiveChange?: (val: boolean) => void;
  isEditing?: boolean;
  disabled?: boolean;
}

export function RoomLocationStep({
  floor,
  location,
  onFloorChange,
  onLocationChange,
  isActive = true,
  onIsActiveChange,
  isEditing = false,
  disabled = false
}: RoomLocationStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Di lantai berapa dan di mana posisi ruangan ini?
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Beri petunjuk letak ruangan yang jelas untuk memudahkan alur mobilitas pasien dan staf
          perawat.
        </p>
      </div>

      <div className='space-y-3.5 pt-1'>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
          <div className='space-y-1.5 sm:col-span-1'>
            <Label htmlFor='room-floor' className='text-xs font-semibold'>
              Lantai
            </Label>
            <Input
              id='room-floor'
              placeholder='Contoh: 1'
              value={floor}
              onChange={(e) => onFloorChange(e.target.value)}
              disabled={disabled}
              className='h-10 text-sm'
            />
          </div>

          <div className='space-y-1.5 sm:col-span-2'>
            <Label htmlFor='room-location' className='text-xs font-semibold'>
              Posisi / Koridor
            </Label>
            <Input
              id='room-location'
              placeholder='Contoh: Koridor Barat, Depan Farmasi'
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
              <Label htmlFor='room-active' className='text-xs font-semibold cursor-pointer'>
                Status Operasional Aktif
              </Label>
              <p className='text-[11px] text-muted-foreground'>
                Nonaktifkan jika ruangan ini sedang dalam renovasi atau tidak digunakan.
              </p>
            </div>
            <Switch
              id='room-active'
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
