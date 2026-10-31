'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ShiftIconPickerPopover } from '@/features/jadwal-dokter/components/settings/atoms/shift-icon-picker-popover';

export interface UnitIdentityStepProps {
  name: string;
  code: string;
  iconName: string;
  onNameChange: (val: string) => void;
  onCodeChange: (val: string) => void;
  onIconNameChange: (val: string) => void;
  disabled?: boolean;
}

export function UnitIdentityStep({
  name,
  code,
  iconName,
  onNameChange,
  onCodeChange,
  onIconNameChange,
  disabled
}: UnitIdentityStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Nama dan Kode Poliklinik
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Tuliskan nama unit atau poliklinik baru agar pasien dan staf mudah menemukannya.
        </p>
      </div>

      <div className='space-y-3.5 pt-1'>
        <div className='space-y-1.5'>
          <Label htmlFor='unit-name' className='text-xs font-semibold'>
            Nama Poliklinik / Unit <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='unit-name'
            placeholder='Contoh: Poliklinik Rawat Jalan'
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            disabled={disabled}
            className='h-10 text-sm'
            required
          />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <div className='space-y-1.5'>
            <Label htmlFor='unit-code' className='text-xs font-semibold'>
              Kode Singkat <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='unit-code'
              placeholder='rawat_jalan'
              value={code}
              onChange={(e) =>
                onCodeChange(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))
              }
              disabled={disabled}
              className='h-10 text-sm font-mono'
              required
            />
          </div>

          <div className='space-y-1.5'>
            <Label className='text-xs font-semibold'>Ikon Tampilan</Label>
            <div className='flex items-center gap-2 h-10'>
              <ShiftIconPickerPopover
                value={iconName || 'building-2'}
                onChange={onIconNameChange}
                fallback='U'
                disabled={disabled}
              />
              <span className='text-xs text-muted-foreground truncate'>Pilih ikon atau emoji</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface UnitClassificationStepProps {
  unitType: 'department' | 'polyclinic' | 'ward' | 'emergency' | 'support' | 'other';
  queuePrefix: string;
  onUnitTypeChange: (
    val: 'department' | 'polyclinic' | 'ward' | 'emergency' | 'support' | 'other'
  ) => void;
  onQueuePrefixChange: (val: string) => void;
  disabled?: boolean;
}

export function UnitClassificationStep({
  unitType,
  queuePrefix,
  onUnitTypeChange,
  onQueuePrefixChange,
  disabled
}: UnitClassificationStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Jenis Layanan dan Awalan Antrean
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Pilih jenis layanan serta huruf depan tiket antrean pasien jika dibutuhkan.
        </p>
      </div>

      <div className='space-y-3.5 pt-1'>
        <div className='space-y-1.5'>
          <Label htmlFor='unit-type' className='text-xs font-semibold'>
            Jenis Layanan
          </Label>
          <Select value={unitType} onValueChange={onUnitTypeChange} disabled={disabled}>
            <SelectTrigger id='unit-type' className='h-10 text-sm'>
              <SelectValue placeholder='Pilih jenis layanan' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='polyclinic'>Poliklinik Rawat Jalan</SelectItem>
              <SelectItem value='department'>Departemen Medis</SelectItem>
              <SelectItem value='emergency'>Instalasi Gawat Darurat (IGD)</SelectItem>
              <SelectItem value='ward'>Ruang Rawat Inap</SelectItem>
              <SelectItem value='support'>Laboratorium & Penunjang</SelectItem>
              <SelectItem value='other'>Lainnya</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-1.5'>
          <Label htmlFor='queue-prefix' className='text-xs font-semibold'>
            Awalan Nomor Antrean (Boleh Kosong)
          </Label>
          <Input
            id='queue-prefix'
            placeholder='Contoh: PU, GIGI, KIA'
            maxLength={8}
            value={queuePrefix}
            onChange={(e) => onQueuePrefixChange(e.target.value.toUpperCase())}
            disabled={disabled}
            className='h-10 text-sm font-mono'
          />
          <p className='text-[11px] text-muted-foreground'>
            Huruf ini akan otomatis dicetak di depan nomor antrean pasien.
          </p>
        </div>
      </div>
    </div>
  );
}

export interface UnitLocationStepProps {
  floor: string;
  location: string;
  onFloorChange: (val: string) => void;
  onLocationChange: (val: string) => void;
  disabled?: boolean;
}

export function UnitLocationStep({
  floor,
  location,
  onFloorChange,
  onLocationChange,
  disabled
}: UnitLocationStepProps) {
  return (
    <div className='space-y-4 font-sans'>
      <div>
        <h3 className='text-base sm:text-lg font-bold tracking-tight text-foreground'>
          Lokasi dan Lantai Ruangan
        </h3>
        <p className='text-xs text-muted-foreground mt-0.5 leading-relaxed'>
          Tentukan lantai dan petunjuk arah agar pasien serta dokter mudah menemukan tempatnya.
        </p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1'>
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
    </div>
  );
}
