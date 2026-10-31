'use client';

import * as React from 'react';
import { Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ShiftIconDisplay } from '@/features/jadwal-dokter/components/settings/atoms/shift-icon-display';
import type { FacilityUnit } from '../../types/clinic-essentials.types';

export interface RoomParentUnitStepProps {
  unitId: string;
  units: FacilityUnit[];
  onUnitIdChange: (val: string) => void;
  disabled?: boolean;
}

export function RoomParentUnitStep({
  unitId,
  units,
  onUnitIdChange,
  disabled
}: RoomParentUnitStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Pilih Poliklinik Induk
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Pilih poliklinik atau bagian tempat ruangan dokter ini berada.
        </p>
      </div>

      <div className='space-y-3 pt-1'>
        <div className='space-y-1.5'>
          <Label htmlFor='room-parent-unit' className='text-xs font-semibold'>
            Poliklinik Induk <span className='text-destructive'>*</span>
          </Label>
          <Select
            value={unitId}
            onValueChange={onUnitIdChange}
            disabled={disabled || units.length === 0}
          >
            <SelectTrigger id='room-parent-unit' className='h-11 text-sm'>
              <SelectValue placeholder='Pilih poliklinik induk' />
            </SelectTrigger>
            <SelectContent>
              {units.map((u) => (
                <SelectItem key={u.id} value={u.id} className='text-xs'>
                  <div className='flex items-center gap-2'>
                    <ShiftIconDisplay icon={u.iconName || 'building-2'} size='sm' />
                    <span className='font-medium'>{u.name}</span>
                    <span className='font-mono text-muted-foreground text-[11px]'>({u.code})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
  code: string;
  onNameChange: (val: string) => void;
  onCodeChange: (val: string) => void;
  disabled?: boolean;
}

export function RoomIdentityStep({
  name,
  code,
  onNameChange,
  onCodeChange,
  disabled
}: RoomIdentityStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Nama dan Kode Ruangan
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Tuliskan nama ruangan yang tertera di pintu periksa dan panggilan antrean.
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
            className='h-10 text-sm'
            required
          />
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='room-code' className='text-xs font-semibold'>
            Kode Ruangan <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='room-code'
            placeholder='ruang_periksa_1'
            value={code}
            onChange={(e) => onCodeChange(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
            disabled={disabled}
            className='h-10 text-sm font-mono'
            required
          />
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
  disabled?: boolean;
}

export function RoomLocationStep({
  floor,
  location,
  onFloorChange,
  onLocationChange,
  disabled
}: RoomLocationStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Lokasi dan Posisi Ruangan
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Tuliskan letak lantai dan nomor koridor agar pasien tidak tersasar.
        </p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1'>
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
    </div>
  );
}
